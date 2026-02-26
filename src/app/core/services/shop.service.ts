import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';

export interface Shop {
    id: string;
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    category: string;
    status: 'active' | 'pending' | 'suspended' | 'closed';
    createdAt: string;
    boxNumber?: string;
    logo?: string;
    description: string;
    revenue: number;
}

@Injectable({
    providedIn: 'root'
})
export class ShopService {
    private readonly shopsUrl = '/assets/data/shops.json';

    constructor(private http: HttpClient) { }

    getShops(): Observable<Shop[]> {
        return this.http.get<Shop[]>(this.shopsUrl).pipe(
            tap(shops => console.log('Shops loaded:', shops.length)),
            catchError(error => {
                console.error('Error loading shops:', error);
                return throwError(() => error);
            })
        );
    }

    getShopById(id: string): Observable<Shop | undefined> {
        return this.getShops().pipe(
            map(shops => shops.find(s => s.id === id))
        );
    }
}
