import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockOut } from '../../../../core/services/stock.service';

declare var bootstrap: any;

@Component({
    selector: 'app-stock-out-detail-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stock-out-detail-modal.component.html',
    styleUrl: './stock-out-detail-modal.component.css'
})
export class StockOutDetailModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('detailModal') modalRef!: ElementRef;

    entry: StockOut | null = null;
    private modalInstance: any;

    ngAfterViewInit(): void {
        this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement, {
            keyboard: true
        });
    }

    ngOnDestroy(): void {
        this.modalInstance?.dispose();
    }

    /** Open the modal with an entry to display */
    open(entry: StockOut): void {
        this.entry = entry;
        this.modalInstance?.show();
    }

    /** Close the modal */
    close(): void {
        this.modalInstance?.hide();
    }

    /** Get status label in French */
    getStatusLabel(status: string): string {
        switch (status) {
            case 'completed': return 'Livré';
            case 'pending': return 'En cours';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    }

    /** Get status color */
    getStatusColor(status: string): string {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'danger';
            default: return 'dark';
        }
    }

    /** Get status icon */
    getStatusIcon(status: string): string {
        switch (status) {
            case 'completed': return 'bi-check-circle-fill';
            case 'pending': return 'bi-clock-history';
            case 'cancelled': return 'bi-x-circle-fill';
            default: return 'bi-info-circle-fill';
        }
    }
}
