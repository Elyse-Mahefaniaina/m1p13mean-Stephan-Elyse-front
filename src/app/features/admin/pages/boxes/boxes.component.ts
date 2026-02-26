import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoxService, Box } from '../../../../core/services/box.service';

@Component({
    selector: 'app-boxes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './boxes.component.html',
    styleUrl: './boxes.component.css'
})
export class BoxesComponent implements OnInit {
    private allBoxes = signal<Box[]>([]);
    loading = signal(true);
    searchTerm = signal('');
    statusFilter = signal('all');

    // Computed filtered boxes
    filteredBoxes = computed(() => {
        const boxes = this.allBoxes();
        const search = this.searchTerm().toLowerCase();
        const status = this.statusFilter();

        return boxes.filter(box => {
            const matchesSearch = !search ||
                box.number.toLowerCase().includes(search) ||
                box.zone.toLowerCase().includes(search) ||
                (box.currentShopName && box.currentShopName.toLowerCase().includes(search));

            const matchesStatus = status === 'all' || box.status === status;

            return matchesSearch && matchesStatus;
        });
    });

    // Stats for box management
    stats = signal([
        { label: 'Total Box', value: 0, icon: 'bi-grid-3x3-gap-fill', color: 'primary' },
        { label: 'Occupés', value: 0, icon: 'bi-shop-window', color: 'info' },
        { label: 'Disponibles', value: 0, icon: 'bi-check-circle-fill', color: 'success' },
        { label: 'Revenus', value: 0, icon: 'bi-cash-stack', color: 'warning' }
    ]);

    constructor(private boxService: BoxService) { }

    ngOnInit(): void {
        this.boxService.getBoxes().subscribe({
            next: (data) => {
                this.allBoxes.set(data);
                this.calculateStats(data);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error fetching boxes:', err);
                this.loading.set(false);
            }
        });
    }

    private calculateStats(boxes: Box[]): void {
        const total = boxes.length;
        const available = boxes.filter(b => b.status === 'free').length;
        const occupied = boxes.filter(b => b.status === 'occupied').length;
        const revenue = boxes
            .filter(b => b.status === 'occupied')
            .reduce((sum, b) => sum + (b.rent + b.charges), 0);

        this.stats.set([
            { label: 'Total Box', value: total, icon: 'bi-grid-3x3-gap-fill', color: 'primary' },
            { label: 'Occupés', value: occupied, icon: 'bi-shop-window', color: 'info' },
            { label: 'Disponibles', value: available, icon: 'bi-check-circle-fill', color: 'success' },
            { label: 'Revenus', value: revenue, icon: 'bi-cash-stack', color: 'warning' }
        ]);
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'occupied': return 'status-occupied';
            case 'free': return 'status-free';
            case 'reserved': return 'status-reserved';
            case 'under_repair': return 'status-under_repair';
            default: return 'status-unknown';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'all': return 'Tous les statuts';
            case 'occupied': return 'Occupé';
            case 'free': return 'Libre';
            case 'reserved': return 'Réservé';
            case 'under_repair': return 'En travaux';
            default: return status;
        }
    }


    formatPrice(price: number): string {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }
}


