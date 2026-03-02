import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../core/services/product.service';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './product-card.component.html',
    styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
    @Input({ required: true }) product!: Product;
    @Output() toggleWishlist = new EventEmitter<Product>();
    @Output() addToCart = new EventEmitter<Product>();

    onToggleWishlist(event: Event): void {
        event.stopPropagation();
        this.toggleWishlist.emit(this.product);
    }

    onAddToCart(event: Event): void {
        event.stopPropagation();
        this.addToCart.emit(this.product);
    }

    getDiscount(product: Product): number {
        if (!product.originalPrice) return 0;
        return Math.round((1 - product.price / product.originalPrice) * 100);
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('fr-MG', {
            style: 'currency',
            currency: 'MGA',
            minimumFractionDigits: 0
        }).format(price);
    }

    getStars(rating: number): boolean[] {
        return Array.from({ length: 5 }, (_, i) => i < rating);
    }
}
