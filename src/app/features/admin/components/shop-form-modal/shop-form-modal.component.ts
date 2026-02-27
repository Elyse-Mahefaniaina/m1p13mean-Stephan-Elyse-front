import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Shop } from '../../../../core/services/shop.service';

declare var bootstrap: any;

@Component({
    selector: 'app-shop-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './shop-form-modal.component.html',
    styleUrl: './shop-form-modal.component.css'
})
export class ShopFormModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('shopModal') modalRef!: ElementRef;
    @Output() closed = new EventEmitter<void>();

    shopForm: FormGroup;
    isEditMode = false;
    editingShop: Shop | null = null;
    private modalInstance: any;

    categories = [
        'Électronique',
        'Vêtements',
        'Alimentation',
        'Accessoires',
        'Décoration',
        'Santé & Beauté',
        'Loisirs',
        'Maison'
    ];

    statuses = [
        { value: 'active', label: 'Active', icon: 'bi-check-circle-fill', class: 'text-success' },
        { value: 'pending', label: 'En attente', icon: 'bi-hourglass-split', class: 'text-warning' },
        { value: 'suspended', label: 'Suspendue', icon: 'bi-slash-circle-fill', class: 'text-danger' },
        { value: 'closed', label: 'Fermée', icon: 'bi-x-circle-fill', class: 'text-secondary' }
    ];

    constructor(private fb: FormBuilder) {
        this.shopForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            ownerName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required]],
            category: ['', [Validators.required]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            boxNumber: [''],
            status: ['pending', [Validators.required]]
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
        this.editingShop = null;
        this.shopForm.reset({ status: 'pending' });
        this.modalInstance?.show();
    }

    openForEdit(shop: Shop): void {
        this.isEditMode = true;
        this.editingShop = shop;
        this.shopForm.patchValue({
            name: shop.name,
            ownerName: shop.ownerName,
            email: shop.email,
            phone: shop.phone,
            category: shop.category,
            description: shop.description || '',
            boxNumber: shop.boxNumber || '',
            status: shop.status
        });
        this.shopForm.markAsPristine();
        this.shopForm.markAsUntouched();
        this.modalInstance?.show();
    }

    close(): void {
        this.modalInstance?.hide();
    }

    isInvalid(controlName: string): boolean {
        const control = this.shopForm.get(controlName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getErrorMessage(controlName: string): string {
        const control = this.shopForm.get(controlName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) return 'Ce champ est obligatoire.';
        if (control.errors['email']) return 'Veuillez entrer un email valide.';
        if (control.errors['minlength']) {
            const min = control.errors['minlength'].requiredLength;
            return `Minimum ${min} caractères requis.`;
        }
        return '';
    }

    onSubmit(): void {
        if (this.shopForm.invalid) {
            this.shopForm.markAllAsTouched();
            return;
        }
        console.log(this.isEditMode ? 'Edit shop values:' : 'Create shop values:', this.shopForm.value);
        if (this.isEditMode) {
            console.log('Editing shop ID:', this.editingShop?.id);
        }
        this.close();
    }
}
