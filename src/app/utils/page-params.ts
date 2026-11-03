import { HttpParams } from '@angular/common/http';

import { PageParams } from '../models';

// Convierte los filtros de la tabla en parámetros que se envían en la URL.
export function toHttpParams(params: PageParams): HttpParams {
  let httpParams = new HttpParams();
  for (const [key, value] of Object.entries(params)) {
    // Los valores vacíos no se envían para que no activen filtros sin contenido.
    if (value !== undefined && value !== null && value !== '') {
      httpParams = httpParams.set(key, String(value));
    }
  }
  return httpParams;
}
