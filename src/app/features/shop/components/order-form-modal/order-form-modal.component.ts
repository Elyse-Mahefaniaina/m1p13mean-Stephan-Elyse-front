import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Order, OrderService } from '../../../../core/services/order.service';

declare var bootstrap: any;

@Component({
    selector: 'app-order-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './order-form-modal.component.html',
    styleUrl: './order-form-modal.component.css'
})
export class OrderFormModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('orderModal') modalRef!: ElementRef;
    @Output() closed = new EventEmitter<void>();
    @Output() saved = new EventEmitter<void>();

    orderForm: FormGroup;
    isEditMode = false;
    editingOrder: Order | null = null;
    private modalInstance: any;

    constructor(private fb: FormBuilder, private orderService: OrderService) {
        this.orderForm = this.fb.group({
            customerName: ['', [Validators.required, Validators.minLength(3)]],
            status: ['pending', [Validators.required]],
            paymentStatus: ['pending', [Validators.required]],
            total: [0, [Validators.required, Validators.min(0)]],
            date: [new Date().toISOString().substring(0, 16), [Validators.required]]
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
        this.editingOrder = null;
        this.orderForm.reset({
            status: 'pending',
            paymentStatus: 'pending',
            total: 0,
            date: new Date().toISOString().substring(0, 16)
        });
        this.modalInstance?.show();
    }

    openForEdit(order: Order): void {
        this.isEditMode = true;
        this.editingOrder = order;
        this.orderForm.patchValue({
            customerName: order.customerName,
            status: order.status,
            paymentStatus: order.paymentStatus,
            total: order.total,
            date: order.date.substring(0, 16)
        });
        this.modalInstance?.show();
    }

    close(): void {
        this.modalInstance?.hide();
    }

    isInvalid(controlName: string): boolean {
        const control = this.orderForm.get(controlName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    getErrorMessage(controlName: string): string {
        const control = this.orderForm.get(controlName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) return 'Ce champ est obligatoire.';
        if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} caractères.`;
        if (control.errors['min']) return 'La valeur doit être positive.';
        return '';
    }

    onSubmit(): void {
        if (this.orderForm.invalid) {
            this.orderForm.markAllAsTouched();
            return;
        }

        const orderData = this.orderForm.value;
        if (this.isEditMode && this.editingOrder) {
            this.orderService.updateOrder(this.editingOrder.id, orderData).subscribe(() => {
                this.saved.emit();
                this.close();
            });
        } else {
            this.orderService.createOrder(orderData).subscribe(() => {
                this.saved.emit();
                this.close();
            });
        }
    }
}
