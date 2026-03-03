import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Product } from '../../../../core/services/product.service';

declare var bootstrap: any;

@Component({
    selector: 'app-product-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './product-form-modal.component.html',
    styleUrl: './product-form-modal.component.css'
})
export class ProductFormModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('productModal') modalRef!: ElementRef;
    @Output() closed = new EventEmitter<void>();
    @Output() saved = new EventEmitter<Partial<Product>>();

    productForm: FormGroup;
    isEditMode = false;
    editingProduct: Product | null = null;
    private modalInstance: any;

    categories = [
        'Epicerie', 'Confiserie', 'Boissons', 'Dessert', 'Boulangerie', 'Frais', 'Hygiène', 'Entretien'
    ];

    units = ['unités', 'kg', 'g', 'L', 'ml', 'packs', 'boîtes', 'tablettes', 'pots', 'briques', 'sachets'];

    constructor(private fb: FormBuilder) {
        this.productForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            sku: ['', [Validators.required]],
            category: ['', [Validators.required]],
            price: [0, [Validators.required, Validators.min(0)]],
            stock: [0, [Validators.required, Validators.min(0)]],
            minStock: [5, [Validators.required, Validators.min(0)]],
            unit: ['unités', [Validators.required]],
            description: [''],
            variants: this.fb.array([])
        });
    }

    get variants() {
        return this.productForm.get('variants') as FormArray;
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

    /** Opens the modal in CREATE mode */
    open(): void {
        this.isEditMode = false;
        this.editingProduct = null;
        this.productForm.reset({
            price: 0,
            stock: 0,
            minStock: 5,
            unit: 'unités'
        });
        this.variants.clear();
        this.modalInstance?.show();
    }

    /** Opens the modal in EDIT mode */
    openForEdit(product: Product): void {
        this.isEditMode = true;
        this.editingProduct = product;

        // Reset and clear variants
        this.variants.clear();

        // Patch main values
        this.productForm.patchValue({
            name: product.name,
            sku: product.sku,
            category: product.category,
            price: product.price,
            stock: product.stock,
            minStock: product.minStock,
            unit: product.unit || 'unités',
            description: product.description || ''
        });

        // Add variants if any
        if (product.variants && product.variants.length > 0) {
            product.variants.forEach(v => {
                this.variants.push(this.fb.group({
                    type: [v.type, Validators.required],
                    options: [v.options.join(', '), Validators.required]
                }));
            });
        }

        this.productForm.markAsPristine();
        this.productForm.markAsUntouched();
        this.modalInstance?.show();
    }

    addVariant(): void {
        this.variants.push(this.fb.group({
            type: ['', Validators.required],
            options: ['', Validators.required]
        }));
    }

    removeVariant(index: number): void {
        this.variants.removeAt(index);
    }

    /** Closes the modal */
    close(): void {
        this.modalInstance?.hide();
    }

    /** Check if a form control is invalid */
    isInvalid(controlName: string): boolean {
        const control = this.productForm.get(controlName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    /** Placeholder submit */
    onSubmit(): void {
        if (this.productForm.invalid) {
            this.productForm.markAllAsTouched();
            return;
        }

        const formValue = this.productForm.value;
        const productData: Partial<Product> = {
            ...formValue,
            // Convert comma-separated options to array
            variants: formValue.variants.map((v: any) => ({
                type: v.type,
                options: v.options.split(',').map((o: string) => o.trim()).filter((o: string) => o !== '')
            }))
        };

        if (this.isEditMode && this.editingProduct) {
            productData._id = this.editingProduct._id;
        }

        this.saved.emit(productData);
        this.close();
    }

    getErrorMessage(controlName: string): string {
        const control = this.productForm.get(controlName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) return 'Ce champ est obligatoire.';
        if (control.errors['min']) return 'La valeur doit être positive.';
        if (control.errors['minlength']) return 'Minimum 3 caractères.';
        return '';
    }
}
