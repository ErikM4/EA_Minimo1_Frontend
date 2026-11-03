import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PageParams, PaginatedResponse, User, UserInput } from '../models';
import { toHttpParams } from '../utils/page-params';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  // Las operaciones del listado usan la API para paginar, filtrar y ordenar.
  getUser(id: string): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/${id}`);
  }

  getUsers(params: PageParams = {}): Observable<PaginatedResponse<User>> {
    return this.http.get<PaginatedResponse<User>>(this.apiUrl, {
      params: toHttpParams({ ...params, search: params.search?.trim() }),
    });
  }

  createUser(payload: UserInput): Observable<{ user: User }> {
    return this.http.post<{ user: User }>(this.apiUrl, payload);
  }

  updateUser(id: string, payload: Partial<UserInput>): Observable<{ user: User }> {
    return this.http.put<{ user: User }>(`${this.apiUrl}/${id}`, payload);
  }

  deleteUser(id: string): Observable<void> {
    // El borrado lógico permite recuperar la cuenta más adelante.
    return this.http.patch<void>(`${this.apiUrl}/${id}/soft-delete`, {});
  }

  hardDeleteUser(id: string): Observable<void> {
    // El borrado definitivo elimina la cuenta de la base de datos.
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  restoreUser(id: string): Observable<{ user: User }> {
    return this.http.patch<{ user: User }>(`${this.apiUrl}/${id}/restore`, {});
  }

  bulkSoftDeleteUsers(ids: string[]): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/bulk-soft-delete`, { ids });
  }

  bulkHardDeleteUsers(ids: string[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bulk`, { body: { ids } });
  }
}
