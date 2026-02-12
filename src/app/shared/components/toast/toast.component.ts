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
        <div class="toast show text-white border-0" 
             [class]="'bg-' + t.type" 
             role="alert" 
             aria-live="assertive" 
             aria-atomic="true">
          <div class="d-flex align-items-center py-2 px-3">
            <div class="d-flex align-items-center me-2">
              @switch (t.type) {
                @case ('success') { <i class="bi bi-check-circle-fill"></i> }
                @case ('danger') { <i class="bi bi-exclamation-triangle-fill"></i> }
                @case ('warning') { <i class="bi bi-exclamation-circle-fill"></i> }
                @default { <i class="bi bi-info-circle-fill"></i> }
              }
            </div>
            <div class="toast-body p-0 fw-medium flex-grow-1 lh-sm">
              {{ t.message }}
            </div>
            <button type="button" 
                    class="btn-close btn-close-white ms-2" 
                    style="font-size: 0.6rem; padding: 0.5rem;"
                    (click)="toastService.clear()" 
                    aria-label="Close"></button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .toast {
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease-out;
      max-width: 350px;
      width: fit-content;
      min-width: 250px;
    }
    .toast-body {
      word-break: break-word;
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
