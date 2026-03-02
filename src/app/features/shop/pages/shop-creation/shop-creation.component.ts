import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-shop-creation',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './shop-creation.component.html',
    styleUrl: './shop-creation.component.css'
})
export class ShopCreationComponent {
    shopForm: FormGroup;
    isLoading = signal(false);
    errorMessage = signal<string | null>(null);

    private fb = inject(FormBuilder);
    private router = inject(Router);

    constructor() {
        this.shopForm = this.fb.group({
            shopName: ['', [Validators.required, Validators.minLength(3)]],
            ownerName: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required]],
            category: ['', [Validators.required]],
            description: ['', [Validators.required, Validators.maxLength(500)]],
            address: ['', [Validators.required]],
            city: ['', [Validators.required]]
        });
    }

    onSubmit() {
        if (this.shopForm.valid) {
            this.isLoading.set(true);
            this.errorMessage.set(null);

            // Simulate API call as requested (no logic but placeholder for template feedback)
            setTimeout(() => {
                this.isLoading.set(false);
                // For now, just navigate back to login as if success
                this.router.navigate(['/shop/login']);
            }, 2000);
        } else {
            this.shopForm.markAllAsTouched();
        }
    }
}
