import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { BoxesComponent } from './pages/boxes/boxes.component';

export const ADMIN_ROUTES: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: AdminLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'boxes', component: BoxesComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    }
];
