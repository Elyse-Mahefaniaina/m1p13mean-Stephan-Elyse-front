import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-boxes',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './boxes.component.html',
    styleUrl: './boxes.component.css'
})
export class BoxesComponent {
    // Mock data for boxes - will be populated from API later
    boxes: any[] = [];

    // Stats for box management
    stats = [
        { label: 'Total Box', value: 0, icon: 'bi-box-seam', color: 'primary' },
        { label: 'Disponibles', value: 0, icon: 'bi-check-circle-fill', color: 'success' },
        { label: 'Occupés', value: 0, icon: 'bi-shop', color: 'info' },
        { label: 'En Maintenance', value: 0, icon: 'bi-wrench', color: 'warning' }
    ];
}
