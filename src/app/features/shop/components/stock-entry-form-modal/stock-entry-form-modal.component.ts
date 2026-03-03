import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StockEntry } from '../../../../core/services/stock.service';

declare var bootstrap: any;

@Component({
    selector: 'app-stock-entry-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './stock-entry-form-modal.component.html',
    styleUrl: './stock-entry-form-modal.component.css'
})
export class StockEntryFormModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('entryModal') modalRef!: ElementRef;
    @Output() closed = new EventEmitter<void>();
    @Output() saved = new EventEmitter<any>();

    entryForm: FormGroup;
    isEditMode = false;
    editingEntry: StockEntry | null = null;
    private modalInstance: any;

    constructor(private fb: FormBuilder) {
        this.entryForm = this.fb.group({
            productName: ['', [Validators.required]],
            sku: ['', [Validators.required]],
            quantity: [0, [Validators.required, Validators.min(1)]],
            supplier: ['', [Validators.required]],
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
            quantity: 0
        });
        this.modalInstance?.show();
    }

    openForEdit(entry: StockEntry): void {
        this.isEditMode = true;
        this.editingEntry = entry;
        this.entryForm.patchValue({
            productName: entry.productName,
            sku: entry.sku,
            quantity: entry.quantity,
            supplier: entry.supplier,
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
        if (control.errors['min']) return `La valeur doit être supérieure à ${control.errors['min'].min - 1}.`;

        return '';
    }

    onSubmit(): void {
        if (this.entryForm.invalid) {
            this.entryForm.markAllAsTouched();
            return;
        }

        const formValue = this.entryForm.value;
        console.log(this.isEditMode ? 'Edit values:' : 'Create values:', formValue);

        this.saved.emit({
            isEdit: this.isEditMode,
            data: formValue,
            id: this.editingEntry?.id
        });

        this.close();
    }
}
