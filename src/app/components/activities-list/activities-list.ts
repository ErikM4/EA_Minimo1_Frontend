import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { Activity } from '../../models';
import { ActivityService } from '../../services/activity.service';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { apiErrorMessage } from '../../utils/api-error';
import { ConfirmModal } from '../confirm-modal/confirm-modal';
import { Pagination } from '../pagination/pagination';

const PAGE_SIZE = 10;

// Esta pantalla comparte el listado público y las herramientas del administrador.
@Component({
  selector: 'app-activities-list',
  imports: [DatePipe, FormsModule, RouterLink, ConfirmModal, Pagination],
  templateUrl: './activities-list.html',
  styleUrl: './activities-list.css',
})
export class ActivitiesList implements OnInit {
  private activityService = inject(ActivityService);
  private chatService = inject(ChatService);
  auth = inject(AuthService);

  @ViewChild(ConfirmModal) private confirmModal?: ConfirmModal;

  activities = signal<Activity[]>([]);
  page = signal(1);
  totalPages = signal(1);
  loading = signal(true);
  deleting = signal(false);
  restoringIds = signal<Set<string>>(new Set());
  joiningIds = signal<Set<string>>(new Set());
  error = signal('');
  search = signal('');
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');
  selectedIds = signal<Set<string>>(new Set());
  showDeleted = signal(false);
  statusFilter = signal('');
  pendingDelete = signal<{ ids: string[]; permanent: boolean } | null>(null);

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading.set(true);
    this.error.set('');
    this.activityService
      .getActivities({
        page: this.page(),
        limit: PAGE_SIZE,
        sortBy: this.sortBy(),
        sortOrder: this.sortOrder(),
        search: this.search(),
        // Solo el administrador puede pedir elementos archivados.
        showDeleted: this.auth.isAdmin() && this.showDeleted(),
        status: this.statusFilter() || undefined,
      })
      .subscribe({
        next: (response) => {
          const totalPages = Math.max(response.totalPages, 1);
          if (response.data.length === 0 && this.page() > totalPages) {
            this.page.set(totalPages);
            this.loadActivities();
            return;
          }
          this.activities.set(response.data);
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
    this.loadActivities();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadActivities();
  }

  onSearchChange(search: string): void {
    this.search.set(search);
    this.page.set(1);
    this.loadActivities();
  }

  onDeletedFilterChange(showDeleted: boolean): void {
    this.showDeleted.set(showDeleted);
    this.page.set(1);
    this.loadActivities();
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadActivities();
  }

  isJoined(activity: Activity): boolean {
    const userId = this.auth.user()?._id;
    return !!userId && (activity.participants ?? []).some((participant) => participant.userId === userId);
  }

  join(activity: Activity): void {
    if (this.joiningIds().has(activity._id)) return;
    this.error.set('');
    this.joiningIds.update((ids) => new Set(ids).add(activity._id));

    this.activityService.joinActivity(activity._id).subscribe({
      next: ({ activity: updatedActivity }) => {
        // Al apuntarse, la persona queda registrada también como miembro de la sala de chat.
        this.chatService.registerActivityRoom(updatedActivity._id);
        this.activities.update((activities) =>
          activities.map((item) => item._id === updatedActivity._id ? updatedActivity : item),
        );
        this.joiningIds.update((ids) => {
          const next = new Set(ids);
          next.delete(activity._id);
          return next;
        });
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.joiningIds.update((ids) => {
          const next = new Set(ids);
          next.delete(activity._id);
          return next;
        });
      },
    });
  }

  restoreActivity(activity: Activity): void {
    if (this.restoringIds().has(activity._id)) return;
    this.error.set('');
    this.restoringIds.update((ids) => new Set(ids).add(activity._id));

    this.activityService.restoreActivity(activity._id).subscribe({
      next: () => {
        this.restoringIds.update((ids) => {
          const next = new Set(ids);
          next.delete(activity._id);
          return next;
        });
        this.loadActivities();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.restoringIds.update((ids) => {
          const next = new Set(ids);
          next.delete(activity._id);
          return next;
        });
      },
    });
  }

  isAllSelected(): boolean {
    return this.activities().length > 0
      && this.activities().every((activity) => this.selectedIds().has(activity._id));
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.set(
      checked ? new Set(this.activities().map((activity) => activity._id)) : new Set(),
    );
  }

  toggleSelected(id: string, event: Event): void {
    const selected = new Set(this.selectedIds());
    if ((event.target as HTMLInputElement).checked) selected.add(id);
    else selected.delete(id);
    this.selectedIds.set(selected);
  }

  requestDelete(ids: string[], permanent: boolean): void {
    // El modal evita borrar o archivar actividades por un clic accidental.
    this.pendingDelete.set({ ids, permanent });
    const message = permanent
      ? `Se eliminarán definitivamente ${ids.length} actividad(es). Esta acción no se puede deshacer.`
      : `Se archivarán ${ids.length} actividad(es).`;
    this.confirmModal?.openWith(
      permanent ? 'Confirmar eliminación definitiva' : 'Confirmar archivado',
      message,
      permanent ? 'Eliminar definitivamente' : 'Archivar',
    );
  }

  confirmDelete(): void {
    const pending = this.pendingDelete();
    if (!pending || this.deleting()) return;

    // La misma confirmación sirve para un elemento o para toda la selección.
    this.deleting.set(true);
    this.error.set('');
    let request: Observable<void>;
    if (pending.ids.length > 1) {
      request = pending.permanent
        ? this.activityService.bulkDeleteActivities(pending.ids)
        : this.activityService.bulkSoftDeleteActivities(pending.ids);
    } else {
      request = pending.permanent
        ? this.activityService.deleteActivity(pending.ids[0])
        : this.activityService.softDeleteActivity(pending.ids[0]);
    }

    request.subscribe({
      next: () => {
        this.pendingDelete.set(null);
        this.selectedIds.set(new Set());
        this.deleting.set(false);
        this.loadActivities();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.deleting.set(false);
      },
    });
  }
}
