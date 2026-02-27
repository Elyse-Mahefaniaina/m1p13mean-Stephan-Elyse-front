import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface StockMovement {
    id: string;
    date: string | Date;
    productName: string;
    sku: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    reason: string;
    user: string;
    status: 'completed' | 'pending' | 'cancelled';
}

@Component({
    selector: 'app-stock-movements',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './stock-movements.component.html',
    styleUrl: './stock-movements.component.css'
})
export class StockMovementsComponent implements OnInit {
    private http = inject(HttpClient);
    Math = Math;

    // Signals for state management
    loading = signal(true);
    searchTerm = signal('');
    typeFilter = signal<string>('all');
    statusFilter = signal<string>('all');
    currentPage = signal(1);
    pageSize = signal(10);
    movements = signal<StockMovement[]>([]);

    ngOnInit() {
        this.loadMovements();
    }

    loadMovements() {
        this.loading.set(true);
        // Simulate API delay
        setTimeout(() => {
            this.http.get<StockMovement[]>('assets/data/stock-movements.json').subscribe({
                next: (data) => {
                    this.movements.set(data);
                    this.loading.set(false);
                },
                error: (err) => {
                    console.error('Error loading stock movements', err);
                    // Use mock data if JSON file is missing or errors
                    this.movements.set([
                        { id: 'MOV-001', date: new Date(), productName: 'iPhone 15 Pro', sku: 'IP15P-256-BLU', type: 'in', quantity: 10, reason: 'Nouvel arrivage', user: 'Admin Jean', status: 'completed' },
                        { id: 'MOV-002', date: new Date(), productName: 'MacBook Air M2', sku: 'MBA-M2-512-SLV', type: 'out', quantity: 2, reason: 'Vente #4502', user: 'Vendeur Marc', status: 'completed' },
                        { id: 'MOV-003', date: new Date(), productName: 'AirPods Pro 2', sku: 'APP2-WHT', type: 'adjustment', quantity: -1, reason: 'Produit défectueux', user: 'Admin Jean', status: 'completed' }
                    ]);
                    this.loading.set(false);
                }
            });
        }, 800);
    }

    // Computed signals for filtering and pagination
    filteredMovements = computed(() => {
        let result = this.movements();
        const search = this.searchTerm().toLowerCase();
        const type = this.typeFilter();
        const status = this.statusFilter();

        if (search) {
            result = result.filter(m =>
                m.productName.toLowerCase().includes(search) ||
                m.sku.toLowerCase().includes(search) ||
                m.reason.toLowerCase().includes(search) ||
                m.id.toLowerCase().includes(search)
            );
        }

        if (type !== 'all') {
            result = result.filter(m => m.type === type);
        }

        if (status !== 'all') {
            result = result.filter(m => m.status === status);
        }

        return result;
    });

    paginatedMovements = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        const end = start + this.pageSize();
        return this.filteredMovements().slice(start, end);
    });

    totalPages = computed(() => Math.ceil(this.filteredMovements().length / this.pageSize()));

    pages = computed(() => {
        const total = this.totalPages();
        return Array.from({ length: total }, (_, i) => i + 1);
    });

    // Stats computed signals
    stats = computed(() => {
        const all = this.movements();
        return {
            total: all.length,
            entries: all.filter(m => m.type === 'in').length,
            exits: all.filter(m => m.type === 'out').length,
            adjustments: all.filter(m => m.type === 'adjustment').length
        };
    });

    // Helper methods
    getTypeClass(type: string): string {
        switch (type) {
            case 'in': return 'type-in';
            case 'out': return 'type-out';
            case 'adjustment': return 'type-adjustment';
            default: return '';
        }
    }

    getTypeLabel(type: string): string {
        switch (type) {
            case 'in': return 'Entrée';
            case 'out': return 'Sortie';
            case 'adjustment': return 'Ajustement';
            default: return type;
        }
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'completed': return 'status-success';
            case 'pending': return 'status-warning';
            case 'cancelled': return 'status-danger';
            default: return '';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'completed': return 'Complété';
            case 'pending': return 'En attente';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    }

    onPageChange(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }
}
