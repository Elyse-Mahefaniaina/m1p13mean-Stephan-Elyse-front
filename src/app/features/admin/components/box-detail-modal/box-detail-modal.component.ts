import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Box } from '../../../../core/services/box.service';

declare var bootstrap: any;

@Component({
    selector: 'app-box-detail-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './box-detail-modal.component.html',
    styleUrl: './box-detail-modal.component.css'
})
export class BoxDetailModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('detailModal') modalRef!: ElementRef;

    box: Box | null = null;
    private modalInstance: any;

    ngAfterViewInit(): void {
        this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement, {
            keyboard: true
        });
    }

    ngOnDestroy(): void {
        this.modalInstance?.dispose();
    }

    /** Open the modal with a box to display */
    open(box: Box): void {
        this.box = box;
        this.modalInstance?.show();
    }

    /** Close the modal */
    close(): void {
        this.modalInstance?.hide();
    }

    /** Get status label in French */
    getStatusLabel(status: string): string {
        switch (status) {
            case 'occupied': return 'Occupé';
            case 'free': return 'Libre';
            case 'reserved': return 'Réservé';
            case 'under_repair': return 'En travaux';
            default: return status;
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
