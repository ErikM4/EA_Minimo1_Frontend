import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PageParams, PaginatedResponse, Report, ReportInput, ReportUpdate } from '../models';
import { toHttpParams } from '../utils/page-params';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  // El backend aplica la paginación y los filtros antes de devolver los reportes.
  getReports(params: PageParams = {}): Observable<PaginatedResponse<Report>> {
    return this.http.get<PaginatedResponse<Report>>(this.apiUrl, {
      params: toHttpParams({ ...params, search: params.search?.trim() }),
    });
  }

  getReport(id: string): Observable<{ report: Report }> {
    return this.http.get<{ report: Report }>(`${this.apiUrl}/${id}`);
  }

  createReport(payload: ReportInput): Observable<{ report: Report }> {
    // El servidor decide quién envía el reporte y cuál es su estado inicial.
    return this.http.post<{ report: Report }>(this.apiUrl, payload);
  }

  updateReport(id: string, payload: ReportUpdate): Observable<{ report: Report }> {
    return this.http.put<{ report: Report }>(`${this.apiUrl}/${id}`, payload);
  }

  softDeleteReport(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/soft-delete`, {});
  }

  deleteReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  bulkSoftDeleteReports(ids: string[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/bulk-soft-delete`, { ids });
  }

  bulkDeleteReports(ids: string[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bulk`, { body: { ids } });
  }
}
