import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface Box {
    id: string;
    number: string;
    zone: string;
    dimensions: string;
    connections: string[];
    status: 'occupied' | 'free' | 'reserved' | 'under_repair';
    currentShopId: number | null;
    currentShopName: string;
    rent: number;
    charges: number;
    entryDate: string | null;
    exitDate: string | null;
    paymentDay: number;
}

@Injectable({
    providedIn: 'root'
})
export class BoxService {
    private readonly boxesUrl = '/assets/data/boxes.json';

    constructor(private http: HttpClient) { }

    getBoxes(): Observable<Box[]> {
        return this.http.get<Box[]>(this.boxesUrl).pipe(
            tap(boxes => console.log('Boxes loaded:', boxes.length)),
            catchError(error => {
                console.error('Error loading boxes:', error);
                return throwError(() => error);
            })
        );
    }
}
