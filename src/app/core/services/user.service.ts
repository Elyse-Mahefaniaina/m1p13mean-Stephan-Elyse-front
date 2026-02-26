import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'shop' | 'client';
    status: 'active' | 'inactive' | 'pending';
    lastLogin: string | null;
    createdAt: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly usersUrl = '/assets/data/users.json';

    constructor(private http: HttpClient) { }

    getUsers(): Observable<User[]> {
        return this.http.get<User[]>(this.usersUrl).pipe(
            tap(users => console.log('Users loaded:', users.length)),
            catchError(error => {
                console.error('Error loading users:', error);
                return throwError(() => error);
            })
        );
    }

    getUserById(id: string): Observable<User | undefined> {
        return this.getUsers().pipe(
            map(users => users.find(u => u.id === id))
        );
    }
}
