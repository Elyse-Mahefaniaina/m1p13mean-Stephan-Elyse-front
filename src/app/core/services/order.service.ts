import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';

export interface OrderItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface Order {
    id: string;
    date: string;
    customerName?: string; // Added to match component usage
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';
    paymentStatus?: 'paid' | 'pending' | 'refunded'; // Added to match component usage
    total: number;
    itemsCount: number;
    items: OrderItem[];
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private readonly ordersUrl = 'assets/data/orders.json';

    constructor(private http: HttpClient) { }

    getOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.ordersUrl).pipe(
            map(orders => orders.map(order => ({
                ...order,
                customerName: order.customerName || 'Client anonyme',
                paymentStatus: order.paymentStatus || 'paid'
            }))),
            tap(orders => console.log('Orders loaded:', orders.length)),
            catchError(error => {
                console.error('Error loading orders:', error);
                return throwError(() => error);
            })
        );
    }

    getOrderById(id: string): Observable<Order | undefined> {
        return this.getOrders().pipe(
            map(orders => orders.find(o => o.id === id))
        );
    }

    // Mock methods for CRUD
    createOrder(order: Partial<Order>): Observable<void> {
        console.log('Creating order:', order);
        return new Observable(subscriber => {
            setTimeout(() => {
                subscriber.next();
                subscriber.complete();
            }, 500);
        });
    }

    updateOrder(id: string, order: Partial<Order>): Observable<void> {
        console.log('Updating order:', id, order);
        return new Observable(subscriber => {
            setTimeout(() => {
                subscriber.next();
                subscriber.complete();
            }, 500);
        });
    }

    deleteOrder(id: string): Observable<void> {
        console.log('Deleting order:', id);
        return new Observable(subscriber => {
            setTimeout(() => {
                subscriber.next();
                subscriber.complete();
            }, 500);
        });
    }

    exportOrders(orders: Order[]): void {
        console.log('Exporting orders:', orders.length);
        const data = orders.map(o => ({
            ID: o.id,
            Date: o.date,
            Client: o.customerName,
            Total: o.total,
            Statut: o.status,
            Paiement: o.paymentStatus
        }));

        const csvContent = "data:text/csv;charset=utf-8,"
            + Object.keys(data[0]).join(",") + "\n"
            + data.map(row => Object.values(row).join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `commandes_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
