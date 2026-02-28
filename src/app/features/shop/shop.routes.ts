import { Routes } from '@angular/router';
import { ShopLayoutComponent } from './layouts/shop-layout/shop-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { StockLevelComponent } from './pages/inventory/stock-level/stock-level.component';
import { StockEntriesComponent } from './pages/inventory/stock-entries/stock-entries.component';
import { StockOutComponent } from './pages/inventory/stock-out/stock-out.component';
import { StockMovementsComponent } from './pages/inventory/stock-movements/stock-movements.component';
import { OrdersComponent } from './pages/orders/orders.component';

import { PromotionsComponent } from './pages/promotions/promotions.component';

export const SHOP_ROUTES: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        component: ShopLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'orders', component: OrdersComponent },
            { path: 'promotions', component: PromotionsComponent },
            {
                path: 'inventory',
                children: [
                    { path: 'stock-level', component: StockLevelComponent },
                    { path: 'stock-entries', component: StockEntriesComponent },
                    { path: 'stock-out', component: StockOutComponent },
                    { path: 'stock-movements', component: StockMovementsComponent }
                ]
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];
