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
      value: '4 250,50 €',
      icon: 'bi-currency-euro',
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
    { id: '#ORD-7234', client: 'Jean Dupont', status: 'delivered', total: '125,00 €', date: 'Aujourd\'hui' },
    { id: '#ORD-7233', client: 'Marie Martin', status: 'shipped', total: '45,90 €', date: 'Hier' },
    { id: '#ORD-7232', client: 'Luc Bernard', status: 'pending', total: '210,00 €', date: 'Il y a 2 jours' }
  ];

  popularProducts = [
    { name: 'Montre Élégance Noir', sales: 45, price: '89,90 €', stock: 12 },
    { name: 'Sac à main Cuir', sales: 32, price: '120,00 €', stock: 5 },
    { name: 'Écharpe en Soie', sales: 28, price: '35,00 €', stock: 25 }
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
