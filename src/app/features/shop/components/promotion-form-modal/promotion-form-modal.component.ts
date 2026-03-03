import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Promotion, PromotionService } from '../../../../core/services/promotion.service';

@Component({
    selector: 'app-promotion-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './promotion-form-modal.component.html',
    styleUrl: './promotion-form-modal.component.css'
})
export class PromotionFormModalComponent {
    @ViewChild('promotionModal') modalElement!: ElementRef;
    private fb = inject(FormBuilder);
    private promotionService = inject(PromotionService);

    promotionForm: FormGroup;
    isEditMode = false;
    editingPromotion: Promotion | null = null;
    modalInstance: any;

    constructor() {
        this.promotionForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required]],
            discountType: ['percentage', [Validators.required]],
            discountValue: [0, [Validators.required, Validators.min(0)]],
            startDate: ['', [Validators.required]],
            endDate: ['', [Validators.required]],
            status: ['active', [Validators.required]],
            applicableTo: ['all', [Validators.required]]
        });
    }

    open(): void {
        this.isEditMode = false;
        this.editingPromotion = null;
        this.promotionForm.reset({
            discountType: 'percentage',
            status: 'active',
            applicableTo: 'all'
        });
        this.showModal();
    }

    openForEdit(promotion: Promotion): void {
        this.isEditMode = true;
        this.editingPromotion = promotion;
        this.promotionForm.patchValue(promotion);
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

    onSubmit(): void {
        if (this.promotionForm.valid) {
            const formData = this.promotionForm.value;
            if (this.isEditMode && this.editingPromotion) {
                console.log('Updating promotion:', this.editingPromotion.id, formData);
            } else {
                console.log('Creating promotion:', formData);
            }
            this.close();
        } else {
            this.markFormGroupTouched(this.promotionForm);
        }
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        Object.values(formGroup.controls).forEach(control => {
            control.markAsTouched();
            if ((control as any).controls) {
                this.markFormGroupTouched(control as any);
            }
        });
    }

    isInvalid(controlName: string): boolean {
        const control = this.promotionForm.get(controlName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getErrorMessage(controlName: string): string {
        const control = this.promotionForm.get(controlName);
        if (control?.hasError('required')) return 'Ce champ est obligatoire';
        if (control?.hasError('minlength')) return `Minimum ${control.errors?.['minlength'].requiredLength} caractères`;
        if (control?.hasError('min')) return 'La valeur doit être positive';
        return '';
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

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'active': return 'bg-success-subtle text-success border-success';
            case 'scheduled': return 'bg-primary-subtle text-primary border-primary';
            case 'expired': return 'bg-secondary-subtle text-secondary border-secondary';
            case 'suspended': return 'bg-dark-subtle text-dark border-dark';
            default: return 'bg-light text-dark';
        }
    }
}
