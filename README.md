# Backoffice Angular

Panel administrativo Angular para gestionar usuarios, actividades y reportes. La aplicación incluye
autenticación, vistas de administración protegidas por rol, formularios reactivos y chat en tiempo
real.

## Requisitos

- Node.js compatible con Angular 21 (22.12 o posterior) y npm.
- API backend disponible en `http://localhost:1337`.

## Ejecutar en local

Instala dependencias e inicia el servidor Angular:

```powershell
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`. Para cambiar la dirección del backend,
actualiza `apiUrl` y `socketUrl` en `src/environments/environment.development.ts`.

## Navegación

| Ruta | Pantalla | Acceso |
|---|---|---|
| `/login` | Inicio de sesión | Sin sesión |
| `/register` | Registro | Sin sesión |
| `/` | Inicio y accesos según rol | Con sesión |
| `/chat` | Chat en tiempo real | Con sesión |
| `/users` | Listado paginado de usuarios | Administrador |
| `/users/new` | Crear usuario | Administrador |
| `/users/:id/edit` | Editar usuario | Administrador |
| `/activities` | Listado paginado de actividades | Administrador |
| `/activities/new` | Crear actividad | Administrador |
| `/activities/:id/edit` | Editar actividad | Administrador |
| `/reports` | Listado paginado de reportes | Administrador |
| `/reports/new` | Crear reporte | Administrador |
| `/reports/:id/edit` | Revisar reporte | Administrador |

Las pantallas de administración se muestran en el menú únicamente para el rol `ADMIN`. Las rutas
también están protegidas por `authGuard` y `adminGuard`; la API backend debe hacer cumplir la
autorización de forma independiente.

## Listados y formularios

Los listados consultan la API con paginación de servidor, ordenación, búsqueda y filtros disponibles.
Permiten selección múltiple y requieren confirmar las acciones de archivado o eliminación. Los
formularios crean y editan registros con validación reactiva.

Los servicios HTTP correspondientes son `UserService`, `ActivityService` y `ReportService`; comparten
la serialización de parámetros mediante `src/app/utils/page-params.ts`.

## Scripts

| Comando | Descripción |
|---|---|
| `npm start` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm test` | Pruebas unitarias con Vitest |
| `npm run lint` | Análisis de TypeScript y plantillas Angular |

## Estructura principal

```text
src/app/
  components/
    navbar/             Navegación adaptada al rol
    home/               Inicio y accesos directos
    users-list/         Gestión paginada de usuarios
    activities-list/    Gestión paginada de actividades
    reports-list/       Gestión paginada de reportes
    user-form/          Crear y editar usuarios
    activity-form/      Crear y editar actividades
    report-form/        Crear y revisar reportes
    confirm-modal/      Confirmación de acciones destructivas
    chat/               Chat en tiempo real
  guards/               Protección de rutas
  interceptors/         Autenticación de peticiones HTTP
  models/               Contratos de la API
  services/             Acceso HTTP y chat
  utils/                Utilidades para errores y parámetros paginados
  app.routes.ts         Mapa de navegación
```
