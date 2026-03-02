import { Routes } from '@angular/router';
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { WishlistComponent } from './pages/wishlist/wishlist.component';
import { LoginComponent } from './pages/login/login.component';

import { CartComponent } from './pages/cart/cart.component';

export const CLIENT_ROUTES: Routes = [
    {
        path: '',
        component: ClientLayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'catalog', component: CatalogComponent },
            { path: 'wishlist', component: WishlistComponent },
            { path: 'cart', component: CartComponent },
            { path: 'product/:id', component: ProductDetailComponent },
            { path: 'login', component: LoginComponent },
            // Future routes:
            // { path: 'checkout', component: CheckoutComponent },
            { path: 'orders', loadComponent: () => import('./pages/orders/orders.component').then(m => m.OrdersComponent) },
            // { path: 'profile', component: ProfileComponent },
        ]
    }
];
