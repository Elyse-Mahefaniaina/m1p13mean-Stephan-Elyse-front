import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { ToastService } from '../../../../core/services/toast.service';

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

    private downloadOrderRefPdf(orderRef: string, email: string): void {
        const safeRef = String(orderRef || '').trim() || 'commande';
        const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const lines = [
            'Commande - Reference',
            `Reference commande: ${safeRef}`,
            `Email client: ${email}`,
            `Date: ${dateStr}`
        ];

        const pdf = this.buildSimplePdf(lines);
        const blob = new Blob([pdf], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `commande_${safeRef}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    private buildSimplePdf(lines: string[]): string {
        const escapedLines = lines.map(line =>
            line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
        );

        const contentLines = escapedLines.map((line, idx) => {
            const y = 720 - idx * 24;
            return `BT /F1 18 Tf 72 ${y} Td (${line}) Tj ET`;
        });
        const content = contentLines.join('\n');
        const contentLength = content.length;

        const objects: string[] = [];
        objects.push('%PDF-1.4');
        objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
        objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
        objects.push(
            '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] ' +
            '/Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj'
        );
        objects.push('4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
        objects.push(`5 0 obj << /Length ${contentLength} >> stream\n${content}\nendstream endobj`);

        const xrefOffsets: number[] = [];
        let offset = 0;
        const parts: string[] = [];

        for (const obj of objects) {
            xrefOffsets.push(offset);
            parts.push(obj);
            offset += obj.length + 1;
        }

        const xrefStart = offset;
        parts.push('xref');
        parts.push(`0 ${objects.length + 1}`);
        parts.push('0000000000 65535 f ');
        for (const off of xrefOffsets) {
            parts.push(off.toString().padStart(10, '0') + ' 00000 n ');
        }
        parts.push('trailer << /Size ' + (objects.length + 1) + ' /Root 1 0 R >>');
        parts.push('startxref');
        parts.push(String(xrefStart));
        parts.push('%%EOF');

        return parts.join('\n');
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price).replace('€', 'Ar');
    }
}
