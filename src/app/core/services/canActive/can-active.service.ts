import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CanActiveService {
  private _baseUrl = environment.apiBaseUrl + "/can-active";

  constructor(private http: HttpClient) {}

  userCanActivePage(path: string) {
    return this.http.post(this._baseUrl, {
      path: path
    });
  }
}
