// Un usuario puede entrar en la aplicación y tener uno de estos roles.
export type UserRole = 'USER' | 'ADMIN' | 'STORE_HOST';

// Datos de usuario que devuelve la API, sin incluir la contraseña.
export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  deleted?: boolean;
  isBanned?: boolean;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface UserInput {
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

// POST /auth/register
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
}

// POST /auth/login
export interface LoginRequest {
  email: string;
  password: string;
}
// Respuesta de inicio de sesión con el token y los datos públicos de la cuenta.
export interface LoginResponse {
  token: string;
  user: User;
}

// POST /auth/refresh
export interface RefreshResponse {
  token: string;
}
