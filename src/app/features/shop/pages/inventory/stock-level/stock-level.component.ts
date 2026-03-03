import { Component, OnInit, signal, computed, inject, ViewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../../../../core/services/product.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ProductFormModalComponent } from '../../../components/product-form-modal/product-form-modal.component';
import { ProductDetailModalComponent } from '../../../components/product-detail-modal/product-detail-modal.component';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-stock-level',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ProductFormModalComponent,
        ProductDetailModalComponent,
        ConfirmDialogComponent
    ],
    templateUrl: './stock-level.component.html',
    styleUrl: './stock-level.component.css'
})
export class StockLevelComponent implements OnInit {
    @ViewChild(ProductFormModalComponent) productFormModal!: ProductFormModalComponent;
    @ViewChild(ProductDetailModalComponent) productDetailModal!: ProductDetailModalComponent;
    @ViewChild(ConfirmDialogComponent) confirmDialog!: ConfirmDialogComponent;

    private productService = inject(ProductService);
    private toastService = inject(ToastService);
    protected Math = Math;

    // State
    allProducts = signal<Product[]>([]);
    loading = signal(true);
    searchTerm = signal('');
    statusFilter = signal('all');
    currentPage = signal(1);
    pageSize = signal(10);
    productToDelete = signal<Product | null>(null);

    constructor() {
        // Reset to first page when filters change
        effect(() => {
            this.searchTerm();
            this.statusFilter();
            this.currentPage.set(1);
        }, { allowSignalWrites: true });
    }

    ngOnInit() {
        this.loadProducts();
    }

    loadProducts() {
        this.loading.set(true);
        this.productService.getShopProducts().subscribe({
            next: (data: Product[]) => {
                this.allProducts.set(data);
                this.loading.set(false);
            },
            error: (err: any) => {
                console.error('Error loading products', err);
                this.toastService.show('Erreur lors du chargement des produits', 'danger');
                this.loading.set(false);
            }
        });
    }

    // Computed
    filteredStock = computed(() => {
        let filtered = this.allProducts();
        const term = this.searchTerm().toLowerCase().trim();
        const status = this.statusFilter();

        if (term) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(term) ||
                (item.sku && item.sku.toLowerCase().includes(term)) ||
                item.category.toLowerCase().includes(term)
            );
        }

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
        return this.filteredStock().slice(start, start + this.pageSize());
    });

    totalPages = computed(() => Math.ceil(this.filteredStock().length / this.pageSize()));

    pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));

    stats = computed(() => {
        const data = this.allProducts();
        return {
            total: data.length,
            lowStock: data.filter(item => item.status === 'Low Stock').length,
            outOfStock: data.filter(item => item.status === 'Out of Stock').length,
            okStock: data.filter(item => item.status === 'In Stock').length
        };
    });

    // Actions
    openCreateModal() {
        this.productFormModal.open();
    }

    openEditModal(product: Product) {
        this.productFormModal.openForEdit(product);
    }

    openDetailModal(product: Product) {
        this.productDetailModal.open(product);
    }

    openDeleteModal(product: Product) {
        this.productToDelete.set(product);
        this.confirmDialog.open();
    }

    onProductSaved(productData: Partial<Product>) {
        if (productData.id) {
            // Update
            this.productService.updateProduct(productData.id, productData).subscribe({
                next: (updated) => {
                    this.allProducts.update(products =>
                        products.map(p => p.id === updated.id ? { ...p, ...updated } : p)
                    );
                    this.toastService.show('Produit mis à jour avec succès', 'success');
                }
            });
        } else {
            // Create
            this.productService.createProduct(productData).subscribe({
                next: (created) => {
                    this.allProducts.update(products => [created, ...products]);
                    this.toastService.show('Produit créé avec succès', 'success');
                }
            });
        }
    }

    onDeleteConfirmed() {
        const product = this.productToDelete();
        if (product) {
            this.productService.deleteProduct(product.id).subscribe({
                next: () => {
                    this.allProducts.update(products => products.filter(p => p.id !== product.id));
                    this.toastService.show('Produit supprimé', 'success');
                }
            });
        }
        this.productToDelete.set(null);
    }

    onPageChange(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
        }
    }

    getStatusClass(status?: string): string {
        switch (status) {
            case 'In Stock': return 'status-active';
            case 'Low Stock': return 'status-pending';
            case 'Out of Stock': return 'status-suspended';
            default: return 'status-closed';
        }
    }

    getStatusLabel(status?: string): string {
        switch (status) {
            case 'In Stock': return 'En Stock';
            case 'Low Stock': return 'Stock Faible';
            case 'Out of Stock': return 'Rupture';
            default: return status || 'Inconnu';
        }
    }
}
