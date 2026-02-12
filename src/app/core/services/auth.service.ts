import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly AUTH_KEY = 'mean_client_auth';
    private _isLoggedIn = signal<boolean>(this.getInitialAuthState());

    // Expose as read-only signal
    readonly isLoggedIn = this._isLoggedIn.asReadonly();

    private getInitialAuthState(): boolean {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(this.AUTH_KEY) === 'true';
        }
        return false;
    }

    login() {
        this._isLoggedIn.set(true);
        localStorage.setItem(this.AUTH_KEY, 'true');
    }

    logout() {
        this._isLoggedIn.set(false);
        localStorage.removeItem(this.AUTH_KEY);
    }
}
