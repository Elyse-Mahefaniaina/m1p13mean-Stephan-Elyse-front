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
    id: number;
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

    getProductById(id: number): Observable<Product | undefined> {
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
}
