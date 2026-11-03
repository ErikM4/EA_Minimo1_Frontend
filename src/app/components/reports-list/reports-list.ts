import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { Report } from '../../models';
import { ReportService } from '../../services/report.service';
import { apiErrorMessage } from '../../utils/api-error';
import { ConfirmModal } from '../confirm-modal/confirm-modal';
import { Pagination } from '../pagination/pagination';

const PAGE_SIZE = 10;

// Esta pantalla obtiene del servidor los reportes que se muestran en la tabla.
@Component({
  selector: 'app-reports-list',
  imports: [DatePipe, FormsModule, RouterLink, ConfirmModal, Pagination],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.css',
})
export class ReportsList implements OnInit {
  private reportService = inject(ReportService);

  @ViewChild(ConfirmModal) private confirmModal?: ConfirmModal;

  reports = signal<Report[]>([]);
  page = signal(1);
  totalPages = signal(1);
  loading = signal(true);
  deleting = signal(false);
  error = signal('');
  search = signal('');
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');
  selectedIds = signal<Set<string>>(new Set());
  showDeleted = signal(false);
  statusFilter = signal('');
  pendingDelete = signal<{ ids: string[]; permanent: boolean } | null>(null);

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.loading.set(true);
    this.error.set('');
    this.reportService
      .getReports({
        page: this.page(),
        limit: PAGE_SIZE,
        sortBy: this.sortBy(),
        sortOrder: this.sortOrder(),
        search: this.search(),
        showDeleted: this.showDeleted(),
        status: this.statusFilter() || undefined,
      })
      .subscribe({
        next: (response) => {
          const totalPages = Math.max(response.totalPages, 1);
          // Después de archivar el último reporte de una página, cargamos una página válida.
          if (response.data.length === 0 && this.page() > totalPages) {
            this.page.set(totalPages);
            this.loadReports();
            return;
          }
          this.reports.set(response.data);
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
    this.loadReports();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.loadReports();
  }

  onSearchChange(search: string): void {
    this.search.set(search);
    this.page.set(1);
    this.loadReports();
  }

  onDeletedFilterChange(showDeleted: boolean): void {
    this.showDeleted.set(showDeleted);
    this.page.set(1);
    this.loadReports();
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter.set(status);
    this.page.set(1);
    this.loadReports();
  }

  isAllSelected(): boolean {
    return this.reports().length > 0
      && this.reports().every((report) => this.selectedIds().has(report._id));
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectedIds.set(
      checked ? new Set(this.reports().map((report) => report._id)) : new Set(),
    );
  }

  toggleSelected(id: string, event: Event): void {
    const selected = new Set(this.selectedIds());
    if ((event.target as HTMLInputElement).checked) selected.add(id);
    else selected.delete(id);
    this.selectedIds.set(selected);
  }

  requestDelete(ids: string[], permanent: boolean): void {
    // Se conserva la selección hasta que la persona confirme la operación.
    this.pendingDelete.set({ ids, permanent });
    const message = permanent
      ? `Se eliminarán definitivamente ${ids.length} reporte(s). Esta acción no se puede deshacer.`
      : `Se archivarán ${ids.length} reporte(s).`;
    this.confirmModal?.openWith(
      permanent ? 'Confirmar eliminación definitiva' : 'Confirmar archivado',
      message,
      permanent ? 'Eliminar definitivamente' : 'Archivar',
    );
  }

  confirmDelete(): void {
    const pending = this.pendingDelete();
    if (!pending || this.deleting()) return;

    // Se usa la ruta individual o la ruta en grupo según el número de reportes.
    this.deleting.set(true);
    this.error.set('');
    let request: Observable<void>;
    if (pending.ids.length > 1) {
      request = pending.permanent
        ? this.reportService.bulkDeleteReports(pending.ids)
        : this.reportService.bulkSoftDeleteReports(pending.ids);
    } else {
      request = pending.permanent
        ? this.reportService.deleteReport(pending.ids[0])
        : this.reportService.softDeleteReport(pending.ids[0]);
    }

    request.subscribe({
      next: () => {
        this.pendingDelete.set(null);
        this.selectedIds.set(new Set());
        this.deleting.set(false);
        this.loadReports();
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.deleting.set(false);
      },
    });
  }

  targetId(report: Report): string {
    // La API puede devolver el identificador como texto o como objeto relacionado.
    return typeof report.targetId === 'string' ? report.targetId : report.targetId._id;
  }
}
