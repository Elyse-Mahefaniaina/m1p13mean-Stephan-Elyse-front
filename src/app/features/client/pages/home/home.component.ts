import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService, Product, Category } from '../../../../core/services/product.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
    protected readonly heroImageUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200';
    protected readonly techBannerUrl = 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=800';
    protected readonly beautyBannerUrl = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600';
    protected readonly homeDecorBannerUrl = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600';

    protected categories = signal<Category[]>([]);
    protected popularProducts = signal<Product[]>([]);

    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        this.productService.getCategories().subscribe(categories => {
            this.categories.set(categories.slice(0, 4)); // Display first 4 on home
        });

        this.productService.getProducts().subscribe(products => {
            this.popularProducts.set(products.slice(0, 4)); // Display first 4 as popular
        });
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('fr-MG', {
            style: 'currency',
            currency: 'MGA',
            minimumFractionDigits: 0
        }).format(price);
    }

    toggleWishlist(product: Product): void {
        product.isWishlisted = !product.isWishlisted;
    }

    addToCart(product: Product): void {
        console.log('Added to cart:', product.name);
    }
}
