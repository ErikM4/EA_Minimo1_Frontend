import { Component, computed, input, output, signal } from '@angular/core';

interface ImperativeConfirmation {
  title: string;
  message: string;
  confirmText: string;
}

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css',
})
export class ConfirmModal {
  open = input<boolean>(false);
  title = input<string>('¿Estás seguro?');
  message = input<string>('');
  confirmText = input<string>('Confirmar');
  cancelText = input<string>('Cancelar');

  private imperativeConfirmation = signal<ImperativeConfirmation | null>(null);
  isOpen = computed(() => this.open() || this.imperativeConfirmation() !== null);
  displayTitle = computed(() => this.imperativeConfirmation()?.title ?? this.title());
  displayMessage = computed(() => this.imperativeConfirmation()?.message ?? this.message());
  displayConfirmText = computed(
    () => this.imperativeConfirmation()?.confirmText ?? this.confirmText(),
  );

  confirmed = output<void>();
  cancelled = output<void>();

  // Permite que un listado muestre el mensaje adecuado antes de una acción importante.
  openWith(title: string, message: string, confirmText = 'Confirmar'): void {
    this.imperativeConfirmation.set({ title, message, confirmText });
  }

  confirm(): void {
    // Cerramos el modal antes de avisar que la persona confirmó.
    this.imperativeConfirmation.set(null);
    this.confirmed.emit();
  }

  cancel(): void {
    // Cancelar solo cierra el modal y avisa al componente.
    this.imperativeConfirmation.set(null);
    this.cancelled.emit();
  }
}