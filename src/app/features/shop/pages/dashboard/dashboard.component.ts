import { Component } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { RouterLink } from '@angular/router';
import localeFr from '@angular/common/locales/fr';

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
export class DashboardComponent {
  today = new Date();

  stats: DashboardStat[] = [
    {
      label: 'Revenus du mois',
      value: '21 250 500 Ar',
      icon: 'bi-cash-stack',
      color: 'primary',
      trend: '+12.5%',
      description: 'par rapport au mois dernier'
    },
    {
      label: 'Commandes totales',
      value: '156',
      icon: 'bi-cart-check-fill',
      color: 'blue',
      trend: '+8%',
      description: 'depuis l\'ouverture'
    },
    {
      label: 'Produits actifs',
      value: '42',
      icon: 'bi-box-seam-fill',
      color: 'green',
      description: 'dans votre catalogue'
    },
    {
      label: 'Note Boutique',
      value: '4.8/5',
      icon: 'bi-star-fill',
      color: 'yellow',
      description: 'basé sur 85 avis'
    }
  ];

  recentOrders = [
    { id: '#ORD-7234', client: 'Jean Dupont', status: 'delivered', total: '625 000 Ar', date: 'Aujourd\'hui' },
    { id: '#ORD-7233', client: 'Marie Martin', status: 'shipped', total: '229 500 Ar', date: 'Hier' },
    { id: '#ORD-7232', client: 'Luc Bernard', status: 'pending', total: '1 050 000 Ar', date: 'Il y a 2 jours' }
  ];

  popularProducts = [
    { name: 'Montre Élégance Noir', sales: 45, price: '449 500 Ar', stock: 12 },
    { name: 'Sac à main Cuir', sales: 32, price: '600 000 Ar', stock: 5 },
    { name: 'Écharpe en Soie', sales: 28, price: '175 000 Ar', stock: 25 }
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'delivered': return 'bg-success-subtle text-success';
      case 'shipped': return 'bg-primary-subtle text-primary';
      case 'pending': return 'bg-warning-subtle text-warning';
      default: return 'bg-secondary-subtle text-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'delivered': return 'Livré';
      case 'shipped': return 'Expédié';
      case 'pending': return 'En attente';
      default: return status;
    }
  }
}
