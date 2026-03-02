import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    category: string;
}

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
    private http = inject(HttpClient);

    // Initial state empty, will be loaded from JSON
    cartItems = signal<CartItem[]>([]);

    shipping = 0;
    taxRate = 0.2; // 20%

    ngOnInit(): void {
        this.loadCartData();
    }

    private loadCartData(): void {
        this.http.get<CartItem[]>('/assets/data/cart-items.json').subscribe({
            next: (data) => {
                this.cartItems.set(data);
            },
            error: (err) => {
                console.error('Failed to load cart data', err);
            }
        });
    }

    get subtotal() {
        return this.cartItems().reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0);
    }

    get tax() {
        return this.subtotal * this.taxRate;
    }

    get total() {
        return this.subtotal + this.tax + this.shipping;
    }

    updateQuantity(item: CartItem, delta: number) {
        const newItems = this.cartItems().map((i: CartItem) => {
            if (i.id === item.id) {
                const newQty = Math.max(1, i.quantity + delta);
                return { ...i, quantity: newQty };
            }
            return i;
        });
        this.cartItems.set(newItems);
    }

    removeItem(item: CartItem) {
        this.cartItems.set(this.cartItems().filter((i: CartItem) => i.id !== item.id));
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price).replace('€', 'Ar');
    }
}
