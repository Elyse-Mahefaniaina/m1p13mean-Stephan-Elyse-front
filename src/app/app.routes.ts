import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    {
        path: 'shop',
        loadChildren: () => import('./features/shop/shop.routes').then(m => m.SHOP_ROUTES)
    },
    {
        path: 'client',
        loadChildren: () => import('./features/client/client.routes').then(m => m.CLIENT_ROUTES)
    },
    {
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'admin'
    }
];
