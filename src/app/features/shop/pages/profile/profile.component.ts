import { UserService } from './../../../../core/services/user.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
    today: Date = new Date();


    // Mock User Data
    user = {
        firstName: 'Stephan',
        lastName: 'Elyse',
        email: 'contact@maboutique.mg',
        phone: '+261 34 00 000 00',
        role: 'Gérant de Boutique',
        avatar: null,
        bio: 'Passionné par le commerce de détail et les nouvelles technologies. Je gère cette boutique depuis 2024.',
        joinedDate: 'Janvier 2024'
    };

    // Mock Shop Data
    shop = {
        name: 'MA BOUTIQUE',
        category: 'Mode & Accessoires',
        status: 'Actif',
        description: 'Vente de vêtements haut de gamme et accessoires de mode.',
    };

    activeTab: string = 'personal';

    constructor(
      private userService: UserService
    ) { }

    ngOnInit(): void {
      this.getCurrecteUserDetails();
    }

    getCurrecteUserDetails() {
      const rawData = localStorage.getItem("currentUser");
      let user = rawData ? JSON.parse(rawData) : null;

      if(user) {
        this.userService.getUserById(user.id).subscribe({})
        this.shop = user.shop;
      }
    }

    setActiveTab(tab: string): void {
        this.activeTab = tab;
    }

    saveProfile(): void {
        // Logic for saving profile would go here
        console.log('Profile saved');
    }

    saveShop(): void {
        // Logic for saving shop settings would go here
        console.log('Shop settings saved');
    }

    changePassword(): void {
        // Logic for changing password would go here
        console.log('Password changing');
    }
}
