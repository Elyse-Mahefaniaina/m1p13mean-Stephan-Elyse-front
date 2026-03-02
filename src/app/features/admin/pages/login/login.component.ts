import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

// Get credentials from environment variables
const ADMIN_EMAIL = import.meta.env['NG_APP_ADMIN_EMAIL'] || '';
const ADMIN_PASSWORD = import.meta.env['NG_APP_ADMIN_PASSWORD'] || '';

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

    constructor(
      private fb: FormBuilder,
      private authService: AuthService
    ) {
        this.loginForm = this.fb.group({
            email: [ADMIN_EMAIL, [Validators.required, Validators.email]],
            password: [ADMIN_PASSWORD, [Validators.required, Validators.minLength(6)]]
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
            localStorage.setItem("currentUser", user);
            this.router.navigate(['/admin/dashboard']);
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
