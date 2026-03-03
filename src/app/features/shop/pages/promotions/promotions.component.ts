import { Component, OnInit, signal, computed, inject, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromotionService, Promotion } from '../../../../core/services/promotion.service';
import { PromotionFormModalComponent } from '../../components/promotion-form-modal/promotion-form-modal.component';
import { PromotionDetailModalComponent } from '../../components/promotion-detail-modal/promotion-detail-modal.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-promotions',
    standalone: true,
    imports: [CommonModule, FormsModule, PromotionFormModalComponent, PromotionDetailModalComponent, ConfirmDialogComponent],
    templateUrl: './promotions.component.html',
    styleUrl: './promotions.component.css'
})
export class PromotionsComponent implements OnInit {
    @ViewChild(PromotionFormModalComponent) promotionFormModal!: PromotionFormModalComponent;
    @ViewChild(PromotionDetailModalComponent) promotionDetailModal!: PromotionDetailModalComponent;
    @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

    private promotionService = inject(PromotionService);
    protected Math = Math;

    // Signals
    allPromotions = signal<Promotion[]>([]);
    loading = signal(true);
    currentPage = signal(1);
    pageSize = signal(10);
    searchTerm = signal('');
    statusFilter = signal('all');

    constructor() {
        effect(() => {
            this.searchTerm();
            this.statusFilter();
            this.currentPage.set(1);
        }, { allowSignalWrites: true });
    }

    ngOnInit(): void {
        this.loadPromotions();
    }

    private loadPromotions(): void {
        this.promotionService.getPromotions().subscribe({
            next: (data) => {
                this.allPromotions.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error fetching promotions:', err);
                this.loading.set(false);
            }
        });
    }

    // Computed filtered promotions
    filteredPromotions = computed(() => {
        const promotions = this.allPromotions();
        const search = this.searchTerm().toLowerCase();
        const status = this.statusFilter();

        return promotions.filter(promo => {
            const matchesSearch = !search ||
                promo.name.toLowerCase().includes(search) ||
                promo.description.toLowerCase().includes(search);

            const matchesStatus = status === 'all' || promo.status === status;

            return matchesSearch && matchesStatus;
        });
    });

    // Paginated promotions
    paginatedPromotions = computed(() => {
        const filtered = this.filteredPromotions();
        const start = (this.currentPage() - 1) * this.pageSize();
        return filtered.slice(start, start + this.pageSize());
    });

    // Total pages
    totalPages = computed(() => Math.ceil(this.filteredPromotions().length / this.pageSize()));

    // Page numbers array
    pages = computed(() => {
        const total = this.totalPages();
        return Array.from({ length: total }, (_, i) => i + 1);
    });

    onPageChange(page: number): void {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }

    // Stats
    stats = computed(() => {
        const promos = this.allPromotions();
        return [
            { label: 'Promotions Totales', value: promos.length, icon: 'bi-megaphone-fill', color: 'primary' },
            { label: 'Offres Actives', value: promos.filter(p => p.status === 'active').length, icon: 'bi-check-circle-fill', color: 'success' },
            { label: 'Prochainement', value: promos.filter(p => p.status === 'scheduled').length, icon: 'bi-clock-history', color: 'warning' },
            { label: 'Terminées', value: promos.filter(p => p.status === 'expired').length, icon: 'bi-calendar-x', color: 'secondary' }
        ];
    });

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'active': return 'bg-success-subtle text-success border-success';
            case 'scheduled': return 'bg-primary-subtle text-primary border-primary';
            case 'expired': return 'bg-secondary-subtle text-secondary border-secondary';
            case 'suspended': return 'bg-dark-subtle text-dark border-dark';
            default: return 'bg-light text-dark';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'active': return 'Active';
            case 'scheduled': return 'Planifiée';
            case 'expired': return 'Terminée';
            case 'suspended': return 'Suspendue';
            default: return status;
        }
    }

    // Actions
    openCreateModal(): void {
        this.promotionFormModal.open();
    }

    openEditModal(promotion: Promotion): void {
        this.promotionFormModal.openForEdit(promotion);
    }

    openDetailModal(promotion: Promotion): void {
        this.promotionDetailModal.open(promotion);
    }

    togglePause(promotion: Promotion): void {
        const newStatus = promotion.status === 'suspended' ? 'active' : 'suspended';
        console.log(`Setting promotion ${promotion.id} to ${newStatus}`);
        // Logic will be added when backend is ready
        this.allPromotions.update(promos =>
            promos.map(p => p.id === promotion.id ? { ...p, status: newStatus as any } : p)
        );
    }

    exportPromotions(): void {
        console.log('Exporting promotions to CSV/Excel...');
        const promos = this.filteredPromotions();
        // Mock export
        const csvContent = promos.map(p => `${p.name},${p.discountValue},${p.status}`).join('\n');
        console.log('Export data:', csvContent);
    }

    // Delete Logic
    promotionToDelete = signal<Promotion | null>(null);

    openDeleteModal(promotion: Promotion): void {
        this.promotionToDelete.set(promotion);
        this.confirmDialog.open();
    }

    onDeleteConfirmed(): void {
        const promo = this.promotionToDelete();
        if (promo) {
            console.log('Deleting promotion:', promo.id);
            this.allPromotions.update(promos => promos.filter(p => p.id !== promo.id));
        }
        this.promotionToDelete.set(null);
    }
}
