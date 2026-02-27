import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface StockOut {
    id: string;
    date: string | Date;
    productName: string;
    sku: string;
    quantity: number;
    destination: string;
    preparedBy: string;
    status: 'completed' | 'pending' | 'cancelled';
    notes?: string;
}

@Component({
    selector: 'app-stock-out',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './stock-out.component.html',
    styleUrl: './stock-out.component.css'
})
export class StockOutComponent implements OnInit {
    private http = inject(HttpClient);
    Math = Math;

    // Signals for state management
    loading = signal(true);
    searchTerm = signal('');
    statusFilter = signal<string>('all');
    currentPage = signal(1);
    pageSize = signal(10);
    entries = signal<StockOut[]>([]);

    ngOnInit() {
        this.loadEntries();
    }

    loadEntries() {
        this.loading.set(true);
        // Simulate API delay
        setTimeout(() => {
            this.http.get<StockOut[]>('assets/data/stock-out.json').subscribe({
                next: (data) => {
                    this.entries.set(data);
                    this.loading.set(false);
                },
                error: (err) => {
                    console.error('Error loading stock out entries', err);
                    this.loading.set(false);
                }
            });
        }, 800);
    }

    // Computed signals for filtering and pagination
    filteredEntries = computed(() => {
        let result = this.entries();
        const search = this.searchTerm().toLowerCase();
        const status = this.statusFilter();

        if (search) {
            result = result.filter(e =>
                e.productName.toLowerCase().includes(search) ||
                e.sku.toLowerCase().includes(search) ||
                e.destination.toLowerCase().includes(search) ||
                e.preparedBy.toLowerCase().includes(search) ||
                e.id.toLowerCase().includes(search)
            );
        }

        if (status !== 'all') {
            result = result.filter(e => e.status === status);
        }

        return result;
    });

    paginatedEntries = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        const end = start + this.pageSize();
        return this.filteredEntries().slice(start, end);
    });

    totalPages = computed(() => Math.ceil(this.filteredEntries().length / this.pageSize()));

    pages = computed(() => {
        const total = this.totalPages();
        return Array.from({ length: total }, (_, i) => i + 1);
    });

    // Stats computed signals
    stats = computed(() => {
        const all = this.entries();
        return {
            total: all.length,
            completed: all.filter(e => e.status === 'completed').length,
            pending: all.filter(e => e.status === 'pending').length,
            cancelled: all.filter(e => e.status === 'cancelled').length
        };
    });

    // Helper methods
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
            case 'completed': return 'Livré';
            case 'pending': return 'En cours';
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
