import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';

export interface Promotion {
    id: string;
    name: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'scheduled' | 'expired' | 'suspended';
    usageCount: number;
    applicableTo: 'all' | 'category' | 'product';
}

@Injectable({
    providedIn: 'root'
})
export class PromotionService {
    private readonly promotionsUrl = 'assets/data/promotions.json';

    constructor(private http: HttpClient) { }

    getPromotions(): Observable<Promotion[]> {
        return this.http.get<Promotion[]>(this.promotionsUrl).pipe(
            tap(promotions => console.log('Promotions loaded:', promotions.length)),
            catchError(error => {
                console.error('Error loading promotions:', error);
                return throwError(() => error);
            })
        );
    }

    getPromotionById(id: string): Observable<Promotion | undefined> {
        return this.getPromotions().pipe(
            map(promotions => promotions.find(p => p.id === id))
        );
    }
}
