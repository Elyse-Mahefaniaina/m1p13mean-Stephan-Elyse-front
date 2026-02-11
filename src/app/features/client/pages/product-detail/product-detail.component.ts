import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../../../core/services/product.service';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './product-detail.component.html',
    styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
    protected product = signal<Product | null>(null);
    protected loading = signal(true);
    protected quantity = signal(1);
    protected selectedVariants = signal<Record<string, string>>({});
    protected activeTab = signal<'description' | 'reviews'>('description');
    protected mainImage = signal<string | null>(null);

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (id) {
            this.productService.getProductById(id).subscribe({
                next: (product) => {
                    if (product) {
                        this.product.set(product);
                        this.mainImage.set(product.image);

                        // Initialize variants
                        if (product.variants) {
                            const variants: Record<string, string> = {};
                            product.variants.forEach(v => {
                                variants[v.type] = v.options[0];
                            });
                            this.selectedVariants.set(variants);
                        }
                    }
                    this.loading.set(false);
                },
                error: (err) => {
                    console.error(err);
                    this.loading.set(false);
                }
            });
        }
    }

    protected updateQuantity(delta: number): void {
        const current = this.quantity();
        const stock = this.product()?.stock || 0;
        this.quantity.set(Math.max(1, Math.min(stock, current + delta)));
    }

    protected selectVariant(type: string, value: string): void {
        this.selectedVariants.update(v => ({ ...v, [type]: value }));
    }

    protected setMainImage(img: string): void {
        this.mainImage.set(img);
    }

    protected setTab(tab: 'description' | 'reviews'): void {
        this.activeTab.set(tab);
    }

    protected formatPrice(price: number): string {
        return new Intl.NumberFormat('fr-MG', {
            style: 'currency',
            currency: 'MGA',
            minimumFractionDigits: 0
        }).format(price);
    }

    protected getDiscount(): number {
        const p = this.product();
        if (!p || !p.originalPrice) return 0;
        return Math.round((1 - p.price / p.originalPrice) * 100);
    }

    protected getStars(rating: number): boolean[] {
        return Array.from({ length: 5 }, (_, i) => i < rating);
    }

    protected addToCart(): void {
        const p = this.product();
        if (p) {
            console.log('Added to cart:', p.name, 'Qty:', this.quantity(), 'Variants:', this.selectedVariants());
        }
    }

    protected toggleWishlist(): void {
        const p = this.product();
        if (p) {
            p.isWishlisted = !p.isWishlisted;
        }
    }
}
