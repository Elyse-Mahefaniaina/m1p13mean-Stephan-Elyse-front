import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

interface NavItem {
    label: string;
    icon: string;
    route: string;
    badge?: number;
}

interface NavSection {
    title?: string;
    items: NavItem[];
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
    private router = inject(Router);
    private toastService = inject(ToastService);

    isMobileMenuOpen = signal(false);
    isProfileDropdownOpen = signal(false);

    /** Navigation sections - easily extendable for future features */
    navSections: NavSection[] = [
        {
            items: [
                { label: 'Tableau de bord', icon: 'bi-grid-1x2-fill', route: '/admin/dashboard' }
            ]
        },
        {
            title: '',
            items: [
                { label: 'Gestion des Box', icon: 'bi-box-seam-fill', route: '/admin/boxes' }
            ]
        }
    ];

    toggleMobileMenu() {
        this.isMobileMenuOpen.update(v => !v);
    }

    closeMobileMenu() {
        this.isMobileMenuOpen.set(false);
    }

    toggleProfileDropdown() {
        this.isProfileDropdownOpen.update(v => !v);
    }

    closeProfileDropdown() {
        this.isProfileDropdownOpen.set(false);
    }

    /**
     * Logout the user and redirect to login page
     * In the future, this will also call the API to invalidate the session
     */
    logout() {
        // Close dropdown
        this.closeProfileDropdown();
        this.closeMobileMenu();

        // TODO: Call logout API endpoint when backend is ready
        // await this.authService.logout();

        // Show success message
        this.toastService.show('Déconnexion réussie. À bientôt !', 'success');

        // Redirect to login page
        this.router.navigate(['/admin/login']);
    }
}
