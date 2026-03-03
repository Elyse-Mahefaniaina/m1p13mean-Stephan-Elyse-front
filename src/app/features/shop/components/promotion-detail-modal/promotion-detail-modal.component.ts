import { Component, ElementRef, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Promotion } from '../../../../core/services/promotion.service';

@Component({
    selector: 'app-promotion-detail-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './promotion-detail-modal.component.html',
    styleUrl: './promotion-detail-modal.component.css'
})
export class PromotionDetailModalComponent {
    @ViewChild('detailModal') modalElement!: ElementRef;
    promotion = signal<Promotion | null>(null);
    modalInstance: any;

    open(promotion: Promotion): void {
        this.promotion.set(promotion);
        this.showModal();
    }

    private showModal(): void {
        if (!this.modalInstance) {
            const bootstrap = (window as any).bootstrap;
            this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
        }
        this.modalInstance.show();
    }

    close(): void {
        if (this.modalInstance) {
            this.modalInstance.hide();
        }
    }

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'active': return 'bg-success text-white';
            case 'scheduled': return 'bg-primary text-white';
            case 'expired': return 'bg-secondary text-white';
            case 'suspended': return 'bg-dark text-white';
            default: return 'bg-light text-dark';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'active': return 'Active';
            case 'scheduled': return 'Planifiée';
            case 'expired': return 'Terminée';
            case 'suspended': return 'Suspendue';
            default: return status;
        }
    }
}
