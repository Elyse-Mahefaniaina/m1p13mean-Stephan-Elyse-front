import { Component, OnInit, signal, computed, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order, OrderStatus } from '../../../../core/services/order.service';
import { OrderDetailModalComponent } from '../../components/order-detail-modal/order-detail-modal.component';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        OrderDetailModalComponent
    ],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
    @ViewChild(OrderDetailModalComponent) orderDetailModal!: OrderDetailModalComponent;

    private orderService = inject(OrderService);
    private authService = inject(AuthService);
    private router = inject(Router);
    private toastService = inject(ToastService);
    protected Math = Math;

    allOrders = signal<Order[]>([]);
    loading = signal(true);
    searchTerm = signal('');
    statusFilter = signal<string>('all');
    currentPage = signal(1);
    pageSize = signal(10);
    statusMenuFor = signal<string | null>(null);
    readonly statusOptions: OrderStatus[] = [
        'en_attente',
        'en_preparation',
        'expediee',
        'livree',
        'terminee',
        'annulee'
    ];

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.loading.set(true);
        const shopId = this.getShopId();
        if (!shopId) {
            this.loading.set(false);
            return;
        }
        this.orderService.getShopOrders(shopId).subscribe({
            next: (data) => {
                this.allOrders.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading orders:', err);
                this.loading.set(false);
            }
        });
    }

    filteredOrders = computed(() => {
        let filtered = this.allOrders();
        const search = this.searchTerm().toLowerCase();
        const status = this.statusFilter();

        if (search) {
            filtered = filtered.filter(o =>
                o.id.toLowerCase().includes(search) ||
                (o.customerName && o.customerName.toLowerCase().includes(search))
            );
        }

        if (status !== 'all') {
            filtered = filtered.filter(o => o.status === status);
        }

        return filtered;
    });

    paginatedOrders = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        return this.filteredOrders().slice(start, start + this.pageSize());
    });

    totalPages = computed(() => Math.ceil(this.filteredOrders().length / this.pageSize()));

    pages = computed(() => {
        const total = this.totalPages();
        return Array.from({ length: total }, (_, i) => i + 1);
    });

    stats = computed(() => {
        const all = this.allOrders();
        return {
            total: all.length,
            pending: all.filter(o => o.status === 'en_attente').length,
            completed: all.filter(o => o.status === 'livree' || o.status === 'terminee').length,
            revenue: all.filter(o => o.status !== 'annulee').reduce((acc, o) => acc + o.total, 0)
        };
    });

    onPageChange(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'en_attente': return 'status-pending';
            case 'en_preparation': return 'status-processing';
            case 'expediee': return 'status-shipped';
            case 'livree': return 'status-delivered';
            case 'terminee': return 'status-completed';
            case 'annulee': return 'status-cancelled';
            default: return '';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'en_attente': return 'En attente';
            case 'en_preparation': return 'En préparation';
            case 'expediee': return 'Expédiée';
            case 'livree': return 'Livrée';
            case 'terminee': return 'Terminée';
            case 'annulee': return 'Annulée';
            default: return status;
        }
    }

    getPaymentStatusClass(status?: string): string {
        switch (status) {
            case 'paid': return 'text-success bg-success-light';
            case 'pending': return 'text-warning bg-warning-light';
            case 'refunded': return 'text-danger bg-danger-light';
            default: return '';
        }
    }

    openDetailModal(order: Order): void {
        this.orderDetailModal.open(order);
    }

    exportOrders(): void {
        this.orderService.exportOrders(this.filteredOrders());
    }

    toggleStatusMenu(orderId: string): void {
        this.statusMenuFor.update(current => (current === orderId ? null : orderId));
    }

    onStatusChange(order: Order, status: OrderStatus): void {
        const items = order.commandeItems || [];
        const ids = items.map(i => i._id).filter((id): id is string => !!id);
        if (ids.length === 0) {
            this.toastService.show('Impossible de changer le statut (ID manquant).', 'warning');
            this.statusMenuFor.set(null);
            return;
        }

        forkJoin(ids.map(id => this.orderService.updateCommandeShopStatus(id, status))).subscribe({
            next: () => {
                const paymentStatus = status === 'terminee' ? 'paid' : 'pending';
                this.allOrders.update(list =>
                    list.map(o => o.id === order.id ? { ...o, status, paymentStatus } : o)
                );
                this.toastService.show('Statut mis à jour.', 'success');
                this.statusMenuFor.set(null);
            },
            error: () => {
                this.toastService.show('Erreur lors de la mise à jour du statut.', 'danger');
                this.statusMenuFor.set(null);
            }
        });
    }

    isStatusLocked(order: Order): boolean {
        return order.status === 'annulee' || order.status === 'terminee';
    }

    private getShopId(): string | null {
        const rawData = localStorage.getItem('currentUser');
        if (!rawData) {
            this.authService.logout().subscribe({
                next: () => this.router.navigate(['/shop/login'])
            });
            return null;
        }

        let user: any = null;
        try {
            user = JSON.parse(rawData);
        } catch {
            user = rawData;
        }

        const shop = (user && typeof user === 'object') ? user.shop : null;
        const shopId = shop?._id || shop;
        if (!shopId) {
            this.authService.logout().subscribe({
                next: () => this.router.navigate(['/shop/login'])
            });
            return null;
        }
        return shopId;
    }
}
