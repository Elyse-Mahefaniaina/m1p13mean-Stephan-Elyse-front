import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-client-navbar',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css'
})
export class NavbarComponent {
    protected readonly isScrolled = signal(false);
    protected readonly isMobileMenuOpen = signal(false);
    protected readonly cartItemCount = signal(0);

    private authService = inject(AuthService);
    protected readonly isLoggedIn = this.authService.isLoggedIn;

    constructor(private router: Router) { }

    @HostListener('window:scroll')
    onWindowScroll(): void {
        this.isScrolled.set(window.scrollY > 20);
    }

    toggleMobileMenu(): void {
        this.isMobileMenuOpen.update(v => !v);
    }

    onSearch(event: KeyboardEvent, query: string): void {
        if (event.key === 'Enter' && query.trim()) {
            this.router.navigate(['/client/catalog'], {
                queryParams: { search: query.trim() }
            });
        }
    }

    logout(): void {
        this.authService.logout();
    }
}

