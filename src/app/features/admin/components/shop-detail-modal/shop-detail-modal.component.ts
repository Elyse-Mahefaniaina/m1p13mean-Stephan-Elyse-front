import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Shop } from '../../../../core/services/shop.service';

declare var bootstrap: any;

@Component({
    selector: 'app-shop-detail-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './shop-detail-modal.component.html',
    styleUrl: './shop-detail-modal.component.css'
})
export class ShopDetailModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('detailModal') modalRef!: ElementRef;

    shop: Shop | null = null;
    private modalInstance: any;

    ngAfterViewInit(): void {
        this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement, {
            backdrop: 'static',
            keyboard: true
        });
    }

    ngOnDestroy(): void {
        this.modalInstance?.dispose();
    }

    open(shop: Shop): void {
        this.shop = shop;
        this.modalInstance?.show();
    }

    close(): void {
        this.modalInstance?.hide();
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'active': return 'Active';
            case 'pending': return 'En attente';
            case 'suspended': return 'Suspendue';
            case 'closed': return 'Fermée';
            default: return status;
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'suspended': return 'danger';
            case 'closed': return 'secondary';
            default: return 'dark';
        }
    }

    formatPrice(price: number): string {
        return new Intl.NumberFormat('fr-MG', {
            style: 'currency',
            currency: 'MGA',
            minimumFractionDigits: 0
        }).format(price);
    }
}
