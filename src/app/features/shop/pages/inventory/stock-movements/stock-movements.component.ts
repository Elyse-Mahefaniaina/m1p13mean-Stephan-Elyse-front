import { Component, signal, computed, inject, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService, StockMovement } from '../../../../../core/services/stock.service';
import { MovementDetailModalComponent } from '../../../components/movement-detail-modal/movement-detail-modal.component';
import { MovementFormModalComponent } from '../../../components/movement-form-modal/movement-form-modal.component';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-stock-movements',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MovementDetailModalComponent,
        MovementFormModalComponent,
        ConfirmDialogComponent
    ],
    templateUrl: './stock-movements.component.html',
    styleUrl: './stock-movements.component.css'
})
export class StockMovementsComponent implements OnInit {
    @ViewChild(MovementDetailModalComponent) detailModal!: MovementDetailModalComponent;
    @ViewChild(MovementFormModalComponent) formModal!: MovementFormModalComponent;
    @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

    private stockService = inject(StockService);
    Math = Math;

    // Signals for state management
    loading = signal(true);
    searchTerm = signal('');
    typeFilter = signal<string>('all');
    statusFilter = signal<string>('all');
    currentPage = signal(1);
    pageSize = signal(10);
    movements = signal<StockMovement[]>([]);
    itemToDelete = signal<StockMovement | null>(null);

    constructor() {
        // Reset to page 1 when filters change
        effect(() => {
            this.searchTerm();
            this.typeFilter();
            this.statusFilter();
            this.currentPage.set(1);
        });
    }

    ngOnInit() {
        this.loadMovements();
    }

    loadMovements() {
        this.loading.set(true);
        this.stockService.getStockMovements().subscribe({
            next: (data: StockMovement[]) => {
                this.movements.set(data);
                this.loading.set(false);
            },
            error: (err: any) => {
                console.error('Error loading stock movements', err);
                // Mock data in case asset is missing
                this.movements.set([
                    { id: 'MOV-001', date: new Date(), productName: 'iPhone 15 Pro', sku: 'IP15P-256-BLU', type: 'in', quantity: 10, reason: 'Nouvel arrivage', user: 'Admin Jean', status: 'completed' },
                    { id: 'MOV-002', date: new Date(), productName: 'MacBook Air M2', sku: 'MBA-M2-512-SLV', type: 'out', quantity: -2, reason: 'Vente #4502', user: 'Vendeur Marc', status: 'completed' },
                    { id: 'MOV-003', date: new Date(), productName: 'AirPods Pro 2', sku: 'APP2-WHT', type: 'adjustment', quantity: -1, reason: 'Produit défectueux', user: 'Admin Jean', status: 'completed' }
                ]);
                this.loading.set(false);
            }
        });
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

    // Actions
    openCreateModal() {
        this.formModal.open();
    }

    openEditModal(movement: StockMovement) {
        this.formModal.openForEdit(movement);
    }

    openDetailModal(movement: StockMovement) {
        this.detailModal.open(movement);
    }

    openDeleteModal(movement: StockMovement) {
        this.itemToDelete.set(movement);
        this.confirmDialog.open();
    }

    onDeleteConfirmed() {
        const item = this.itemToDelete();
        if (item) {
            console.log('Suppression du mouvement:', item.id);
            this.movements.set(this.movements().filter(m => m.id !== item.id));
        }
        this.itemToDelete.set(null);
    }

    exportMovements() {
        console.log('Exportation des mouvements...');
        // Simulate export
        const data = this.filteredMovements();
        const csv = [
            ['ID', 'Date', 'Produit', 'SKU', 'Type', 'Quantité', 'Raison', 'Utilisateur', 'Statut'].join(','),
            ...data.map(m => [
                m.id,
                m.date,
                `"${m.productName}"`,
                m.sku,
                m.type,
                m.quantity,
                `"${m.reason}"`,
                m.user,
                m.status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mouvements-stock-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

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

    onPageChange(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }
}
