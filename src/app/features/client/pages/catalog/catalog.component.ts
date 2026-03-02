import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product, Category as BaseCategory } from '../../../../core/services/product.service';

interface Category extends BaseCategory {
    checked: boolean;
}

type SortOption = 'popular' | 'newest' | 'price-asc' | 'price-desc';

import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
    selector: 'app-catalog',
    standalone: true,
    imports: [RouterLink, FormsModule, ProductCardComponent],
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
    protected readonly categories = signal<Category[]>([]);
    protected readonly allProducts = signal<Product[]>([]);

    // --- Computed ---
    protected readonly selectedCategories = computed(() =>
        this.categories().filter(c => c.checked).map(c => c.name)
    );

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService
    ) { }

    ngOnInit(): void {
        this.productService.getCategories().subscribe(categories => {
            const mappedCategories = categories.map(c => ({ ...c, checked: false }));
            this.categories.set(mappedCategories);

            // Handle query params after categories are loaded
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
        });

        this.productService.getProducts().subscribe(products => {
            this.allProducts.set(products);
        });
    }

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

    toggleWishlist(product: Product): void {
        this.allProducts.update(products =>
            products.map(p => p.id === product.id ? { ...p, isWishlisted: !p.isWishlisted } : p)
        );
    }

    addToCart(product: Product): void {
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
