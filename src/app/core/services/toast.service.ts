import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'danger' | 'warning' | 'info';

export interface Toast {
    message: string;
    type: ToastType;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    toast = signal<Toast | null>(null);

    show(message: string, type: ToastType = 'info') {
        this.toast.set({ message, type });

        // Auto-hide after 3 seconds
        setTimeout(() => {
            this.toast.set(null);
        }, 3000);
    }

    clear() {
        this.toast.set(null);
    }
}
