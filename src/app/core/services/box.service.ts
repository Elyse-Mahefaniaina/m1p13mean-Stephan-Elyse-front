import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Box {
    _id: string;
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
    private _baseUrl = environment.apiBaseUrl + "/boxes";

    constructor(private http: HttpClient) { }

    getBoxes() {
      return this.http.get(this._baseUrl);
    }

    saveOne(box: Box) {
      return this.http.post(this._baseUrl, box);
    }

    findOne(id: string) {
      this.http.get(this._baseUrl+'/'+id);
    }

    updadteOne(box: Box, id: string) {
      return this.http.put(this._baseUrl+'/'+id, box);
    }

    deleteOne(id: string) {
      return this.http.delete(this._baseUrl+'/'+id);
    }
}
