import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../../../core/services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [CommonModule, RouterLink, ProductCardComponent],
    templateUrl: './wishlist.component.html',
    styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
    private http = inject(HttpClient);

    wishlistProducts = signal<Product[]>([]);
    isLoading = signal<boolean>(true);

    ngOnInit(): void {
        this.loadWishlist();
    }

    loadWishlist(): void {
        this.isLoading.set(true);
        this.http.get<Product[]>('/assets/data/wishlist.json').subscribe({
            next: (products) => {
                this.wishlistProducts.set(products);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Error loading wishlist:', err);
                this.isLoading.set(false);
            }
        });
    }

    onToggleWishlist(product: Product): void {
        // Since we are in the favorites page, toggling wishlist usually means removing it
        this.removeFromWishlist(product);
    }

    removeFromWishlist(product: Product): void {
        this.wishlistProducts.set(this.wishlistProducts().filter(p => p.id !== product.id));
    }

    addToCart(product: Product): void {
        console.log('Added to cart:', product.name);
        // Implement cart logic later
    }

    clearWishlist(): void {
        if (confirm('Voulez-vous vraiment vider votre liste de souhaits ?')) {
            this.wishlistProducts.set([]);
        }
    }
}
