import { Component, HostListener, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

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
}

