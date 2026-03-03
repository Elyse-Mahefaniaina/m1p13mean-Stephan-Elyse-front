import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockMovement } from '../../../../core/services/stock.service';

declare var bootstrap: any;

@Component({
    selector: 'app-movement-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './movement-form-modal.component.html',
    styleUrl: './movement-form-modal.component.css'
})
export class MovementFormModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('movementModal') modalRef!: ElementRef;
    @Output() closed = new EventEmitter<void>();

    movementForm: FormGroup;
    isEditMode = false;
    editingMovement: StockMovement | null = null;
    private modalInstance: any;

    constructor(private fb: FormBuilder) {
        this.movementForm = this.fb.group({
            productName: ['', [Validators.required]],
            sku: ['', [Validators.required]],
            type: ['in', [Validators.required]],
            quantity: [1, [Validators.required, Validators.min(1)]],
            reason: ['', [Validators.required]],
            status: ['completed', [Validators.required]],
            notes: ['']
        });
    }

    ngAfterViewInit(): void {
        this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement, {
            backdrop: 'static',
            keyboard: false
        });

        this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
            this.closed.emit();
        });
    }

    ngOnDestroy(): void {
        this.modalInstance?.dispose();
    }

    open(): void {
        this.isEditMode = false;
        this.editingMovement = null;
        this.movementForm.reset({
            type: 'in',
            quantity: 1,
            status: 'completed'
        });
        this.modalInstance?.show();
    }

    openForEdit(movement: StockMovement): void {
        this.isEditMode = true;
        this.editingMovement = movement;
        this.movementForm.patchValue({
            productName: movement.productName,
            sku: movement.sku,
            type: movement.type,
            quantity: Math.abs(movement.quantity),
            reason: movement.reason,
            status: movement.status,
            notes: movement.notes || ''
        });
        this.modalInstance?.show();
    }

    close(): void {
        this.modalInstance?.hide();
    }

    isInvalid(controlName: string): boolean {
        const control = this.movementForm.get(controlName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getErrorMessage(controlName: string): string {
        const control = this.movementForm.get(controlName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) return 'Ce champ est obligatoire.';
        if (control.errors['min']) return 'La valeur doit être supérieure à 0.';
        return '';
    }

    onSubmit(): void {
        if (this.movementForm.invalid) {
            this.movementForm.markAllAsTouched();
            return;
        }

        const formValue = this.movementForm.value;
        // In a real app, 'out' would make quantity negative, but here we just log
        console.log(this.isEditMode ? 'Edit movement:' : 'Create movement:', formValue);

        this.close();
    }
}
