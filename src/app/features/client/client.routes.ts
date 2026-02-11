import { Routes } from '@angular/router';
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';

export const CLIENT_ROUTES: Routes = [
    {
        path: '',
        component: ClientLayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'catalog', component: CatalogComponent },
            { path: 'product/:id', component: ProductDetailComponent },
            // Future routes:
            // { path: 'cart', component: CartComponent },
            // { path: 'wishlist', component: WishlistComponent },
            // { path: 'checkout', component: CheckoutComponent },
            // { path: 'orders', component: OrdersComponent },
            // { path: 'profile', component: ProfileComponent },
        ]
    }
];
