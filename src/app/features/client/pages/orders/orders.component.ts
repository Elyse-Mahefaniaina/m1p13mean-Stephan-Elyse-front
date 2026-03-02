import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface OrderItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface Order {
    id: string;
    date: string;
    status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
    total: number;
    itemsCount: number;
    items: OrderItem[];
}

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './orders.component.html',
    styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
    private http = inject(HttpClient);

    orders = signal<Order[]>([]);
    isLoading = signal(true);

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.isLoading.set(true);
        this.http.get<Order[]>('/assets/data/orders.json').subscribe({
            next: (data) => {
                this.orders.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading orders:', err);
                this.isLoading.set(false);
            }
        });
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'delivered': return 'bg-success-subtle text-success';
            case 'shipped': return 'bg-primary-subtle text-primary';
            case 'processing': return 'bg-warning-subtle text-warning';
            case 'cancelled': return 'bg-danger-subtle text-danger';
            default: return 'bg-secondary-subtle text-secondary';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'delivered': return 'Livré';
            case 'shipped': return 'En cours de livraison';
            case 'processing': return 'En préparation';
            case 'cancelled': return 'Annulé';
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

    formatDate(dateStr: string): string {
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date(dateStr));
    }
}
