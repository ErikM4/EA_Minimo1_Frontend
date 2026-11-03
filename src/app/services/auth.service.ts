import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, firstValueFrom, map, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '../models';


const USER_KEY = 'user';

// Al iniciar, recuperamos el usuario que se guardó al entrar por última vez.
function readStoredUser(): User | null {
  const stored = localStorage.getItem(USER_KEY);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as User;
  } catch {
    // Si el dato guardado no se puede leer, iniciamos sin una sesión guardada.
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = `${environment.apiUrl}/auth`;

  // El token de acceso vive en memoria y se envía en las peticiones protegidas.
  private accessToken = signal<string | null>(null);

  // El usuario actual solo se puede consultar desde fuera de este servicio.
  private currentUser = signal<User | null>(readStoredUser());
  readonly user = this.currentUser.asReadonly();

  // Estas señales permiten mostrar opciones distintas según la cuenta activa.
  readonly isLoggedIn = computed(() => this.accessToken() !== null);
  readonly isAdmin = computed(() => this.currentUser()?.role.toUpperCase() === 'ADMIN');
  readonly canPublishActivities = computed(() =>
    ['ADMIN', 'STORE_HOST'].includes(this.currentUser()?.role.toUpperCase() ?? ''),
  );

  /** POST /auth/register. No inicia sesión: la API no devuelve token y hay que hacer login */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, data);
  }

  /** POST /auth/login. Si va bien, guarda el access token en memoria y el usuario */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, credentials, { withCredentials: true })
      .pipe(
        // Guardamos la sesión sin cambiar la respuesta que recibe la pantalla.
        tap((response) => {
          this.accessToken.set(response.token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          this.currentUser.set(response.user);
        }),
      );
  }

  /** POST /auth/refresh. El navegador envía la cookie y recibe un token de acceso nuevo. */
  refresh(): Observable<string> {
    return this.http
      .post<RefreshResponse>(`${this.baseUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((response) => this.accessToken.set(response.token)),
        // La pantalla solo necesita el texto del token nuevo.
        map((response) => response.token),
      );
  }

  /** Al arrancar la app: si la cookie del refresh token sigue siendo válida, recupera la sesión */
  async restoreSession(): Promise<void> {
    try {
      // Renovamos el token y después pedimos los datos actuales del usuario.
      await firstValueFrom(this.refresh());
      const { user } = await firstValueFrom(
        this.http.get<{ user: User }>(`${environment.apiUrl}/users/me`),
      );
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      this.currentUser.set(user);
    } catch {
      // Si no se puede recuperar la sesión, quitamos los datos guardados.
      this.clearLocalSession();
    }
  }

  /** Cierra la sesión: avisa a la API para que borre la cookie y olvide el token, y limpia lo local */
  logout(): void {
    // La limpieza se hace al terminar la petición, incluso si la API da un error.
    this.http
      .post(`${this.baseUrl}/logout`, {}, { withCredentials: true })
      .pipe(finalize(() => this.clearSession()))
      .subscribe({ error: () => {} });
  }

  // Quitamos de memoria y del navegador los datos de la sesión.
  clearLocalSession(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(USER_KEY);
  }

/** Limpia la sesión y lleva al login */
  clearSession(): void {
    this.clearLocalSession();
    this.router.navigate(['/login']);
  }

  /** El access token en memoria, o null si no hay sesión. Lo usa el interceptor */
  getToken(): string | null {
    return this.accessToken();
  }

  
}