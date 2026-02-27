import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface StockItem {
    id: string;
    productName: string;
    sku: string;
    category: string;
    currentStock: number;
    minStock: number;
    unit: string;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    lastUpdated: string;
}

@Component({
    selector: 'app-stock-level',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './stock-level.component.html',
    styleUrl: './stock-level.component.css'
})
export class StockLevelComponent implements OnInit {
    stockData = signal<StockItem[]>([]);
    searchTerm = signal('');
    statusFilter = signal('all');
    loading = signal(true);

    // Pagination
    currentPage = signal(1);
    pageSize = signal(10);

    filteredStock = computed(() => {
        let filtered = this.stockData();

        // Filter by search term
        const term = this.searchTerm().toLowerCase().trim();
        if (term) {
            filtered = filtered.filter(item =>
                item.productName.toLowerCase().includes(term) ||
                item.sku.toLowerCase().includes(term) ||
                item.category.toLowerCase().includes(term)
            );
        }

        // Filter by status
        const status = this.statusFilter();
        if (status !== 'all') {
            filtered = filtered.filter(item => {
                if (status === 'low') return item.status === 'Low Stock';
                if (status === 'out') return item.status === 'Out of Stock';
                if (status === 'ok') return item.status === 'In Stock';
                return true;
            });
        }

        return filtered;
    });

    paginatedStock = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        const end = start + this.pageSize();
        return this.filteredStock().slice(start, end);
    });

    totalPages = computed(() => Math.ceil(this.filteredStock().length / this.pageSize()));

    pages = computed(() => {
        const total = this.totalPages();
        return Array.from({ length: total }, (_, i) => i + 1);
    });

    stats = computed(() => {
        const data = this.stockData();
        return {
            total: data.length,
            lowStock: data.filter(item => item.status === 'Low Stock').length,
            outOfStock: data.filter(item => item.status === 'Out of Stock').length,
            okStock: data.filter(item => item.status === 'In Stock').length
        };
    });

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.loadStockData();
    }

    loadStockData() {
        this.loading.set(true);
        // Simulate API delay
        setTimeout(() => {
            this.http.get<StockItem[]>('assets/data/stock.json').subscribe({
                next: (data) => {
                    this.stockData.set(data);
                    this.loading.set(false);
                },
                error: (err) => {
                    console.error('Error loading stock data', err);
                    this.loading.set(false);
                }
            });
        }, 800);
    }

    getStatusClass(status: string): string {
        switch (status) {
            case 'In Stock': return 'status-active';
            case 'Low Stock': return 'status-pending';
            case 'Out of Stock': return 'status-suspended';
            default: return 'status-closed';
        }
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'In Stock': return 'En Stock';
            case 'Low Stock': return 'Stock Faible';
            case 'Out of Stock': return 'Rupture';
            default: return status;
        }
    }

    onPageChange(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }

    Math = Math; // To use in template
}
