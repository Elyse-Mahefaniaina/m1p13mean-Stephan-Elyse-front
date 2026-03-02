import { AuthService } from './../../../../core/services/auth.service';
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
    imports: [CommonModule, ReactiveFormsModule],
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

    constructor(
      private authService: AuthService
    ) {
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

        this.authService.login(email, password).subscribe({
          next: (res:any) => {
            this.isLoading.set(false);
            const user = res.user;
            this.toastService.show('Ravi de vous revoir !', 'success');
            localStorage.setItem("currentUser", user);
            this.router.navigateByUrl('/shop/dashboard');
          },
          error: (err) => {
            this.isLoading.set(false);
            this.toastService.show('Identifiants invalides ou profil non autorisé.', 'danger');
            this.errorMessage.set('Échec de l\'authentification.');
          }
        });
      } else {
        this.loginForm.markAllAsTouched();
      }
    }
}
