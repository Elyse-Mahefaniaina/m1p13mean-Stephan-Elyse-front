import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockOut } from '../../../../core/services/stock.service';

declare var bootstrap: any;

@Component({
    selector: 'app-stock-out-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './stock-out-form-modal.component.html',
    styleUrl: './stock-out-form-modal.component.css'
})
export class StockOutFormModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('entryModal') modalRef!: ElementRef;
    @Output() closed = new EventEmitter<void>();
    @Output() saved = new EventEmitter<StockOut>();

    entryForm: FormGroup;
    isEditMode = false;
    editingEntry: StockOut | null = null;
    private modalInstance: any;

    constructor(private fb: FormBuilder) {
        this.entryForm = this.fb.group({
            productName: ['', [Validators.required, Validators.minLength(3)]],
            sku: ['', [Validators.required]],
            quantity: [1, [Validators.required, Validators.min(1)]],
            destination: ['', [Validators.required]],
            preparedBy: ['', [Validators.required]],
            status: ['pending', [Validators.required]],
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
        this.editingEntry = null;
        this.entryForm.reset({
            status: 'pending',
            quantity: 1
        });
        this.modalInstance?.show();
    }

    openForEdit(entry: StockOut): void {
        this.isEditMode = true;
        this.editingEntry = entry;
        this.entryForm.patchValue({
            productName: entry.productName,
            sku: entry.sku,
            quantity: entry.quantity,
            destination: entry.destination,
            preparedBy: entry.preparedBy,
            status: entry.status,
            notes: entry.notes || ''
        });
        this.entryForm.markAsPristine();
        this.entryForm.markAsUntouched();
        this.modalInstance?.show();
    }

    close(): void {
        this.modalInstance?.hide();
    }

    isInvalid(controlName: string): boolean {
        const control = this.entryForm.get(controlName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getErrorMessage(controlName: string): string {
        const control = this.entryForm.get(controlName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) return 'Ce champ est obligatoire.';
        if (control.errors['minlength']) {
            const min = control.errors['minlength'].requiredLength;
            return `Minimum ${min} caractères requis.`;
        }
        if (control.errors['min']) {
            return `La valeur doit être au moins ${control.errors['min'].min}.`;
        }
        return '';
    }

    onSubmit(): void {
        if (this.entryForm.invalid) {
            this.entryForm.markAllAsTouched();
            return;
        }

        const formData = this.entryForm.value;
        const result: StockOut = {
            ...this.editingEntry,
            ...formData,
            id: this.isEditMode && this.editingEntry ? this.editingEntry.id : Math.random().toString(36).substr(2, 9),
            date: this.isEditMode && this.editingEntry ? this.editingEntry.date : new Date().toISOString(),
        };

        this.saved.emit(result);
        this.close();
    }
}
