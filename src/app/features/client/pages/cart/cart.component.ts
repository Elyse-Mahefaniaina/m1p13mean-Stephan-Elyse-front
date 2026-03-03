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

    cartItems = signal<CartItem[]>([]);

    shipping = 0;
    taxRate = 0.2;

    ngOnInit(): void {
        this.loadCartData();
    }

    private loadCartData(): void {
      const data = localStorage.getItem('cart');
      let cart = data ? JSON.parse(data) : [];

      const cartItems: CartItem[] = cart.map((p: any) => ({
        id: p._id,
        name: p.name,
        price: p.price,
        image: p.image,
        quantity: p.quantity || 1,
        category: p.category
      }));
      this.cartItems.set(cartItems);
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
      const updatedItems = this.cartItems().filter(i => i.id !== item.id);
      this.cartItems.set(updatedItems);

      const storedCart = localStorage.getItem('cart');
      const cart = storedCart ? JSON.parse(storedCart) : [];
      const newCart = cart.filter((p: any) => p._id !== item.id);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price).replace('€', 'Ar');
    }
}
