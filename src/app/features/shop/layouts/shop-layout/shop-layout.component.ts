import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
    selector: 'app-shop-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SidebarComponent],
    templateUrl: './shop-layout.component.html',
    styleUrl: './shop-layout.component.css'
})
export class ShopLayoutComponent { }
