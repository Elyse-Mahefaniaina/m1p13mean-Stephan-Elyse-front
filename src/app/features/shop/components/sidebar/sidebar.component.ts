import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';

interface NavItem {
    label: string;
    icon: string;
    route: string;
    badge?: number;
    children?: NavItem[];
    isOpen?: boolean;
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

    /** Navigation sections for the shop owner - reactive signal */
    navSections = signal<NavSection[]>([
        {
            items: [
                { label: 'Tableau de bord', icon: 'bi-grid-1x2-fill', route: '/shop/dashboard' }
            ]
        },
        {
            title: 'Inventaire',
            items: [
                {
                    label: 'Gestion de Stock',
                    icon: 'bi-box-seam-fill',
                    route: '/shop/inventory',
                    children: [
                        { label: 'Niveau de Stock', icon: 'bi-bar-chart-fill', route: '/shop/inventory/stock-level' },
                        { label: 'Entrées de Stock', icon: 'bi-plus-square-fill', route: '/shop/inventory/stock-entries' },
                        { label: 'Sorties de Stock', icon: 'bi-dash-square-fill', route: '/shop/inventory/stock-out' },
                        { label: 'Mouvements de stock', icon: 'bi-arrow-left-right', route: '/shop/inventory/stock-movements' }
                    ],
                    isOpen: true
                }
            ]
        },
        {
            title: 'Ventes',
            items: [
                {
                    label: 'Commandes',
                    icon: 'bi-cart-check-fill',
                    route: '/shop/orders',
                    badge: 2
                },
                {
                    label: 'Promotions',
                    icon: 'bi-megaphone-fill',
                    route: '/shop/promotions'
                }
            ]
        },
        {
            title: 'Paramètres',
            items: [
                {
                    label: 'Profil & Boutique',
                    icon: 'bi-person-gear',
                    route: '/shop/profile'
                }
            ]
        }
    ]);


    toggleSubmenu(item: NavItem) {
        if (item.children) {
            item.isOpen = !item.isOpen;
        }
    }

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

    logout() {
        this.closeProfileDropdown();
        this.closeMobileMenu();

        // Simulating logout for now
        this.toastService.show('Session boutique clôturée. À bientôt !', 'success');
        this.router.navigate(['/shop/login']);
    }
}
