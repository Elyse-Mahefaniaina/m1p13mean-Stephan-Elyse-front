import { Component, signal, computed, inject, OnInit, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService, StockEntry } from '../../../../../core/services/stock.service';
import { StockEntryFormModalComponent } from '../../../components/stock-entry-form-modal/stock-entry-form-modal.component';
import { StockEntryDetailModalComponent } from '../../../components/stock-entry-detail-modal/stock-entry-detail-modal.component';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-stock-entries',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        StockEntryFormModalComponent,
        StockEntryDetailModalComponent,
        ConfirmDialogComponent
    ],
    templateUrl: './stock-entries.component.html',
    styleUrl: './stock-entries.component.css'
})
export class StockEntriesComponent implements OnInit {
    @ViewChild(StockEntryFormModalComponent) entryFormModal!: StockEntryFormModalComponent;
    @ViewChild(StockEntryDetailModalComponent) entryDetailModal!: StockEntryDetailModalComponent;
    @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

    private stockService = inject(StockService);
    Math = Math;

    // Signals for state management
    loading = signal(true);
    searchTerm = signal('');
    statusFilter = signal<string>('all');
    currentPage = signal(1);
    pageSize = signal(10);
    allEntries = signal<StockEntry[]>([]);
    entryToDelete = signal<StockEntry | null>(null);

    constructor() {
        // Reset to first page when search or filters change
        effect(() => {
            this.searchTerm();
            this.statusFilter();
            this.currentPage.set(1);
        }, { allowSignalWrites: true });
    }

    ngOnInit() {
        this.loadEntries();
    }

    loadEntries() {
        this.loading.set(true);
        this.stockService.getStockEntries().subscribe({
            next: (data: StockEntry[]) => {
                this.allEntries.set(data);
                this.loading.set(false);
            },
            error: (err: any) => {
                console.error('Error loading stock entries', err);
                this.loading.set(false);
            }
        });
    }

    // Computed signals for filtering and pagination
    filteredEntries = computed(() => {
        let result = this.allEntries();
        const search = this.searchTerm().toLowerCase();
        const status = this.statusFilter();

        if (search) {
            result = result.filter(e =>
                e.productName.toLowerCase().includes(search) ||
                e.sku.toLowerCase().includes(search) ||
                e.supplier.toLowerCase().includes(search) ||
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
        const all = this.allEntries();
        return {
            total: all.length,
            completed: all.filter(e => e.status === 'completed').length,
            pending: all.filter(e => e.status === 'pending').length,
            cancelled: all.filter(e => e.status === 'cancelled').length
        };
    });

    // CRUD Handlers
    openCreateModal(): void {
        this.entryFormModal.open();
    }

    openDetailModal(entry: StockEntry): void {
        this.entryDetailModal.open(entry);
    }

    openEditModal(entry: StockEntry): void {
        this.entryFormModal.openForEdit(entry);
    }

    openDeleteModal(entry: StockEntry): void {
        this.entryToDelete.set(entry);
        this.confirmDialog.open();
    }

    onDeleteConfirmed(): void {
        const entry = this.entryToDelete();
        if (entry) {
            // Business logic for deletion
            console.log('Suppression de l\'entrée:', entry.id);
            this.allEntries.update(entries => entries.filter(e => e.id !== entry.id));
        }
        this.entryToDelete.set(null);
    }

    onEntrySaved(event: { isEdit: boolean, data: Partial<StockEntry>, id?: string }): void {
        if (event.isEdit && event.id) {
            // Update logic
            this.allEntries.update(entries => entries.map(e =>
                e.id === event.id ? { ...e, ...event.data } as StockEntry : e
            ));
        } else {
            // Create logic
            const newEntry: StockEntry = {
                ...(event.data as StockEntry),
                id: Math.random().toString(36).substr(2, 6).toUpperCase(),
                date: new Date().toISOString(),
                receivedBy: 'Admin (Moi)', // Default for demo
                status: (event.data.status as any) || 'pending'
            };
            this.allEntries.update(entries => [newEntry, ...entries]);
        }
    }

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
