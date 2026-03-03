import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import localeFr from '@angular/common/locales/fr';
import { OrderService, Order } from '../../../../core/services/order.service';
import { ProductService } from '../../../../core/services/product.service';
import { AuthService } from '../../../../core/services/auth.service';

registerLocaleData(localeFr);

interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  color: string;
  trend?: string;
  description?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private router = inject(Router);

  today = new Date();

  stats: DashboardStat[] = [
    {
      label: 'Total Commandes',
      value: '0',
      icon: 'bi-cart-check-fill',
      color: 'blue'
    },
    {
      label: 'Produits',
      value: '0',
      icon: 'bi-box-seam-fill',
      color: 'green'
    },
    {
      label: 'Chiffre d\'affaires',
      value: '0 Ar',
      icon: 'bi-cash-stack',
      color: 'primary'
    }
  ];
  orders: Order[] = [];
  productsCount = 0;

  ngOnInit(): void {
    this.loadOrders();
    this.loadProducts();
  }

  private loadOrders(): void {
    const shopId = this.getShopId();
    if (!shopId) return;
    this.orderService.getShopOrders(shopId).subscribe({
      next: (orders) => {
        this.orders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.buildStats();
      },
      error: (err) => {
        console.error('Error loading dashboard orders:', err);
        this.orders = [];
        this.buildStats();
      }
    });
  }

  private buildStats(): void {
    const totalOrders = this.orders.length;
    const revenue = this.orders
      .filter(o => o.status !== 'annulee')
      .reduce((acc, o) => acc + (o.total || 0), 0);

    this.stats = [
      {
        label: 'Total Commandes',
        value: String(totalOrders),
        icon: 'bi-cart-check-fill',
        color: 'blue'
      },
      {
        label: 'Produits',
        value: String(this.productsCount),
        icon: 'bi-box-seam-fill',
        color: 'green'
      },
      {
        label: 'Chiffre d\'affaires',
        value: `${this.formatAr(revenue)} Ar`,
        icon: 'bi-cash-stack',
        color: 'primary'
      }
    ];
  }

  private formatAr(value: number): string {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
  }

  private loadProducts(): void {
    const shopId = this.getShopId();
    if (!shopId) return;
    this.productService.getShopProducts(shopId).subscribe({
      next: (products) => {
        this.productsCount = products.length;
        this.buildStats();
      },
      error: (err) => {
        console.error('Error loading dashboard products:', err);
        this.productsCount = 0;
        this.buildStats();
      }
    });
  }

  private getShopId(): string | null {
    const rawData = localStorage.getItem('currentUser');
    if (!rawData) {
      this.authService.logout().subscribe({
        next: () => this.router.navigate(['/shop/login'])
      });
      return null;
    }

    let user: any = null;
    try {
      user = JSON.parse(rawData);
    } catch {
      user = rawData;
    }

    const shop = (user && typeof user === 'object') ? user.shop : null;
    const shopId = shop?._id || shop;
    if (!shopId) {
      this.authService.logout().subscribe({
        next: () => this.router.navigate(['/shop/login'])
      });
      return null;
    }
    return shopId;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'livree': return 'bg-success-subtle text-success';
      case 'terminee': return 'bg-success-subtle text-success';
      case 'expediee': return 'bg-primary-subtle text-primary';
      case 'en_preparation': return 'bg-primary-subtle text-primary';
      case 'en_attente': return 'bg-warning-subtle text-warning';
      case 'annulee': return 'bg-danger-subtle text-danger';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'livree': return 'Livrée';
      case 'terminee': return 'Terminée';
      case 'expediee': return 'Expédiée';
      case 'en_preparation': return 'En préparation';
      case 'en_attente': return 'En attente';
      case 'annulee': return 'Annulée';
      default: return status;
    }
  }

  getPaymentStatusClass(status?: string): string {
    switch (status) {
      case 'paid': return 'text-success bg-success-light';
      case 'pending': return 'text-warning bg-warning-light';
      case 'refunded': return 'text-danger bg-danger-light';
      default: return '';
    }
  }

  getPaymentStatusLabel(status?: string): string {
    switch (status) {
      case 'paid': return 'Payé';
      case 'pending': return 'Attente';
      case 'refunded': return 'Remboursé';
      default: return 'N/A';
    }
  }
}
