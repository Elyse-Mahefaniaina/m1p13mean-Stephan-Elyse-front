import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    registerForm: FormGroup;
    isLoading = signal(false);
    showPassword = signal(false);
    showConfirmPassword = signal(false);
    errorMessage = signal<string | null>(null);

    private fb = inject(FormBuilder);
    private router = inject(Router);

    constructor() {
        this.registerForm = this.fb.group({
            firstName: ['', [Validators.required]],
            lastName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { 'mismatch': true };
    }

    togglePasswordVisibility() {
        this.showPassword.update(v => !v);
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword.update(v => !v);
    }

    onSubmit() {
        if (this.registerForm.valid) {
            this.isLoading.set(true);
            // Simulate registration
            setTimeout(() => {
                this.isLoading.set(false);
                this.router.navigate(['/client/login']);
            }, 1500);
        } else {
            this.registerForm.markAllAsTouched();
        }
    }
}
