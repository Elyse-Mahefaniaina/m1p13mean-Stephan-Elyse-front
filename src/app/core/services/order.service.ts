import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export type OrderStatus =
    | 'en_attente'
    | 'en_preparation'
    | 'expediee'
    | 'livree'
    | 'terminee'
    | 'annulee';

export interface Order {
    id: string;
    date: string;
    customerName?: string;
    status: OrderStatus;
    paymentStatus?: 'paid' | 'pending' | 'refunded';
    total: number;
    itemsCount: number;
    items: OrderItem[];
    commandeItems?: CommandeShopItem[];
}

export interface CreateCommandeItem {
    product: string;
    quantity: number;
}

export interface CreateCommandePayload {
    email: string;
    items: CreateCommandeItem[];
}

export interface CommandeShopItem {
    _id?: string;
    commandeUuid: string;
    product: any;
    shop: any;
    quantity: number;
    status?: OrderStatus;
    commandeEmail?: string;
    createdAt?: string;
    modifiedAt?: string;
}

export interface CreateCommandeResponse {
    uuid: string;
    email: string;
    items: CommandeShopItem[];
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private readonly commandesUrl = environment.apiBaseUrl + '/commandes';
    private readonly commandeShopsUrl = environment.apiBaseUrl + '/commande-shops';

    constructor(private http: HttpClient) { }

    createOrder(payload: CreateCommandePayload): Observable<CreateCommandeResponse>;
    createOrder(payload: Partial<Order>): Observable<void>;
    createOrder(payload: any): Observable<any> {
        const isCommandePayload =
            payload && typeof payload === 'object' && 'email' in payload && 'items' in payload;
        if (!isCommandePayload) {
            console.warn('createOrder called with non-commande payload; ignoring.');
            return of(undefined);
        }

        return this.http.post<CreateCommandeResponse>(this.commandesUrl, payload).pipe(
            catchError(error => {
                console.error('Error creating order:', error);
                return throwError(() => error);
            })
        );
    }

    getShopOrders(shopId: string): Observable<Order[]> {
        const url = `${this.commandeShopsUrl}/shop/${shopId}?$expand=product,shop`;
        return this.http.get<any>(url).pipe(
            map(res => this.normalizeList<CommandeShopItem>(res)),
            map(items => this.groupByCommande(items)),
            tap(orders => console.log('Orders loaded:', orders.length)),
            catchError(error => {
                console.error('Error loading orders:', error);
                return throwError(() => error);
            })
        );
    }

    getCommandeItemsByUuid(uuid: string): Observable<CommandeShopItem[]> {
        const url = `${this.commandeShopsUrl}/commande/${uuid}`;
        return this.http.get<any>(url).pipe(
            map(res => this.normalizeList<CommandeShopItem>(res)),
            catchError(error => {
                console.error('Error loading commande items:', error);
                return throwError(() => error);
            })
        );
    }

    updateCommandeShopStatus(id: string, status: OrderStatus): Observable<CommandeShopItem> {
        return this.http.put<CommandeShopItem>(`${this.commandeShopsUrl}/${id}`, { status }).pipe(
            catchError(error => {
                console.error('Error updating commande shop status:', error);
                return throwError(() => error);
            })
        );
    }

    updateOrder(id: string, order: Partial<Order>): Observable<void> {
        console.warn('updateOrder is not implemented for commandes.');
        return of(undefined);
    }

    deleteOrder(id: string): Observable<void> {
        console.warn('deleteOrder is not implemented for commandes.');
        return of(undefined);
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

    private normalizeList<T>(res: any): T[] {
        if (Array.isArray(res)) return res as T[];
        if (res && Array.isArray(res.data)) return res.data as T[];
        return [];
    }

    private groupByCommande(items: CommandeShopItem[]): Order[] {
        const map = new Map<string, CommandeShopItem[]>();
        for (const item of items) {
            const key = item.commandeUuid || item._id || '';
            if (!key) continue;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(item);
        }

        return Array.from(map.entries()).map(([uuid, group]) => {
            const orderItems: OrderItem[] = group.map((g) => {
                const product = g.product || {};
                return {
                    id: String(g._id ?? product._id ?? ''),
                    name: product.name ?? 'Produit',
                    price: Number(product.price ?? 0),
                    quantity: Number(g.quantity ?? 0),
                    image: product.image
                };
            });

            const total = orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
            const date = group[0]?.createdAt || group[0]?.modifiedAt || new Date().toISOString();
            const email = group[0]?.commandeEmail;
            const statuses = new Set(group.map(g => g.status).filter(Boolean) as OrderStatus[]);
            const status =
                statuses.size === 1
                    ? (Array.from(statuses)[0] as OrderStatus)
                    : 'en_preparation';
            const paymentStatus = status === 'terminee' ? 'paid' : 'pending';

            return {
                id: uuid,
                date,
                customerName: email || 'Client',
                status: status || 'en_attente',
                paymentStatus,
                total,
                itemsCount: orderItems.length,
                items: orderItems,
                commandeItems: group
            } as Order;
        });
    }
}
