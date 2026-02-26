import { Component, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../../core/services/user.service';

declare var bootstrap: any;

@Component({
    selector: 'app-user-form-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './user-form-modal.component.html',
    styleUrl: './user-form-modal.component.css'
})
export class UserFormModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('userModal') modalRef!: ElementRef;
    @Output() closed = new EventEmitter<void>();

    userForm: FormGroup;
    isEditMode = false;
    editingUser: User | null = null;
    private modalInstance: any;

    constructor(private fb: FormBuilder) {
        this.userForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            role: ['', [Validators.required]],
            status: ['active', [Validators.required]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
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
        this.editingUser = null;
        this.userForm.reset({ status: 'active' });
        this.setPasswordValidators(true);
        this.modalInstance?.show();
    }

    /** Opens the modal in EDIT mode with pre-filled data */
    openForEdit(user: User): void {
        this.isEditMode = true;
        this.editingUser = user;
        this.setPasswordValidators(false);
        this.userForm.patchValue({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            password: '',
            confirmPassword: ''
        });
        this.userForm.markAsPristine();
        this.userForm.markAsUntouched();
        this.modalInstance?.show();
    }

    /** Closes the modal programmatically */
    close(): void {
        this.modalInstance?.hide();
    }

    /** Toggle password validators depending on mode */
    private setPasswordValidators(required: boolean): void {
        const passwordControl = this.userForm.get('password');
        const confirmControl = this.userForm.get('confirmPassword');

        if (required) {
            passwordControl?.setValidators([Validators.required, Validators.minLength(6)]);
            confirmControl?.setValidators([Validators.required]);
        } else {
            // In edit mode: password is optional, but if filled must be >= 6 chars
            passwordControl?.setValidators([Validators.minLength(6)]);
            confirmControl?.clearValidators();
        }
        passwordControl?.updateValueAndValidity();
        confirmControl?.updateValueAndValidity();
    }

    /** Check if a form control is invalid and has been touched */
    isInvalid(controlName: string): boolean {
        const control = this.userForm.get(controlName);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    /** Get validation error message for a control */
    getErrorMessage(controlName: string): string {
        const control = this.userForm.get(controlName);
        if (!control || !control.errors) return '';

        if (control.errors['required']) return 'Ce champ est obligatoire.';
        if (control.errors['email']) return 'Veuillez entrer un email valide.';
        if (control.errors['minlength']) {
            const min = control.errors['minlength'].requiredLength;
            return `Minimum ${min} caractères requis.`;
        }
        return '';
    }

    /** Placeholder submit — no business logic yet */
    onSubmit(): void {
        if (this.userForm.invalid) {
            this.userForm.markAllAsTouched();
            return;
        }
        // Business logic will be added later
        console.log(this.isEditMode ? 'Edit values:' : 'Create values:', this.userForm.value);
        if (this.isEditMode) {
            console.log('Editing user ID:', this.editingUser?.id);
        }
        this.close();
    }
}
