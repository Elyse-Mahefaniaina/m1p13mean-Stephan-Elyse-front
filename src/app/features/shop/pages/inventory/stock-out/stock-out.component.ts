import { Component, signal, computed, inject, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService, StockOut } from '../../../../../core/services/stock.service';
import { StockOutFormModalComponent } from '../../../components/stock-out-form-modal/stock-out-form-modal.component';
import { StockOutDetailModalComponent } from '../../../components/stock-out-detail-modal/stock-out-detail-modal.component';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-stock-out',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        StockOutFormModalComponent,
        StockOutDetailModalComponent,
        ConfirmDialogComponent
    ],
    templateUrl: './stock-out.component.html',
    styleUrl: './stock-out.component.css'
})
export class StockOutComponent implements OnInit {
    @ViewChild(StockOutFormModalComponent) formModal!: StockOutFormModalComponent;
    @ViewChild(StockOutDetailModalComponent) detailModal!: StockOutDetailModalComponent;
    @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

    private stockService = inject(StockService);
    protected Math = Math;

    // State Signals
    loading = signal(true);
    allEntries = signal<StockOut[]>([]);
    searchTerm = signal('');
    statusFilter = signal('all');
    currentPage = signal(1);
    pageSize = signal(10);
    entryToDelete = signal<StockOut | null>(null);

    constructor() {
        // Reset page when filters change
        effect(() => {
            this.searchTerm();
            this.statusFilter();
            this.currentPage.set(1);
        }, { allowSignalWrites: true });
    }

    ngOnInit(): void {
        this.loadEntries();
    }

    loadEntries(): void {
        this.loading.set(true);
        this.stockService.getStockOuts().subscribe({
            next: (data) => {
                this.allEntries.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error fetching stock outs:', err);
                this.loading.set(false);
            }
        });
    }

    // Computed: Filtered list
    filteredEntries = computed(() => {
        const entries = this.allEntries();
        const search = this.searchTerm().toLowerCase();
        const status = this.statusFilter();

        return entries.filter(e => {
            const matchesSearch = !search ||
                e.productName.toLowerCase().includes(search) ||
                e.sku.toLowerCase().includes(search) ||
                e.destination.toLowerCase().includes(search);

            const matchesStatus = status === 'all' || e.status === status;

            return matchesSearch && matchesStatus;
        });
    });

    // Computed: Paginated list
    paginatedEntries = computed(() => {
        const filtered = this.filteredEntries();
        const start = (this.currentPage() - 1) * this.pageSize();
        return filtered.slice(start, start + this.pageSize());
    });

    // Computed: Pagination data
    totalPages = computed(() => Math.ceil(this.filteredEntries().length / this.pageSize()));
    pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

    // Computed: Stats
    stats = computed(() => {
        const all = this.allEntries();
        return [
            { label: 'Total Sorties', value: all.length, icon: 'bi-box-arrow-right', color: 'primary' },
            { label: 'Livré / Terminé', value: all.filter(e => e.status === 'completed').length, icon: 'bi-check-circle', color: 'success' },
            { label: 'En attente', value: all.filter(e => e.status === 'pending').length, icon: 'bi-clock-history', color: 'warning' },
            { label: 'Annulé', value: all.filter(e => e.status === 'cancelled').length, icon: 'bi-x-circle', color: 'danger' }
        ];
    });

    // Event Handlers
    onPageChange(page: number): void {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }

    openCreateModal(): void {
        this.formModal.open();
    }

    openDetailModal(entry: StockOut): void {
        this.detailModal.open(entry);
    }

    openEditModal(entry: StockOut): void {
        this.formModal.openForEdit(entry);
    }

    openDeleteModal(entry: StockOut): void {
        this.entryToDelete.set(entry);
        this.confirmDialog.open();
    }

    onDeleteConfirmed(): void {
        const entry = this.entryToDelete();
        if (entry) {
            // Simulated delete
            this.allEntries.update(entries => entries.filter(e => e.id !== entry.id));
            console.log('Deleted entry:', entry.id);
        }
        this.entryToDelete.set(null);
    }

    onEntrySaved(updatedEntry: StockOut): void {
        const entries = this.allEntries();
        const index = entries.findIndex(e => e.id === updatedEntry.id);

        if (index > -1) {
            // Update
            const newEntries = [...entries];
            newEntries[index] = updatedEntry;
            this.allEntries.set(newEntries);
        } else {
            // Create
            this.allEntries.set([updatedEntry, ...entries]);
        }
    }

    // Badge Helpers
    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'completed': return 'bg-success-subtle text-success-emphasis border-success-subtle';
            case 'pending': return 'bg-warning-subtle text-warning-emphasis border-warning-subtle';
            case 'cancelled': return 'bg-danger-subtle text-danger border-danger-subtle';
            default: return 'bg-secondary-subtle text-secondary-emphasis border-secondary-subtle';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'completed': return 'Terminé';
            case 'pending': return 'En attente';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    }
}
