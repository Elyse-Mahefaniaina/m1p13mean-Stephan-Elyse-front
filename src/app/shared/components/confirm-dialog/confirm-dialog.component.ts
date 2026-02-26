import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var bootstrap: any;

/**
 * A fully reusable confirmation dialog component.
 *
 * Usage (from any parent template):
 *   <app-confirm-dialog
 *       title="Supprimer l'utilisateur"
 *       message="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
 *       detail="Cette action est irréversible."
 *       icon="bi-trash-fill"
 *       theme="danger"
 *       confirmText="Supprimer"
 *       cancelText="Annuler"
 *       (confirmed)="onDeleteConfirmed()"
 *       (cancelled)="onDeleteCancelled()">
 *   </app-confirm-dialog>
 *
 * Then call confirmDialog.open() from the parent via @ViewChild.
 */
@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent implements AfterViewInit, OnDestroy {
    @ViewChild('confirmModal') modalRef!: ElementRef;

    // --- Configurable Inputs ---
    @Input() title = 'Confirmation';
    @Input() message = 'Êtes-vous sûr de vouloir effectuer cette action ?';
    @Input() detail = '';
    @Input() icon = 'bi-exclamation-triangle-fill';
    @Input() theme: 'danger' | 'warning' | 'info' | 'primary' = 'danger';
    @Input() confirmText = 'Confirmer';
    @Input() cancelText = 'Annuler';

    // Optional: display an item summary (name + subtitle) inside the dialog
    @Input() itemName = '';
    @Input() itemSubtitle = '';

    // --- Outputs ---
    @Output() confirmed = new EventEmitter<void>();
    @Output() cancelled = new EventEmitter<void>();

    private modalInstance: any;

    ngAfterViewInit(): void {
        this.modalInstance = new bootstrap.Modal(this.modalRef.nativeElement, {
            backdrop: 'static',
            keyboard: false
        });

        this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
            this.cancelled.emit();
        });
    }

    ngOnDestroy(): void {
        this.modalInstance?.dispose();
    }

    /** Open the dialog programmatically */
    open(): void {
        this.modalInstance?.show();
    }

    /** Close without confirming */
    dismiss(): void {
        this.modalInstance?.hide();
    }

    /** User clicked confirm */
    onConfirm(): void {
        this.confirmed.emit();
        this.modalInstance?.hide();
    }
}
