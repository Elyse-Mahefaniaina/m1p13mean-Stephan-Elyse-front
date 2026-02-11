import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../../../core/services/product.service';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './wishlist.component.html',
    styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
    protected wishlistProducts: Product[] = [];
    protected isLoading = true;

    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        this.loadWishlist();
    }

    loadWishlist(): void {
        this.isLoading = true;
        this.productService.getProducts().subscribe({
            next: (products) => {
                // For now, we simulate wishlist items by filtering products that have isWishlisted: true
                // In a real app, this would be fetched from a dedicated wishlist service or user profile
                this.wishlistProducts = products.filter(p => p.isWishlisted);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading wishlist:', err);
                this.isLoading = false;
            }
        });
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('fr-MG', {
            style: 'currency',
            currency: 'MGA',
            minimumFractionDigits: 0
        }).format(price);
    }

    removeFromWishlist(product: Product): void {
        // Animation logic can be handled via CSS/Angular animations
        this.wishlistProducts = this.wishlistProducts.filter(p => p.id !== product.id);

        // In a real app, we would call the service here
        console.log('Removed from wishlist:', product.name);
    }

    addToCart(product: Product): void {
        console.log('Added to cart:', product.name);
        // Logic to add to cart service would go here
    }

    clearWishlist(): void {
        if (confirm('Voulez-vous vraiment vider votre liste de souhaits ?')) {
            this.wishlistProducts = [];
        }
    }
}
