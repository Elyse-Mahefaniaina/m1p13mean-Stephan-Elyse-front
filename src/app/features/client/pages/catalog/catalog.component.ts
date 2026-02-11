import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Category {
    name: string;
    icon: string;
    slug: string;
    checked: boolean;
}

interface Product {
    id: number;
    name: string;
    shop: string;
    category: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    reviews: number;
    isWishlisted: boolean;
}

type SortOption = 'popular' | 'newest' | 'price-asc' | 'price-desc';

@Component({
    selector: 'app-catalog',
    standalone: true,
    imports: [RouterLink, FormsModule],
    templateUrl: './catalog.component.html',
    styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {
    // --- Filter State ---
    protected searchQuery = signal('');
    protected priceMin = signal<number | null>(null);
    protected priceMax = signal<number | null>(null);
    protected minRating = signal(0);
    protected sortBy = signal<SortOption>('popular');
    protected currentPage = signal(1);
    protected readonly productsPerPage = 9;
    protected isMobileFiltersOpen = signal(false);

    // --- Data ---
    protected readonly categories = signal<Category[]>([
        { name: 'Électronique', icon: 'bi-laptop', slug: 'electronique', checked: false },
        { name: 'Mode', icon: 'bi-handbag', slug: 'mode', checked: false },
        { name: 'Maison', icon: 'bi-house-heart', slug: 'maison', checked: false },
        { name: 'Sport', icon: 'bi-dribbble', slug: 'sport', checked: false },
        { name: 'Beauté', icon: 'bi-droplet', slug: 'beaute', checked: false },
        { name: 'Alimentation', icon: 'bi-cup-hot', slug: 'alimentation', checked: false }
    ]);

    protected readonly allProducts = signal<Product[]>([
        {
            id: 1, name: 'MacBook Pro M3 Ultra', shop: 'TechZone', category: 'Électronique',
            price: 2999000, originalPrice: 3499000,
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600',
            rating: 5, reviews: 128, isWishlisted: false
        },
        {
            id: 2, name: 'Sneakers Air Max Premium', shop: 'UrbanStyle', category: 'Mode',
            price: 189000,
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
            rating: 4, reviews: 89, isWishlisted: true
        },
        {
            id: 3, name: 'Canapé Design Scandinave', shop: 'MaisonChic', category: 'Maison',
            price: 899000,
            image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600',
            rating: 5, reviews: 42, isWishlisted: false
        },
        {
            id: 4, name: 'Montre Connectée Elite', shop: 'SmartWear', category: 'Électronique',
            price: 459000, originalPrice: 599000,
            image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
            rating: 4, reviews: 215, isWishlisted: false
        },
        {
            id: 5, name: 'Casque Audio Studio Pro', shop: 'TechZone', category: 'Électronique',
            price: 349000,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
            rating: 5, reviews: 312, isWishlisted: false
        },
        {
            id: 6, name: 'Sac à Main Cuir Milano', shop: 'LuxeBag', category: 'Mode',
            price: 275000, originalPrice: 350000,
            image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=600',
            rating: 4, reviews: 67, isWishlisted: false
        },
        {
            id: 7, name: 'Lampe Design Articulée', shop: 'MaisonChic', category: 'Maison',
            price: 145000,
            image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?auto=format&fit=crop&q=80&w=600',
            rating: 3, reviews: 29, isWishlisted: false
        },
        {
            id: 8, name: 'Ballon de Football Pro', shop: 'SportMax', category: 'Sport',
            price: 55000,
            image: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?auto=format&fit=crop&q=80&w=600',
            rating: 4, reviews: 156, isWishlisted: false
        },
        {
            id: 9, name: 'Sérum Visage Premium', shop: 'GlowUp', category: 'Beauté',
            price: 89000, originalPrice: 120000,
            image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600',
            rating: 5, reviews: 203, isWishlisted: false
        },
        {
            id: 10, name: 'Clavier Mécanique RGB', shop: 'TechZone', category: 'Électronique',
            price: 199000,
            image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
            rating: 4, reviews: 178, isWishlisted: false
        },
        {
            id: 11, name: 'Tapis de Yoga Premium', shop: 'SportMax', category: 'Sport',
            price: 65000,
            image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&q=80&w=600',
            rating: 4, reviews: 94, isWishlisted: false
        },
        {
            id: 12, name: 'Parfum Élégance Noire', shop: 'GlowUp', category: 'Beauté',
            price: 135000,
            image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600',
            rating: 5, reviews: 187, isWishlisted: false
        }
    ]);

    // --- Computed ---
    protected readonly selectedCategories = computed(() =>
        this.categories().filter(c => c.checked).map(c => c.name)
    );

    protected readonly filteredProducts = computed(() => {
        const search = this.searchQuery().toLowerCase();
        const pMin = this.priceMin();
        const pMax = this.priceMax();
        const rating = this.minRating();
        const selCats = this.selectedCategories();
        const sort = this.sortBy();

        let results = this.allProducts().filter(p => {
            if (search && !p.name.toLowerCase().includes(search) && !p.shop.toLowerCase().includes(search)) return false;
            if (pMin !== null && p.price < pMin) return false;
            if (pMax !== null && p.price > pMax) return false;
            if (selCats.length > 0 && !selCats.includes(p.category)) return false;
            if (p.rating < rating) return false;
            return true;
        });

        switch (sort) {
            case 'popular': results.sort((a, b) => b.reviews - a.reviews); break;
            case 'newest': results.sort((a, b) => b.id - a.id); break;
            case 'price-asc': results.sort((a, b) => a.price - b.price); break;
            case 'price-desc': results.sort((a, b) => b.price - a.price); break;
        }

        return results;
    });

    protected readonly totalPages = computed(() =>
        Math.ceil(this.filteredProducts().length / this.productsPerPage)
    );

    protected readonly paginatedProducts = computed(() => {
        const start = (this.currentPage() - 1) * this.productsPerPage;
        return this.filteredProducts().slice(start, start + this.productsPerPage);
    });

    protected readonly paginationPages = computed(() => {
        const total = this.totalPages();
        const current = this.currentPage();
        const pages: (number | '...')[] = [];

        if (total <= 5) {
            for (let i = 1; i <= total; i++) pages.push(i);
        } else {
            pages.push(1);
            if (current > 3) pages.push('...');
            for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                pages.push(i);
            }
            if (current < total - 2) pages.push('...');
            pages.push(total);
        }
        return pages;
    });

    constructor(private route: ActivatedRoute) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            if (params['category']) {
                this.categories.update(cats =>
                    cats.map(c => ({ ...c, checked: c.name === params['category'] }))
                );
            }
            if (params['search']) {
                this.searchQuery.set(params['search']);
            }
        });
    }

    // --- Actions ---
    onSearchChange(value: string): void {
        this.searchQuery.set(value);
        this.currentPage.set(1);
    }

    onPriceMinChange(value: string): void {
        this.priceMin.set(value ? Number(value) : null);
        this.currentPage.set(1);
    }

    onPriceMaxChange(value: string): void {
        this.priceMax.set(value ? Number(value) : null);
        this.currentPage.set(1);
    }

    toggleCategory(index: number): void {
        this.categories.update(cats =>
            cats.map((c, i) => i === index ? { ...c, checked: !c.checked } : c)
        );
        this.currentPage.set(1);
    }

    removeCategoryByName(name: string): void {
        const index = this.categories().findIndex(c => c.name === name);
        if (index !== -1) {
            this.toggleCategory(index);
        }
    }

    setRatingFilter(rating: number): void {
        this.minRating.set(rating);
        this.currentPage.set(1);
    }

    onSortChange(value: string): void {
        this.sortBy.set(value as SortOption);
        this.currentPage.set(1);
    }

    goToPage(page: number | '...'): void {
        if (page === '...' || page < 1 || page > this.totalPages()) return;
        this.currentPage.set(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    resetFilters(): void {
        this.searchQuery.set('');
        this.priceMin.set(null);
        this.priceMax.set(null);
        this.minRating.set(0);
        this.sortBy.set('popular');
        this.categories.update(cats => cats.map(c => ({ ...c, checked: false })));
        this.currentPage.set(1);
    }

    toggleMobileFilters(): void {
        this.isMobileFiltersOpen.update(v => !v);
    }

    toggleWishlist(product: Product, event: Event): void {
        event.stopPropagation();
        this.allProducts.update(products =>
            products.map(p => p.id === product.id ? { ...p, isWishlisted: !p.isWishlisted } : p)
        );
    }

    addToCart(product: Product, event: Event): void {
        event.stopPropagation();
        console.log('Added to cart:', product.name);
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
