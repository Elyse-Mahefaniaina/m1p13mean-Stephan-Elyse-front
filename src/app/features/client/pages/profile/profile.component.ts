import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})
export class ProfileComponent {
    profileForm: FormGroup;
    passwordForm: FormGroup;
    isLoading = signal(false);
    isPasswordLoading = signal(false);
    showPassword = signal(false);
    showNewPassword = signal(false);
    showConfirmPassword = signal(false);

    // Mock user data
    userData = {
        firstName: 'Stephan',
        lastName: 'Elyse',
        email: 'stephan.elyse@example.com',
        phone: '+261 34 00 000 00',
        address: 'Villa 12, Ambohibao, Antananarivo',
        city: 'Antananarivo',
        zipCode: '101'
    };

    private fb = inject(FormBuilder);

    constructor() {
        this.profileForm = this.fb.group({
            firstName: [this.userData.firstName, [Validators.required]],
            lastName: [this.userData.lastName, [Validators.required]],
            email: [this.userData.email, [Validators.required, Validators.email]],
            phone: [this.userData.phone],
            address: [this.userData.address],
            city: [this.userData.city],
            zipCode: [this.userData.zipCode]
        });

        this.passwordForm = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, {
            validators: this.passwordMatchValidator
        });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('newPassword')?.value === g.get('confirmPassword')?.value
            ? null : { 'mismatch': true };
    }

    togglePasswordVisibility(type: string) {
        if (type === 'current') this.showPassword.update(v => !v);
        if (type === 'new') this.showNewPassword.update(v => !v);
        if (type === 'confirm') this.showConfirmPassword.update(v => !v);
    }

    onUpdateProfile() {
        if (this.profileForm.valid) {
            this.isLoading.set(true);
            // Simulate API call
            setTimeout(() => {
                this.isLoading.set(false);
                // Handle success
            }, 1500);
        } else {
            this.profileForm.markAllAsTouched();
        }
    }

    onUpdatePassword() {
        if (this.passwordForm.valid) {
            this.isPasswordLoading.set(true);
            // Simulate API call
            setTimeout(() => {
                this.isPasswordLoading.set(false);
                this.passwordForm.reset();
            }, 1500);
        } else {
            this.passwordForm.markAllAsTouched();
        }
    }
}
