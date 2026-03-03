import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../../../core/services/product.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [CommonModule, RouterLink, ProductCardComponent],
    templateUrl: './wishlist.component.html',
    styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
    wishlistProducts = signal<Product[]>([]);
    isLoading = signal<boolean>(true);

    constructor(private router: Router) {}

    ngOnInit(): void {
        this.loadWishlist();
    }

    loadWishlist(): void {
      this.isLoading.set(true);

      try {
        const data = localStorage.getItem('wishlist');
        const products: Product[] = data ? JSON.parse(data) : [];

        this.wishlistProducts.set(products);
      } catch (err) {
        console.error('Erreur lors du chargement de la wishlist depuis localStorage', err);
        this.wishlistProducts.set([]);
      } finally {
        this.isLoading.set(false);
      }
    }

    onToggleWishlist(product: Product): void {
        this.removeFromWishlist(product);
    }

    removeFromWishlist(product: Product): void {
      this.wishlistProducts.set(
        this.wishlistProducts().filter(p => p._id !== product._id)
      );

      const updated = this.wishlistProducts().map(p => ({ ...p }));
      localStorage.setItem('wishlist', JSON.stringify(updated));
    }

    addToCart(product: Product): void {
        console.log('Added to cart:', product.name);
    }


    clearWishlist(): void {
      Swal.fire({
        title: 'Vider la liste de souhaits ?',
        text: "Voulez-vous vraiment supprimer tous les produits de votre wishlist ?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, vider',
        cancelButtonText: 'Annuler'
      }).then((result: any) => {
        if (result.isConfirmed) {
          this.wishlistProducts.set([]);
          localStorage.removeItem('wishlist');
          this.router.navigate(['/client/catalog']);
        }
      });
    }
}
