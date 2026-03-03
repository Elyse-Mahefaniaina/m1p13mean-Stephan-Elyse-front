import { AuthService } from './../../../../core/services/auth.service';
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastService } from '../../../../core/services/toast.service';
import { OrderService } from '../../../../core/services/order.service';

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
export class SidebarComponent implements OnInit {
    private router = inject(Router);
    private toastService = inject(ToastService);
    private orderService = inject(OrderService);

    isMobileMenuOpen = signal(false);
    isProfileDropdownOpen = signal(false);
    orderCount = signal(0);

    constructor(private authService: AuthService) {}

    /** Navigation sections for the shop owner - reactive signal */
    navSections = signal<NavSection[]>([
        {
            items: [
                { label: 'Tableau de bord', icon: 'bi-grid-1x2-fill', route: '/shop/dashboard' },
                { label: 'Création de Produit', icon: 'bi-plus-circle-fill', route: '/shop/product-creation' }
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

    ngOnInit(): void {
        this.loadOrderCount();
    }


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

        this.authService.logout().subscribe({
          next : () => {
            this.toastService.show('Session boutique clôturée. À bientôt !', 'success');
            this.router.navigate(['/shop/login']);
          }
        });
    }

    getItemBadge(item: NavItem): number {
        if (item.route === '/shop/orders') {
            return this.orderCount();
        }
        return item.badge || 0;
    }

    private loadOrderCount(): void {
        const shopId = this.getShopId();
        if (!shopId) return;
        this.orderService.getShopOrders(shopId).subscribe({
            next: (orders) => this.orderCount.set(orders.length),
            error: () => this.orderCount.set(0)
        });
    }

    private getShopId(): string | null {
        const rawData = localStorage.getItem('currentUser');
        if (!rawData) return null;
        let user: any = null;
        try {
            user = JSON.parse(rawData);
        } catch {
            user = rawData;
        }
        const shop = (user && typeof user === 'object') ? user.shop : null;
        return shop?._id || shop || null;
    }
}
