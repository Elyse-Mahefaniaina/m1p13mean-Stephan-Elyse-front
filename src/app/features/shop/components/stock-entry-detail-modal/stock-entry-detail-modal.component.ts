import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockEntry } from '../../../../core/services/stock.service';

declare var bootstrap: any;

@Component({
    selector: 'app-stock-entry-detail-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './stock-entry-detail-modal.component.html',
    styleUrl: './stock-entry-detail-modal.component.css'
})
export class StockEntryDetailModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('detailModal') modalRef!: ElementRef;

    entry: StockEntry | null = null;
    private modalInstance: any;

    ngAfterViewInit(): void {
        this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement, {
            keyboard: true
        });
    }

    ngOnDestroy(): void {
        this.modalInstance?.dispose();
    }

    open(entry: StockEntry): void {
        this.entry = entry;
        this.modalInstance?.show();
    }

    close(): void {
        this.modalInstance?.hide();
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'completed': return 'Complété';
            case 'pending': return 'En attente';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'completed': return 'bi-check-circle-fill';
            case 'pending': return 'bi-clock-history';
            case 'cancelled': return 'bi-x-circle-fill';
            default: return 'bi-info-circle';
        }
    }
}
