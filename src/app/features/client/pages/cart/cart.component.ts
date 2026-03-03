import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../core/services/toast.service';
import { jsPDF } from 'jspdf';
import * as QRCode from 'qrcode';

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
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './cart.component.html',
    styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
    private orderService = inject(OrderService);
    private toastService = inject(ToastService);

    cartItems = signal<CartItem[]>([]);
    email = signal('');

    shipping = 0;
    taxRate = 0.2;

    ngOnInit(): void {
        this.loadCartData();
        this.loadUserEmail();
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

    private loadUserEmail(): void {
        const raw = localStorage.getItem('currentUser');
        if (!raw) return;

        let user: any = null;
        try {
            user = JSON.parse(raw);
        } catch {
            user = raw;
        }

        const email =
            (user && typeof user === 'object' ? user.email : null) ||
            (typeof user === 'string' && user.includes('@') ? user : null);
        if (email) {
            this.email.set(email);
        }
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

    placeOrder(): void {
        const email = this.email().trim();
        if (!email) {
            this.toastService.show('Veuillez saisir votre email.', 'warning');
            return;
        }
        if (this.cartItems().length === 0) {
            this.toastService.show('Votre panier est vide.', 'warning');
            return;
        }

        const payload = {
            email,
            items: this.cartItems().map(item => ({
                product: item.id,
                quantity: item.quantity
            }))
        };

        this.orderService.createOrder(payload).subscribe({
            next: (res) => {
                this.toastService.show(`Commande créée (#${res.uuid})`, 'success');
                this.downloadOrderRefPdf(res.uuid, email);
                this.cartItems.set([]);
                localStorage.setItem('cart', JSON.stringify([]));
            },
            error: () => {
                this.toastService.show('Erreur lors de la création de la commande.', 'danger');
            }
        });
    }

    private async downloadOrderRefPdf(orderRef: string, email: string): Promise<void> {
        const safeRef = String(orderRef || '').trim() || 'commande';
        const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

        try {
            const qrPayload = `CMD:${safeRef}`;
            const qrDataUrl = await QRCode.toDataURL(qrPayload, {
                width: 512,
                margin: 2,
                errorCorrectionLevel: 'H'
            });

            const doc = new jsPDF({ unit: 'pt', format: 'a4' });
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(18);
            doc.text('Commande - Reference', 40, 50);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(12);
            doc.text(`Reference commande: ${safeRef}`, 40, 90);
            doc.text(`Email client: ${email}`, 40, 110);
            doc.text(`Date: ${dateStr}`, 40, 130);

            doc.addImage(qrDataUrl, 'PNG', 40, 160, 220, 220);
            doc.setFontSize(10);
            doc.text('Scanner ce QR pour verifier la reference de commande.', 40, 400);
            doc.setFontSize(9);
            doc.text(qrPayload, 40, 415);

            doc.save(`commande_${safeRef}.pdf`);
        } catch (err) {
            console.error('Error generating QR PDF', err);
            this.toastService.show('Erreur lors de la génération du PDF QR.', 'danger');
        }
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price).replace('€', 'Ar');
    }
}
