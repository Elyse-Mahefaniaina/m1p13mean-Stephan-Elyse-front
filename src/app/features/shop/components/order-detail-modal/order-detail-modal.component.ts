import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order, OrderService } from '../../../../core/services/order.service';

declare var bootstrap: any;

@Component({
    selector: 'app-order-detail-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './order-detail-modal.component.html',
    styleUrl: './order-detail-modal.component.css'
})
export class OrderDetailModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('detailModal') modalRef!: ElementRef;

    order: Order | null = null;
    private modalInstance: any;

    ngAfterViewInit(): void {
        this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement, {
            keyboard: true
        });
    }

    ngOnDestroy(): void {
        this.modalInstance?.dispose();
    }

    /** Open the modal with an order to display */
    open(order: Order): void {
        this.order = order;
        this.modalInstance?.show();
    }

    /** Close the modal */
    close(): void {
        this.modalInstance?.hide();
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'pending': return 'En attente';
            case 'processing': return 'En préparation';
            case 'shipped': return 'Expédiée';
            case 'delivered': return 'Livrée';
            case 'completed': return 'Terminée';
            case 'cancelled': return 'Annulée';
            default: return status;
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'pending': return 'warning';
            case 'processing': return 'primary';
            case 'shipped': return 'info';
            case 'delivered': return 'success';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            default: return 'secondary';
        }
    }

    getPaymentStatusLabel(status?: string): string {
        switch (status) {
            case 'paid': return 'Payé';
            case 'pending': return 'En attente';
            case 'refunded': return 'Remboursé';
            default: return 'Inconnu';
        }
    }
}
