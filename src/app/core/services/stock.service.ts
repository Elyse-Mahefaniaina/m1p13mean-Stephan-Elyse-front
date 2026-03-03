import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';

export interface StockEntry {
    id: string;
    date: string | Date;
    productName: string;
    sku: string;
    quantity: number;
    supplier: string;
    receivedBy: string;
    status: 'completed' | 'pending' | 'cancelled';
    notes?: string;
}

export interface StockOut {
    id: string;
    date: string | Date;
    productName: string;
    sku: string;
    quantity: number;
    destination: string;
    preparedBy: string;
    status: 'completed' | 'pending' | 'cancelled';
    notes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private readonly entriesUrl = '/assets/data/stock-entries.json';
    private readonly outUrl = '/assets/data/stock-out.json';

    constructor(private http: HttpClient) { }

    getStockEntries(): Observable<StockEntry[]> {
        return this.http.get<StockEntry[]>(this.entriesUrl).pipe(
            tap(entries => console.log('Stock entries loaded:', entries.length)),
            catchError(error => {
                console.error('Error loading stock entries:', error);
                return throwError(() => error);
            })
        );
    }

    getStockEntryById(id: string): Observable<StockEntry | undefined> {
        return this.getStockEntries().pipe(
            map(entries => entries.find(e => e.id === id))
        );
    }

    getStockOuts(): Observable<StockOut[]> {
        return this.http.get<StockOut[]>(this.outUrl).pipe(
            tap(entries => console.log('Stock out entries loaded:', entries.length)),
            catchError(error => {
                console.error('Error loading stock out entries:', error);
                return throwError(() => error);
            })
        );
    }

    getStockOutById(id: string): Observable<StockOut | undefined> {
        return this.getStockOuts().pipe(
            map(entries => entries.find(e => e.id === id))
        );
    }
}
