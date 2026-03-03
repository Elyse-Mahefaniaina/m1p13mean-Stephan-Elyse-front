import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map, forkJoin, of } from 'rxjs';

export interface Category {
    name: string;
    icon: string;
    slug: string;
}

export interface Review {
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface Product {
    id: number | string;
    name: string;
    shop: string;
    category: string;
    price: number;
    originalPrice?: number;
    image: string;
    images?: string[];
    rating: number;
    reviews: number;
    isWishlisted: boolean;
    stock: number;
    minStock?: number;
    sku?: string;
    unit?: string;
    status?: 'In Stock' | 'Low Stock' | 'Out of Stock';
    lastUpdated?: string;
    description?: string;
    variants?: {
        type: string;
        options: string[];
    }[];
    specifications?: {
        key: string;
        value: string;
    }[];
    detailedReviews?: Review[];
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    // Using leading slash to ensure paths are always relative to root
    private readonly productsUrl = '/assets/data/products.json';
    private readonly categoriesUrl = '/assets/data/categories.json';
    private readonly productDetailsUrl = '/assets/data/product-details.json';

    constructor(private http: HttpClient) { }

    getProducts(): Observable<Product[]> {
        console.log('Fetching products from:', this.productsUrl);
        return this.http.get<Product[]>(this.productsUrl).pipe(
            tap(products => console.log('Products loaded:', products.length)),
            catchError(error => {
                console.error('Error loading products:', error);
                return throwError(() => error);
            })
        );
    }

    getProductById(id: number | string): Observable<Product | undefined> {
        return forkJoin({
            products: this.getProducts(),
            details: this.http.get<any[]>(this.productDetailsUrl).pipe(
                catchError(() => of([])) // In case the file doesn't exist or is empty
            )
        }).pipe(
            map(({ products, details }) => {
                const product = products.find(p => p.id === id);
                if (!product) return undefined;

                const detail = details.find(d => d.id === id);
                if (detail) {
                    return { ...product, ...detail };
                }
                return product;
            })
        );
    }

    getCategories(): Observable<Category[]> {
        console.log('Fetching categories from:', this.categoriesUrl);
        return this.http.get<Category[]>(this.categoriesUrl).pipe(
            tap(categories => console.log('Categories loaded:', categories.length)),
            catchError(error => {
                console.error('Error loading categories:', error);
                return throwError(() => error);
            })
        );
    }

    // --- CRUD Operations for Shop Management ---

    getShopProducts(): Observable<Product[]> {
        // In a real app, this would filter by the current shop's ID
        return this.http.get<Product[]>(this.productsUrl).pipe(
            map(products => products.map(p => ({
                ...p,
                sku: p.sku || `PROD-${p.id}`,
                unit: p.unit || 'unités',
                minStock: p.minStock || 5,
                status: this.calculateStatus(p.stock, p.minStock || 5)
            })))
        );
    }

    createProduct(product: Partial<Product>): Observable<Product> {
        console.log('Creating product:', product);
        return of({ ...product, id: Date.now() } as Product);
    }

    updateProduct(id: number | string, product: Partial<Product>): Observable<Product> {
        console.log('Updating product:', id, product);
        return of({ ...product, id } as Product);
    }

    deleteProduct(id: number | string): Observable<void> {
        console.log('Deleting product:', id);
        return of(undefined);
    }

    private calculateStatus(stock: number, minStock: number): 'In Stock' | 'Low Stock' | 'Out of Stock' {
        if (stock <= 0) return 'Out of Stock';
        if (stock <= minStock) return 'Low Stock';
        return 'In Stock';
    }
}
