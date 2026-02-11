import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Category {
    name: string;
    icon: string;
    slug: string;
}

interface Product {
    id: number;
    name: string;
    shop: string;
    price: number;
    image: string;
    isWishlisted: boolean;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {
    protected readonly heroImageUrl = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200';
    protected readonly techBannerUrl = 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=800';
    protected readonly beautyBannerUrl = 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600';
    protected readonly homeDecorBannerUrl = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600';

    protected readonly categories: Category[] = [
        { name: 'Électronique', icon: 'bi-laptop', slug: 'electronique' },
        { name: 'Mode', icon: 'bi-handbag', slug: 'mode' },
        { name: 'Maison', icon: 'bi-house-heart', slug: 'maison' },
        { name: 'Sport', icon: 'bi-dribbble', slug: 'sport' }
    ];

    protected readonly popularProducts: Product[] = [
        {
            id: 1,
            name: 'MacBook Pro M3 Ultra',
            shop: 'TechZone',
            price: 2999000,
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800',
            isWishlisted: false
        },
        {
            id: 2,
            name: 'Sneakers Air Max Premium',
            shop: 'UrbanStyle',
            price: 189000,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
            isWishlisted: true
        },
        {
            id: 3,
            name: 'Canapé Design Scandinave',
            shop: 'MaisonChic',
            price: 899000,
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800',
            isWishlisted: false
        },
        {
            id: 4,
            name: 'Montre Connectée Elite',
            shop: 'SmartWear',
            price: 459000,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
            isWishlisted: false
        }
    ];

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
