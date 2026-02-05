import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
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

    constructor(private fb: FormBuilder) {
        this.loginForm = this.fb.group({
            email: ['admin@meanmall.com', [Validators.required, Validators.email]],
            password: ['admin123', [Validators.required, Validators.minLength(6)]]
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

            // Simulate API call
            setTimeout(() => {
                this.isLoading.set(false);

                if (email === 'admin@meanmall.com' && password === 'admin123') {
                    this.toastService.show('Connexion réussie !', 'success');
                    // Redirect to dashboard after successful login
                    this.router.navigate(['/admin/dashboard']);
                } else {
                    this.toastService.show('Identifiants invalides ou profil non autorisé.', 'danger');
                    this.errorMessage.set('Échec de l\'authentification.');
                }
            }, 1500);
        } else {
            this.loginForm.markAllAsTouched();
        }
    }
}
