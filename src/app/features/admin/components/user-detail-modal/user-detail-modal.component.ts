import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/services/user.service';

declare var bootstrap: any;

@Component({
    selector: 'app-user-detail-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './user-detail-modal.component.html',
    styleUrl: './user-detail-modal.component.css'
})
export class UserDetailModalComponent implements AfterViewInit, OnDestroy {
    @ViewChild('detailModal') modalRef!: ElementRef;

    user: User | null = null;
    private modalInstance: any;

    ngAfterViewInit(): void {
        this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement, {
            keyboard: true
        });
    }

    ngOnDestroy(): void {
        this.modalInstance?.dispose();
    }

    /** Open the modal with a user to display */
    open(user: User): void {
        this.user = user;
        this.modalInstance?.show();
    }

    /** Close the modal */
    close(): void {
        this.modalInstance?.hide();
    }

    /** Get role label in French */
    getRoleLabel(role: string): string {
        switch (role) {
            case 'admin': return 'Administrateur';
            case 'shop': return 'Boutique';
            case 'client': return 'Client';
            default: return role;
        }
    }

    /** Get role icon */
    getRoleIcon(role: string): string {
        switch (role) {
            case 'admin': return 'bi-shield-lock-fill';
            case 'shop': return 'bi-shop';
            case 'client': return 'bi-person-fill';
            default: return 'bi-person';
        }
    }

    /** Get role color class */
    getRoleColor(role: string): string {
        switch (role) {
            case 'admin': return 'danger';
            case 'shop': return 'warning';
            case 'client': return 'success';
            default: return 'secondary';
        }
    }

    /** Get status label in French */
    getStatusLabel(status: string): string {
        switch (status) {
            case 'active': return 'Actif';
            case 'inactive': return 'Inactif';
            case 'pending': return 'En attente';
            default: return status;
        }
    }

    /** Get status color */
    getStatusColor(status: string): string {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'secondary';
            case 'pending': return 'warning';
            default: return 'dark';
        }
    }
}
