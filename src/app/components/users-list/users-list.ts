import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { User } from '../../models';
import { UserService } from '../../services/user.service';
import { apiErrorMessage } from '../../utils/api-error';
import { ConfirmModal } from '../confirm-modal/confirm-modal';
import { Pagination } from '../pagination/pagination';

const PAGE_SIZE = 10;

// Esta pantalla pide al servidor solo los usuarios de la página actual.
@Component({
  selector: 'app-users-list',
  imports: [FormsModule, RouterLink, ConfirmModal, Pagination],
  templateUrl: './users-list.html',
  styleUrl: './users-list.css',
})
export class UsersList implements OnInit {
  private userService = inject(UserService);

  @ViewChild(ConfirmModal) private confirmModal?: ConfirmModal;

  users = signal<User[]>([]);
  page = signal(1);
  totalPages = signal(1);
  loading = signal(true);
  deleting = signal(false);
  error = signal('');
  search = signal('');
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');
  showDeleted = signal(false);
  selectedIds = signal<Set<string>>(new Set());
  pendingDelete = signal<{ ids: string[]; permanent: boolean } | null>(null);

  ngOnInit(): void {
    this.loadUsers();
  }

  // Carga la página y conserva los filtros y el orden elegidos.
  loadUsers(): void {
    this.loading.set(true);
    this.error.set('');
    this.userService
      .getUsers({
        page: this.page(),
        limit: PAGE_SIZE,
        sortBy: this.sortBy(),
        sortOrder: this.sortOrder(),
        search: this.search(),
        showDeleted: this.showDeleted(),
      })
      .subscribe({
        next: (response) => {
          const totalPages = Math.max(response.totalPages, 1);
          // Si una eliminación deja vacía la página actual, volvemos a la última disponible.
          if (response.data.length === 0 && this.page() > totalPages) {
            this.page.set(totalPages);
            this.loadUsers();
            return;
          }
          this.users.set(response.data);
          this.totalPages.set(totalPages);
          this.selectedIds.set(new Set());
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(apiErrorMessage(err));
          this.loading.set(false);
        },
      });
  }

  sort(column: string): void {
    if (this.sortBy() === column) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortOrder.set('asc');
    }
    this.page.set(1);
    this.loadUsers();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadUsers();
  }

  onSearchChange(search: string): void {
    this.search.set(search);
    this.page.set(1);
    this.loadUsers();
  }

  onDeletedFilterChange(showDeleted: boolean): void {
    this.showDeleted.set(showDeleted);
    this.page.set(1);
    this.loadUsers();
  }

  isAllSelected(): boolean {
    return this.users().length > 0 && this.users().every((user) => this.selectedIds().has(user._id));
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.set(checked ? new Set(this.users().map((user) => user._id)) : new Set());
  }

  toggleSelected(id: string, event: Event): void {
    const selected = new Set(this.selectedIds());
    if ((event.target as HTMLInputElement).checked) selected.add(id);
    else selected.delete(id);
    this.selectedIds.set(selected);
  }

  requestDelete(ids: string[], permanent: boolean): void {
    // Guardamos la operación hasta que la persona la confirme en el modal.
    this.pendingDelete.set({ ids, permanent });
    const count = ids.length;
    const noun = count === 1 ? 'usuario' : 'usuarios';
    const message = permanent
      ? `Se eliminarán definitivamente ${count} ${noun}. Esta acción no se puede deshacer.`
      : `Se archivarán ${count} ${noun}. Puedes volver a mostrarlos activando el filtro de eliminados.`;
    this.confirmModal?.openWith(
      permanent ? 'Confirmar eliminación definitiva' : 'Confirmar archivado',
      message,
      permanent ? 'Eliminar definitivamente' : 'Archivar',
    );
  }

  confirmDelete(): void {
    const pending = this.pendingDelete();
    if (!pending || this.deleting()) return;

    // Separa el borrado lógico del borrado definitivo y admite acciones en grupo.
    this.error.set('');
    this.deleting.set(true);
    let request: Observable<void>;
    if (pending.ids.length > 1) {
      request = pending.permanent
        ? this.userService.bulkHardDeleteUsers(pending.ids)
        : this.userService.bulkSoftDeleteUsers(pending.ids);
    } else {
      request = pending.permanent
        ? this.userService.hardDeleteUser(pending.ids[0])
        : this.userService.deleteUser(pending.ids[0]);
    }

    request.subscribe({
      next: () => {
        this.pendingDelete.set(null);
        this.selectedIds.set(new Set());
        this.deleting.set(false);
        this.loadUsers();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.deleting.set(false);
      },
    });
  }

  restoreUser(user: User): void {
    // La restauración solo está disponible para usuarios archivados.
    this.userService.restoreUser(user._id).subscribe({
      next: () => this.loadUsers(),
      error: (err: HttpErrorResponse) => this.error.set(apiErrorMessage(err)),
    });
  }
}
