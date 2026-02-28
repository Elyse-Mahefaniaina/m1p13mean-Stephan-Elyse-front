import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Promotion {
    id: string;
    name: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'scheduled' | 'expired';
    usageCount: number;
    applicableTo: 'all' | 'category' | 'product';
}

@Component({
    selector: 'app-promotions',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './promotions.component.html',
    styleUrl: './promotions.component.css'
})
export class PromotionsComponent {
    promotions = signal<Promotion[]>([
        {
            id: '1',
            name: 'Soldes d\'été',
            description: 'Promotion sur toute la collection d\'été',
            discountType: 'percentage',
            discountValue: 20,
            startDate: '2026-06-01',
            endDate: '2026-08-31',
            status: 'scheduled',
            usageCount: 0,
            applicableTo: 'all'
        },
        {
            id: '2',
            name: 'Offre Flash Week-end',
            description: 'Réduction immédiate sur les accessoires',
            discountType: 'fixed',
            discountValue: 15,
            startDate: '2026-02-27',
            endDate: '2026-03-01',
            status: 'active',
            usageCount: 45,
            applicableTo: 'category'
        },
        {
            id: '3',
            name: 'Promotion Déstockage',
            description: 'Dernière chance sur les articles sélectionnés',
            discountType: 'percentage',
            discountValue: 50,
            startDate: '2026-01-01',
            endDate: '2026-02-15',
            status: 'expired',
            usageCount: 120,
            applicableTo: 'product'
        },
        {
            id: '4',
            name: 'Nouveau Client',
            description: 'Bienvenue aux nouveaux clients de la boutique',
            discountType: 'percentage',
            discountValue: 10,
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            status: 'active',
            usageCount: 89,
            applicableTo: 'all'
        }
    ]);

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'active': return 'bg-success-subtle text-success border-success';
            case 'scheduled': return 'bg-primary-subtle text-primary border-primary';
            case 'expired': return 'bg-secondary-subtle text-secondary border-secondary';
            default: return 'bg-light text-dark';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'active': return 'Active';
            case 'scheduled': return 'Planifiée';
            case 'expired': return 'Terminée';
            default: return status;
        }
    }
}
