import { Routes } from '@angular/router';
import { ShopLayoutComponent } from './layouts/shop-layout/shop-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { StockLevelComponent } from './pages/inventory/stock-level/stock-level.component';
import { StockEntriesComponent } from './pages/inventory/stock-entries/stock-entries.component';

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
            {
                path: 'inventory',
                children: [
                    { path: 'stock-level', component: StockLevelComponent },
                    { path: 'stock-entries', component: StockEntriesComponent }
                ]
            },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];
