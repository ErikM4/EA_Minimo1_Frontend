import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Activity, ActivityInput, PageParams, PaginatedResponse } from '../models';
import { toHttpParams } from '../utils/page-params';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/activities`;

  // La API devuelve únicamente la página solicitada y el total para el control de páginas.
  getActivities(params: PageParams = {}): Observable<PaginatedResponse<Activity>> {
    return this.http.get<PaginatedResponse<Activity>>(this.apiUrl, {
      params: toHttpParams({ ...params, search: params.search?.trim() }),
    });
  }

  getActivity(id: string): Observable<{ activity: Activity }> {
    return this.http.get<{ activity: Activity }>(`${this.apiUrl}/${id}`);
  }

  joinActivity(id: string): Observable<{ activity: Activity }> {
    // La API añade a la persona inscrita y devuelve la actividad actualizada.
    return this.http.post<{ activity: Activity }>(`${this.apiUrl}/${id}/participants`, {});
  }

  createActivity(payload: ActivityInput): Observable<{ activity: Activity }> {
    return this.http.post<{ activity: Activity }>(this.apiUrl, payload);
  }

  updateActivity(id: string, payload: Partial<ActivityInput>): Observable<{ activity: Activity }> {
    return this.http.put<{ activity: Activity }>(`${this.apiUrl}/${id}`, payload);
  }

  softDeleteActivity(id: string): Observable<void> {
    // El archivo conserva la actividad para que el administrador pueda consultarla.
    return this.http.patch<void>(`${this.apiUrl}/${id}/soft-delete`, {});
  }

  restoreActivity(id: string): Observable<{ activity: Activity }> {
    return this.http.patch<{ activity: Activity }>(`${this.apiUrl}/${id}/restore`, {});
  }

  deleteActivity(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  bulkSoftDeleteActivities(ids: string[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/bulk-soft-delete`, { ids });
  }

  bulkDeleteActivities(ids: string[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bulk`, { body: { ids } });
  }
}
