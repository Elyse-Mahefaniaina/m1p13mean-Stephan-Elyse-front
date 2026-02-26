import { Component, OnInit, signal, computed } from '@angular/core';
// Refresh comment
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShopService, Shop } from '../../../../core/services/shop.service';

@Component({
    selector: 'app-shops',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './shops.component.html',
    styleUrl: './shops.component.css'
})
export class ShopsComponent implements OnInit {
    private allShops = signal<Shop[]>([]);
    loading = signal(true);
    searchTerm = signal('');
    statusFilter = signal('all');

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
}
