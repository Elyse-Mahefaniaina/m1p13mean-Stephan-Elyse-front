import { Component } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterLink } from '@angular/router';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    today = new Date();

    // Stats data - will be populated from API later
    stats = [
        { label: 'Total Boutiques', value: 0, icon: 'bi-shop', color: 'primary' },
        { label: 'Boutiques Actifs', value: 0, icon: 'bi-check-circle-fill', color: 'success' },
        { label: 'En Attente', value: 0, icon: 'bi-hourglass-split', color: 'warning' },
        { label: 'Box Disponibles', value: 0, icon: 'bi-box-seam', color: 'info' }
    ];
}
