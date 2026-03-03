import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Shop {
    _id: string;
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
  private _baseUrl = environment.apiBaseUrl + "/shops";


  constructor(private http: HttpClient) { }

  getShops() {
    return this.http.get(this._baseUrl);
  }

  saveOne(shop: Shop) {
    return this.http.post(this._baseUrl, shop);
  }

  findOne(id: string) {
    this.http.get(this._baseUrl+'/'+id);
  }

  updadteOne(shop: Shop, id: string) {
    return this.http.put(this._baseUrl+'/'+id, shop);
  }

  deleteOne(id: string) {
    return this.http.delete(this._baseUrl+'/'+id);
  }
}
