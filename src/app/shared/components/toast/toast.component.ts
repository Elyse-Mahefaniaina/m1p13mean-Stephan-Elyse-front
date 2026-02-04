import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    @if (toastService.toast(); as t) {
      <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999">
        <div class="toast show text-white border-0 p-1" 
             [class]="'bg-' + t.type" 
             role="alert" 
             aria-live="assertive" 
             aria-atomic="true">
          <div class="d-flex align-items-start p-2">
            <div class="toast-icon me-2 pt-1">
              @switch (t.type) {
                @case ('success') { <i class="bi bi-check-circle-fill"></i> }
                @case ('danger') { <i class="bi bi-exclamation-triangle-fill"></i> }
                @case ('warning') { <i class="bi bi-exclamation-circle-fill"></i> }
                @default { <i class="bi bi-info-circle-fill"></i> }
              }
            </div>
            <div class="toast-body fw-medium flex-grow-1 py-1 lh-sm">
              {{ t.message }}
            </div>
            <button type="button" 
                    class="btn-close btn-close-white ms-2" 
                    (click)="toastService.clear()" 
                    aria-label="Close"></button>
          </div>
        </div>
      </div>
    }
  `,
    styles: [`
    .toast {
      border-radius: 12px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.2);
      animation: slideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      max-width: 380px;
      min-width: 280px;
    }
    .toast-icon {
      font-size: 1.2rem;
      opacity: 0.9;
    }
    .toast-body {
      word-break: break-word; /* Ensure long words wrap */
      font-size: 0.95rem;
    }
    @keyframes slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
    toastService = inject(ToastService);
}
