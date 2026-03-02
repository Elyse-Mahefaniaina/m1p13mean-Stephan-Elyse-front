import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

// Get credentials from environment variables
const SHOP_EMAIL = import.meta.env['NG_APP_SHOP_EMAIL'] || '';
const SHOP_PASSWORD = import.meta.env['NG_APP_SHOP_PASSWORD'] || '';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    loginForm: FormGroup;
    isLoading = signal(false);
    showPassword = signal(false);
    errorMessage = signal<string | null>(null);

    private fb = inject(FormBuilder);
    private router = inject(Router);
    private toastService = inject(ToastService);

    constructor() {
        // Pre-fill form with env credentials for dev convenience
        this.loginForm = this.fb.group({
            email: [SHOP_EMAIL, [Validators.required, Validators.email]],
            password: [SHOP_PASSWORD, [Validators.required, Validators.minLength(6)]]
        });
    }

    togglePasswordVisibility() {
        this.showPassword.update(v => !v);
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading.set(true);
            this.errorMessage.set(null);

            const { email, password } = this.loginForm.value;

            // Simulate API call - validates against env credentials
            setTimeout(() => {
                this.isLoading.set(false);
                if (email === SHOP_EMAIL && password === SHOP_PASSWORD) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userRole', 'shop');
                    localStorage.setItem('userName', 'Ma Boutique Fashion');

                    this.toastService.show('Ravi de vous revoir !', 'success');

                    // Use a small delay or ensure navigation is detected
                    this.router.navigateByUrl('/shop/dashboard');
                } else {
                    this.toastService.show('Identifiants invalides.', 'danger');
                    this.errorMessage.set('Email ou mot de passe incorrect.');
                }
            }, 1500);
        } else {
            this.loginForm.markAllAsTouched();
        }
    }
}
