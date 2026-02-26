import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../../core/services/user.service';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './users.component.html',
    styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
    private userService = inject(UserService);

    allUsers = signal<User[]>([]);
    loading = signal(true);
    searchTerm = signal('');
    roleFilter = signal('all');
    statusFilter = signal('all');

    // Computed filtered users
    filteredUsers = computed(() => {
        const users = this.allUsers();
        const search = this.searchTerm().toLowerCase();
        const role = this.roleFilter();
        const status = this.statusFilter();

        return users.filter(user => {
            const matchesSearch = !search ||
                user.name.toLowerCase().includes(search) ||
                user.email.toLowerCase().includes(search);

            const matchesRole = role === 'all' || user.role === role;
            const matchesStatus = status === 'all' || user.status === status;

            return matchesSearch && matchesRole && matchesStatus;
        });
    });

    // Stats for user management
    stats = signal([
        { label: 'Total Utilisateurs', value: 0, icon: 'bi-people-fill', color: 'primary' },
        { label: 'Administrateurs', value: 0, icon: 'bi-shield-lock-fill', color: 'danger' },
        { label: 'Boutiques', value: 0, icon: 'bi-shop', color: 'warning' },
        { label: 'Clients', value: 0, icon: 'bi-person-badge', color: 'success' }
    ]);

    ngOnInit(): void {
        this.userService.getUsers().subscribe({
            next: (data) => {
                this.allUsers.set(data);
                this.calculateStats(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error fetching users:', err);
                this.loading.set(false);
            }
        });
    }

    private calculateStats(users: User[]): void {
        const total = users.length;
        const adminCount = users.filter(u => u.role === 'admin').length;
        const shopCount = users.filter(u => u.role === 'shop').length;
        const clientCount = users.filter(u => u.role === 'client').length;

        this.stats.set([
            { label: 'Total Utilisateurs', value: total, icon: 'bi-people-fill', color: 'primary' },
            { label: 'Administrateurs', value: adminCount, icon: 'bi-shield-lock-fill', color: 'danger' },
            { label: 'Boutiques', value: shopCount, icon: 'bi-shop', color: 'warning' },
            { label: 'Clients', value: clientCount, icon: 'bi-person-badge', color: 'success' }
        ]);
    }

    getRoleBadgeClass(role: string): string {
        switch (role) {
            case 'admin': return 'bg-danger-subtle text-danger border-danger-subtle';
            case 'shop': return 'bg-warning-subtle text-warning-emphasis border-warning-subtle';
            case 'client': return 'bg-success-subtle text-success-emphasis border-success-subtle';
            default: return 'bg-secondary-subtle text-secondary-emphasis border-secondary-subtle';
        }
    }

    getRoleLabel(role: string): string {
        switch (role) {
            case 'admin': return 'Administrateur';
            case 'shop': return 'Boutique';
            case 'client': return 'Client';
            default: return role;
        }
    }

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'active': return 'bg-success text-white';
            case 'inactive': return 'bg-secondary text-white';
            case 'pending': return 'bg-warning text-dark';
            default: return 'bg-dark text-white';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'active': return 'Actif';
            case 'inactive': return 'Inactif';
            case 'pending': return 'En attente';
            default: return status;
        }
    }
}
