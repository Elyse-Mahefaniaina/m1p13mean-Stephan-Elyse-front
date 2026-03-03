import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/services/product.service';

declare var bootstrap: any;

@Component({
    selector: 'app-product-detail-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './product-detail-modal.component.html',
    styleUrl: './product-detail-modal.component.css'
})
export class ProductDetailModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('detailModal') modalRef!: ElementRef;

    product: Product | null = null;
    private modalInstance: any;

    ngAfterViewInit(): void {
        this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement, {
            keyboard: true
        });
    }

    ngOnDestroy(): void {
        this.modalInstance?.dispose();
    }

    /** Open the modal with a product to display */
    open(product: Product): void {
        this.product = product;
        this.modalInstance?.show();
    }

    /** Close the modal */
    close(): void {
        this.modalInstance?.hide();
    }

    getStatusLabel(status?: string): string {
        switch (status) {
            case 'In Stock': return 'En Stock';
            case 'Low Stock': return 'Stock Faible';
            case 'Out of Stock': return 'Rupture';
            default: return status || 'N/A';
        }
    }

    getStatusBadgeClass(status?: string): string {
        switch (status) {
            case 'In Stock': return 'bg-success-subtle text-success border-success-subtle';
            case 'Low Stock': return 'bg-warning-subtle text-warning-emphasis border-warning-subtle';
            case 'Out of Stock': return 'bg-danger-subtle text-danger border-danger-subtle';
            default: return 'bg-secondary-subtle text-secondary border-secondary-subtle';
        }
    }
}
