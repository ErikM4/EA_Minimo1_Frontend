# Guía del proyecto

Esta guía describe cómo está organizado el backoffice Angular y cómo funcionan sus pantallas
principales. Para instalarlo y arrancarlo, consulta el [README](README.md).

## 1. Inicio de la aplicación

La aplicación usa Angular como una SPA. El navegador carga una página y el router cambia las
pantallas sin recargar todo el sitio. `src/main.ts` inicia la aplicación y `src/app/app.config.ts`
registra las rutas, las peticiones HTTP, el interceptor y la recuperación de sesión.

El proyecto usa componentes standalone. Cada pantalla tiene una clase TypeScript, una plantilla HTML
y, cuando hace falta, un archivo CSS propio.

## 2. Pantallas y navegación

Las rutas están definidas en `src/app/app.routes.ts`:

| Ruta | Función | Acceso |
|---|---|---|
| `/login` | Iniciar sesión | Sin sesión activa |
| `/register` | Crear una cuenta | Sin sesión activa |
| `/` | Inicio con accesos según el rol | Con sesión |
| `/users` | Consultar y gestionar usuarios | ADMIN |
| `/activities` | Consultar actividades disponibles | Con sesión |
| `/activities/new` | Publicar una actividad | ADMIN o STORE_HOST |
| `/activities/:id/edit` | Editar una actividad | ADMIN |
| `/reports` | Consultar y moderar reportes | ADMIN |
| `/reports/new` | Enviar un reporte | Con sesión |
| `/chat` | Usar el chat | Con sesión |

La ruta de edición de reportes también está reservada a ADMIN. Los guards controlan qué pantallas se
abren, pero el backend vuelve a comprobar los permisos antes de cada operación.

`navbar` muestra enlaces según el rol. `home` sirve de página inicial y presenta accesos a las
funciones disponibles para la cuenta activa.

## 3. Componentes de cada entidad

Las pantallas de usuarios, actividades y reportes tienen un componente de listado y un formulario:

| Función | Listado | Formulario |
|---|---|---|
| Usuarios | `src/app/components/users-list/` | `src/app/components/user-form/` |
| Actividades | `src/app/components/activities-list/` | `src/app/components/activity-form/` |
| Reportes | `src/app/components/reports-list/` | `src/app/components/report-form/` |

Los listados permiten buscar, ordenar y cambiar de página. Cuando corresponde, también permiten
seleccionar varios registros y archivarlos o eliminarlos después de confirmar la acción.

`confirm-modal` es el diálogo compartido que pide confirmación antes de realizar acciones importantes.
`pagination` muestra las páginas disponibles y avisa al listado cuando se elige otra.

## 4. Paginación y servicios HTTP

La paginación se realiza en el servidor. Así el navegador recibe solo los registros de la página
actual y no tiene que descargar toda la colección.

Los servicios están en `src/app/services/`:

| Servicio | Uso |
|---|---|
| `user.service.ts` | Consultar y gestionar usuarios |
| `activity.service.ts` | Consultar, publicar y gestionar actividades, además de inscribir usuarios |
| `report.service.ts` | Crear y gestionar reportes |

Los listados envían parámetros como `page`, `limit`, `sortBy`, `sortOrder`, `search` y los filtros
que correspondan. `src/app/utils/page-params.ts` convierte esos valores en parámetros de URL y omite
los que estén vacíos.

La API devuelve los datos y la información necesaria para la paginación:

```ts
interface PaginatedResponse<T> {
  data: T[];
  totalDocs: number;
  totalPages: number;
  currentPage: number;
}
```

Los parámetros y la forma de respuesta están definidos en `src/app/models/paginated.model.ts`.

## 5. Signals y plantillas

Los componentes usan signals para guardar el estado que cambia, por ejemplo la página actual, los
resultados, los filtros, el estado de carga y los errores.

```ts
activities = signal<Activity[]>([]);

this.activities.set(response.data);
```

Se lee una signal llamándola como una función, por ejemplo `activities()`. `computed()` permite
calcular valores a partir de otras signals y `update()` permite cambiar un valor usando el anterior.

Las plantillas usan la sintaxis moderna de Angular para mostrar contenido condicional y recorrer
listas:

```html
@if (loading()) {
  <p>Cargando...</p>
} @else {
  @for (activity of activities(); track activity._id) {
    <p>{{ activity.title }}</p>
  } @empty {
    <p>No hay actividades para mostrar.</p>
  }
}
```

## 6. Formularios

Los formularios de usuarios, actividades y reportes usan formularios reactivos. Cada campo tiene sus
propias reglas de validación y la plantilla muestra los errores cuando corresponde.

Antes de enviar los datos, el componente comprueba que el formulario sea válido. Después llama al
servicio que corresponde y muestra el error recibido si la API rechaza la operación.

El formulario de actividades también valida que el horario final sea posterior al inicial. Al enviar
una actividad, organiza la ubicación, las fechas, el aforo y el precio con el formato que espera la
API.

El formulario de reportes permite crear uno nuevo a cualquier usuario con sesión. La revisión de un
reporte existente está reservada a ADMIN.

## 7. Sesión y permisos

`src/app/services/auth.service.ts` gestiona el inicio y cierre de sesión, la renovación de la sesión
y los datos de la cuenta activa. También indica si la cuenta puede entrar en el panel o publicar
actividades.

`src/app/interceptors/auth.interceptor.ts` añade el token de acceso a las peticiones HTTP protegidas.
Si el token caduca, intenta renovarlo y repetir la petición. `src/app/guards/auth.guard.ts` comprueba
si la persona tiene sesión y si su rol puede abrir la ruta.

Los roles principales son:

| Rol | Acceso destacado |
|---|---|
| `ADMIN` | Gestionar usuarios, actividades y reportes |
| `STORE_HOST` | Consultar y publicar actividades |
| `USER` | Consultar actividades, inscribirse y usar el chat |

El acceso a las funciones de la interfaz no sustituye los permisos del backend. La API debe aplicar
las mismas reglas.

## 8. Chat

`src/app/services/chat.service.ts` gestiona la conexión Socket.IO y las peticiones HTTP necesarias
para el chat. `src/app/components/chat/` presenta las salas, los contactos, los mensajes y los errores.

Al inscribirse en una actividad, la interfaz registra su sala de chat. Al abrir el chat, se recuperan
las actividades en las que la cuenta está inscrita para que pueda entrar en sus salas. El backend
comprueba la inscripción antes de permitir el acceso a una sala de actividad.

Cuando se abandona la pantalla del chat, se cancelan las suscripciones y se cierra la conexión para
evitar conexiones repetidas.

## 9. Pruebas y compilación

Los comandos del proyecto están definidos en `package.json`:

```powershell
npm run build
npm test
npm run lint
```

Las pruebas unitarias se encuentran junto a los servicios y componentes que verifican.
