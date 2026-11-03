// Parámetros que comparten los listados paginados del backoffice.
export interface PageParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  showDeleted?: boolean;
  role?: string;
  status?: string;
  category?: string;
  subcategory?: string;
  reason?: string;
  targetType?: string;
}

// Forma común de la respuesta paginada que devuelve el servidor.
export interface PaginatedResponse<T> {
  data: T[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
}
