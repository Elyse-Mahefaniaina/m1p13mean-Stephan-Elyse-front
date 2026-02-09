import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
    selector: 'app-shop-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class ShopLoginComponent {
    loginForm: FormGroup;
    isLoading = signal(false);
    showPassword = signal(false);
    errorMessage = signal<string | null>(null);

    private fb = inject(FormBuilder);
    private router = inject(Router);
    private toastService = inject(ToastService);

    constructor() {
        this.loginForm = this.fb.group({
            email: ['boutique@meanmall.com', [Validators.required, Validators.email]],
            password: ['shop123', [Validators.required, Validators.minLength(6)]]
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
                if (email === 'boutique@meanmall.com' && password === 'shop123') {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userRole', 'shop');
                    localStorage.setItem('userName', 'Ma Boutique Fashion');

                    this.toastService.show('Ravi de vous revoir !', 'success');
                    this.router.navigate(['/shop/dashboard']);
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
