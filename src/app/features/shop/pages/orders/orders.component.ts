import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface OrderItem {
    id: number;
    productName: string;
    quantity: number;
    price: number;
    total: number;
}

interface Order {
    id: string;
    customerName: string;
    date: string;
    totalAmount: number;
    itemCount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
    paymentStatus: 'paid' | 'pending' | 'refunded';
    items: OrderItem[];
}

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
    protected Math = Math;
    orders = signal<Order[]>([]);
    loading = signal(true);
    searchTerm = signal('');
    statusFilter = signal<string>('all');
    currentPage = signal(1);
    pageSize = signal(10);

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.loading.set(true);
        this.http.get<Order[]>('assets/data/orders.json').subscribe({
            next: (data) => {
                this.orders.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading orders:', err);
                this.loading.set(false);
            }
        });
    }

    filteredOrders = computed(() => {
        let filtered = this.orders();
        const search = this.searchTerm().toLowerCase();
        const status = this.statusFilter();

        if (search) {
            filtered = filtered.filter(o =>
                o.id.toLowerCase().includes(search) ||
                o.customerName.toLowerCase().includes(search)
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
        const all = this.orders();
        return {
            total: all.length,
            pending: all.filter(o => o.status === 'pending').length,
            completed: all.filter(o => o.status === 'completed' || o.status === 'delivered').length,
            revenue: all.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.totalAmount, 0)
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

    getPaymentStatusClass(status: string): string {
        switch (status) {
            case 'paid': return 'text-success bg-success-light';
            case 'pending': return 'text-warning bg-warning-light';
            case 'refunded': return 'text-danger bg-danger-light';
            default: return '';
        }
    }
}
