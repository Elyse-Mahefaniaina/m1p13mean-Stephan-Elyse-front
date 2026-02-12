import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

// Get credentials from environment variables
const CLIENT_EMAIL = import.meta.env['NG_APP_CLIENT_EMAIL'] || '';
const CLIENT_PASSWORD = import.meta.env['NG_APP_CLIENT_PASSWORD'] || '';

@Component({
    selector: 'app-client-login',
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

    private toastService = inject(ToastService);
    private router = inject(Router);
    private authService = inject(AuthService);

    constructor(private fb: FormBuilder) {
        // Pre-fill form with env credentials for dev convenience
        this.loginForm = this.fb.group({
            email: [CLIENT_EMAIL, [Validators.required, Validators.email]],
            password: [CLIENT_PASSWORD, [Validators.required, Validators.minLength(6)]]
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

                if (email === CLIENT_EMAIL && password === CLIENT_PASSWORD) {
                    this.toastService.show('Connexion réussie !', 'success');
                    this.authService.login();
                    // Redirect to home/catalog after successful login
                    this.router.navigate(['/client']);
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
