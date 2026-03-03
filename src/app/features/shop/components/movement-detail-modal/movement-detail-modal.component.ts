import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StockMovement } from '../../../../core/services/stock.service';

declare var bootstrap: any;

@Component({
    selector: 'app-movement-detail-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './movement-detail-modal.component.html',
    styleUrl: './movement-detail-modal.component.css'
})
export class MovementDetailModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('detailModal') modalRef!: ElementRef;

    movement: StockMovement | null = null;
    private modalInstance: any;

    ngAfterViewInit(): void {
        this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement);
    }

    ngOnDestroy(): void {
        this.modalInstance?.dispose();
    }

    open(movement: StockMovement): void {
        this.movement = movement;
        this.modalInstance?.show();
    }

    close(): void {
        this.modalInstance?.hide();
    }

    getTypeColor(type: string): string {
        switch (type) {
            case 'in': return 'success';
            case 'out': return 'danger';
            case 'adjustment': return 'warning';
            default: return 'secondary';
        }
    }

    getTypeIcon(type: string): string {
        switch (type) {
            case 'in': return 'bi-box-arrow-in-down';
            case 'out': return 'bi-box-arrow-up';
            case 'adjustment': return 'bi-tools';
            default: return 'bi-info-circle';
        }
    }

    getTypeLabel(type: string): string {
        switch (type) {
            case 'in': return 'Entrée';
            case 'out': return 'Sortie';
            case 'adjustment': return 'Ajustement';
            default: return type;
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'completed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'completed': return 'Terminé';
            case 'pending': return 'En attente';
            case 'cancelled': return 'Annulé';
            default: return status;
        }
    }
}
