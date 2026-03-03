import { Component, OnInit, signal, computed, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Order } from '../../../../core/services/order.service';
import { OrderFormModalComponent } from '../../components/order-form-modal/order-form-modal.component';
import { OrderDetailModalComponent } from '../../components/order-detail-modal/order-detail-modal.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        OrderFormModalComponent,
        OrderDetailModalComponent,
        ConfirmDialogComponent
    ],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
    @ViewChild(OrderFormModalComponent) orderFormModal!: OrderFormModalComponent;
    @ViewChild(OrderDetailModalComponent) orderDetailModal!: OrderDetailModalComponent;
    @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

    private orderService = inject(OrderService);
    protected Math = Math;

    allOrders = signal<Order[]>([]);
    loading = signal(true);
    searchTerm = signal('');
    statusFilter = signal<string>('all');
    currentPage = signal(1);
    pageSize = signal(10);
    orderToDelete = signal<Order | null>(null);

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.loading.set(true);
        this.orderService.getOrders().subscribe({
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
            pending: all.filter(o => o.status === 'pending').length,
            completed: all.filter(o => o.status === 'completed' || o.status === 'delivered').length,
            revenue: all.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.total, 0)
        };
    });

    onPageChange(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'processing': return 'status-processing';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'pending': return 'En attente';
            case 'processing': return 'En préparation';
            case 'shipped': return 'Expédiée';
            case 'delivered': return 'Livrée';
            case 'completed': return 'Terminée';
            case 'cancelled': return 'Annulée';
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

    openCreateModal(): void {
        this.orderFormModal.open();
    }

    openDetailModal(order: Order): void {
        this.orderDetailModal.open(order);
    }

    openEditModal(order: Order): void {
        this.orderFormModal.openForEdit(order);
    }

    openDeleteModal(order: Order): void {
        this.orderToDelete.set(order);
        this.confirmDialog.open();
    }

    onDeleteConfirmed(): void {
        const order = this.orderToDelete();
        if (order) {
            this.orderService.deleteOrder(order.id).subscribe(() => {
                this.loadOrders();
            });
        }
        this.orderToDelete.set(null);
    }

    exportOrders(): void {
        this.orderService.exportOrders(this.filteredOrders());
    }
}

