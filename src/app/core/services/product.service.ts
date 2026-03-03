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
    private readonly categoriesUrl = '/assets/data/categories.json';
    private readonly productDetailsUrl = '/assets/data/product-details.json';
    private readonly productsUrl = '/assets/data/product-details.json';
    private _baseUrl = environment.apiBaseUrl + "/products";

    constructor(private http: HttpClient) { }

    private getStoredWishlistIds(): string[] {
      const data = localStorage.getItem('wishlist');
      if (!data) return [];

      try {
        const wishlist: any[] = JSON.parse(data);
        return wishlist.map(item => item._id).filter(Boolean) as string[];
      } catch (e) {
        console.error('Erreur lors de la lecture de la wishlist depuis localStorage', e);
        return [];
      }
    }

    getProducts(): Observable<Product[]> {
      const wishlistIds = this.getStoredWishlistIds();
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
                isWishlisted: wishlistIds.includes(p._id),
                stock: detail?.stock || 0,
                description: detail?.description || '',
                variants: detail?.variants || [],
                specifications: detail?.specifications || [],
                detailedReviews: detail?.detailedReviews || []
              } as Product;
            })
          ),
          tap(),
          catchError(error => {
            console.error('Error loading products:', error);
            return throwError(() => error);
          })
        );
    }

    getProductById(id: string): Observable<Product | undefined> {
      const wishlistIds = this.getStoredWishlistIds();
      return this.http
        .get<any>(`${this._baseUrl}/${id}?$expand=details`)
        .pipe(
          map(p => {
            if (!p) return undefined;

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
              isWishlisted: wishlistIds.includes(p._id),
              stock: detail?.stock || 0,
              description: detail?.description || '',
              variants: detail?.variants || [],
              specifications: detail?.specifications || [],
              detailedReviews: detail?.detailedReviews || []
            } as Product;
          }),
          catchError(error => {
            console.error('Error loading product by id:', error);
            return of(undefined);
          })
        );
    }

    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.categoriesUrl).pipe(
            tap(),
            catchError(error => {
                console.error('Error loading categories:', error);
                return throwError(() => error);
            })
        );
    }

    getShopProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.productsUrl).pipe(
            map(products => products.map(p => ({
                ...p,
                sku: p.sku || `PROD-${p._id}`,
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
