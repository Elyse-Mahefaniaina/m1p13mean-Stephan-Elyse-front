import { Routes } from '@angular/router';

export const SHOP_ROUTES: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login.component').then(m => m.ShopLoginComponent)
    },
    // { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) }
];
