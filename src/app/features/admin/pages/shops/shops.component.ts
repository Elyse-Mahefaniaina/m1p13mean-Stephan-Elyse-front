import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService, Shop } from '../../../../core/services/shop.service';
import { ShopFormModalComponent } from '../../components/shop-form-modal/shop-form-modal.component';
import { ShopDetailModalComponent } from '../../components/shop-detail-modal/shop-detail-modal.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-shops',
    standalone: true,
    imports: [CommonModule, FormsModule, ShopFormModalComponent, ShopDetailModalComponent, ConfirmDialogComponent],
    templateUrl: './shops.component.html',
    styleUrl: './shops.component.css'
})
export class ShopsComponent implements OnInit {
    @ViewChild(ShopFormModalComponent) shopFormModal!: ShopFormModalComponent;
    @ViewChild(ShopDetailModalComponent) shopDetailModal!: ShopDetailModalComponent;
    @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

    private allShops = signal<Shop[]>([]);
    loading = signal(true);
    searchTerm = signal('');
    statusFilter = signal('all');

    shopToDelete = signal<Shop | null>(null);

    // Computed filtered shops
    filteredShops = computed(() => {
        const shops = this.allShops();
        const search = this.searchTerm().toLowerCase();
        const status = this.statusFilter();

        return shops.filter(shop => {
            const matchesSearch = !search ||
                shop.name.toLowerCase().includes(search) ||
                shop.ownerName.toLowerCase().includes(search) ||
                shop.email.toLowerCase().includes(search) ||
                shop.category.toLowerCase().includes(search);

            const matchesStatus = status === 'all' || shop.status === status;

            return matchesSearch && matchesStatus;
        });
    });

    // Stats for shop management
    stats = signal([
        { label: 'Total Boutiques', value: 0, icon: 'bi-shop', color: 'primary' },
        { label: 'Actives', value: 0, icon: 'bi-check-circle-fill', color: 'success' },
        { label: 'En Attente', value: 0, icon: 'bi-hourglass-split', color: 'warning' },
        { label: 'Chiffre d\'Affaires', value: 0, icon: 'bi-cash-coin', color: 'info' }
    ]);

    constructor(private shopService: ShopService) { }

    ngOnInit(): void {
        this.shopService.getShops().subscribe({
            next: (data) => {
                this.allShops.set(data);
                this.calculateStats(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error fetching shops:', err);
                this.loading.set(false);
            }
        });
    }

    private calculateStats(shops: Shop[]): void {
        const total = shops.length;
        const active = shops.filter(s => s.status === 'active').length;
        const pending = shops.filter(s => s.status === 'pending').length;
        const totalRevenue = shops.reduce((sum, s) => sum + s.revenue, 0);

        this.stats.set([
            { label: 'Total Boutiques', value: total, icon: 'bi-shop', color: 'primary' },
            { label: 'Actives', value: active, icon: 'bi-check-circle-fill', color: 'success' },
            { label: 'En Attente', value: pending, icon: 'bi-hourglass-split', color: 'warning' },
            { label: 'Chiffre d\'Affaires', value: totalRevenue, icon: 'bi-cash-coin', color: 'info' }
        ]);
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'active': return 'status-active';
            case 'pending': return 'status-pending';
            case 'suspended': return 'status-suspended';
            case 'closed': return 'status-closed';
            default: return 'status-unknown';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'active': return 'Active';
            case 'pending': return 'En attente';
            case 'suspended': return 'Suspendue';
            case 'closed': return 'Fermée';
            default: return status;
        }
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('fr-MG', {
            style: 'currency',
            currency: 'MGA',
            minimumFractionDigits: 0
        }).format(price);
    }

    openCreateModal(): void {
        this.shopFormModal.open();
    }

    openDetailModal(shop: Shop): void {
        this.shopDetailModal.open(shop);
    }

    openEditModal(shop: Shop): void {
        this.shopFormModal.openForEdit(shop);
    }

    openDeleteModal(shop: Shop): void {
        this.shopToDelete.set(shop);
        this.confirmDialog.open();
    }

    onDeleteConfirmed(): void {
        const shop = this.shopToDelete();
        if (shop) {
            console.log('Delete confirmed for shop:', shop.id, shop.name);
            // Real deletion logic would go here
        }
        this.shopToDelete.set(null);
    }
}
