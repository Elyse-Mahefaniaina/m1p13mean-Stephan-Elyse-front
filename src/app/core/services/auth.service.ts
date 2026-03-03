import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
  private _baseUrl = environment.apiBaseUrl + "/auth";

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(this._baseUrl + '/login', {
      email: email,
      password: password
    });
  }

  logout() {
    localStorage.removeItem("currentUser");
    return this.http.post(this._baseUrl + '/logout', {});
  }
}
