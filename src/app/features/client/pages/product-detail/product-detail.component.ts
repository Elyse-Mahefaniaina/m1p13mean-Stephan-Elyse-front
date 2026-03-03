import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService, Product } from '../../../../core/services/product.service';
import { CommonModule } from '@angular/common';

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
    protected cartAnimation = signal(false);

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService,
        private router: Router
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.productService.getProductById(id).subscribe({
                next: (product) => {
                    if (product) {
                        this.product.set(product);
                        this.mainImage.set(product.image);

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
      const product = this.product();

      if(product == null) return;

      const data = localStorage.getItem('cart');
      let cart = data ? JSON.parse(data) : [];

      const exists = cart.some((p: any) => p._id === product._id);

      if (!exists) {
        cart.push({ ...product, quantity: 1 });
      } else {
        cart = cart.map((p: any ) =>
          p._id === product._id ? { ...p, quantity: (p.quantity || 1) + 1 } : p
        );
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      this.cartAnimation.set(true);
      setTimeout(() => {
        this.cartAnimation.set(false),
        this.router.navigate(['/client/cart'])
      }, 2000);
    }

    protected toggleWishlist(): void {
      const p = this.product();
      if (!p) return;

      p.isWishlisted = !p.isWishlisted;

      const wishRawData = localStorage.getItem("wishlist");
      let wishData: Product[] = wishRawData ? JSON.parse(wishRawData) : [];

      if (p.isWishlisted) {
        const exists = wishData.some(w => w._id === p._id);
        if (!exists) {
          wishData.push(p);
        }
      } else {
        wishData = wishData.filter(w => w._id !== p._id);
      }

      localStorage.setItem("wishlist", JSON.stringify(wishData));
    }
}
