import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map, forkJoin, of } from 'rxjs';
import { environment } from '../../../environments/environment';

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
    _id: number;
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
    private readonly categoriesUrl = '/assets/data/categories.json';
    private readonly productDetailsUrl = '/assets/data/product-details.json';
    private _baseUrl = environment.apiBaseUrl + "/products";

    constructor(private http: HttpClient) { }

    getProducts(): Observable<Product[]> {
      return this.http
        .get<{ count: number; data: any[] }>(this._baseUrl + '?$expand=details')
        .pipe(
          map(res =>
            res.data.map((p: any) => {
              const detail = p.details && p.details.length > 0 ? p.details[0] : null;

              return {
                _id: p._id,
                name: p.name,
                shop: p.shop || '',
                category: p.category,
                price: p.price,
                originalPrice: p.originalPrice,
                image: p.image,
                images: detail?.images || [],
                rating: p.rating,
                reviews: p.reviews,
                isWishlisted: false,
                stock: detail?.stock || 0,
                description: detail?.description || '',
                variants: detail?.variants || [],
                specifications: detail?.specifications || [],
                detailedReviews: detail?.detailedReviews || []
              } as Product;
            })
          ),
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
                catchError(() => of([]))
            )
        }).pipe(
            map(({ products, details }) => {
                const product = products.find(p => p._id === id);
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
