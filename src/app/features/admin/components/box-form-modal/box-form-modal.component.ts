import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Box } from '../../../../core/services/box.service';

declare var bootstrap: any;

@Component({
    selector: 'app-box-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './box-form-modal.component.html',
    styleUrl: './box-form-modal.component.css'
})
export class BoxFormModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('boxModal') modalRef!: ElementRef;
    @Output() closed = new EventEmitter<void>();

    boxForm: FormGroup;
    isEditMode = false;
    editingBox: Box | null = null;
    private modalInstance: any;

    constructor(private fb: FormBuilder) {
        this.boxForm = this.fb.group({
            number: ['', [Validators.required]],
            zone: ['', [Validators.required]],
            dimensions: ['', [Validators.required]],
            status: ['free', [Validators.required]],
            rent: [0, [Validators.required, Validators.min(0)]],
            charges: [0, [Validators.required, Validators.min(0)]],
            paymentDay: [1, [Validators.required, Validators.min(1), Validators.max(31)]]
        });
    }

    ngAfterViewInit(): void {
        this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement, {
            backdrop: 'static',
            keyboard: false
        });

        // Listen for Bootstrap's hidden event to emit the closed output
        this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
            this.closed.emit();
        });
    }

    ngOnDestroy(): void {
        this.modalInstance?.dispose();
    }

    /** Opens the modal in CREATE mode */
    open(): void {
        this.isEditMode = false;
        this.editingBox = null;
        this.boxForm.reset({ status: 'free', rent: 0, charges: 0, paymentDay: 1 });
        this.modalInstance?.show();
    }

    /** Opens the modal in EDIT mode with pre-filled data */
    openForEdit(box: Box): void {
        this.isEditMode = true;
        this.editingBox = box;
        this.boxForm.patchValue({
            number: box.number,
            zone: box.zone,
            dimensions: box.dimensions,
            status: box.status,
            rent: box.rent,
            charges: box.charges,
            paymentDay: box.paymentDay
        });
        this.boxForm.markAsPristine();
        this.boxForm.markAsUntouched();
        this.modalInstance?.show();
    }

    /** Closes the modal programmatically */
    close(): void {
        this.modalInstance?.hide();
    }

    /** Check if a form control is invalid and has been touched */
    isInvalid(controlName: string): boolean {
        const control = this.boxForm.get(controlName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    /** Get validation error message for a control */
    getErrorMessage(controlName: string): string {
        const control = this.boxForm.get(controlName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) return 'Ce champ est obligatoire.';
        if (control.errors['min']) return 'La valeur doit être positive.';
        if (control.errors['max']) return 'La valeur doit être inférieure ou égale à 31.';

        return '';
    }

    /** Placeholder submit — no business logic yet */
    onSubmit(): void {
        if (this.boxForm.invalid) {
            this.boxForm.markAllAsTouched();
            return;
        }
        // Business logic will be added later
        console.log(this.isEditMode ? 'Edit values:' : 'Create values:', this.boxForm.value);
        if (this.isEditMode) {
            console.log('Editing box ID:', this.editingBox?.id);
        }
        this.close();
    }
}
