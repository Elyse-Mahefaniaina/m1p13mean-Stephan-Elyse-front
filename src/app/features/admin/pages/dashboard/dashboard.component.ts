import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterLink } from '@angular/router';
import localeFr from '@angular/common/locales/fr';
import { ShopService } from '../../../../core/services/shop.service';
import { BoxService } from '../../../../core/services/box.service';
import { forkJoin } from 'rxjs';

registerLocaleData(localeFr);

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    today = new Date();
    private shopService = inject(ShopService);
    private boxService = inject(BoxService);

    // Stats data
    stats: any[] = [
        { label: 'Total Boutiques', value: 0, icon: 'bi-shop', color: 'primary' },
        { label: 'Boutiques Actifs', value: 0, icon: 'bi-check-circle-fill', color: 'success' },
        { label: 'En Attente', value: 0, icon: 'bi-hourglass-split', color: 'warning' },
        { label: 'Box Disponibles', value: 0, icon: 'bi-box-seam', color: 'info' }
    ];

    ngOnInit(): void {
        forkJoin({
            shops: this.shopService.getShops(),
            boxes: this.boxService.getBoxes()
        }).subscribe({
            next: ({ shops, boxes }) => {
                this.stats = [
                    { label: 'Total Boutiques', value: shops.length, icon: 'bi-shop', color: 'primary' },
                    { label: 'Boutiques Actifs', value: shops.filter(s => s.status === 'active').length, icon: 'bi-check-circle-fill', color: 'success' },
                    { label: 'En Attente', value: shops.filter(s => s.status === 'pending').length, icon: 'bi-hourglass-split', color: 'warning' },
                    { label: 'Box Disponibles', value: boxes.filter(b => b.status === 'free').length, icon: 'bi-box-seam', color: 'info' }
                ];
            }
        });
    }
}
