# Estado del frontend

Este archivo resume las funciones que están implementadas en el backoffice. La guía técnica está en
[GUIA.md](GUIA.md) y las instrucciones para ejecutar el proyecto están en [README.md](README.md).

## Funciones actuales

- Autenticación con registro, inicio y cierre de sesión, renovación del token y recuperación de la
  sesión al recargar la aplicación.
- Rutas protegidas y navegación adaptada a los roles `ADMIN`, `USER` y `STORE_HOST`.
- Listados de usuarios, actividades y reportes con paginación del servidor, ordenación, búsqueda y
  filtros.
- Formularios reactivos para crear y editar usuarios y actividades, crear reportes y revisar reportes.
- Selección múltiple, confirmación de acciones y archivado de registros desde las pantallas
  administrativas.
- Consulta de actividades disponibles e inscripción de cuentas `USER`.
- Publicación de actividades por cuentas `ADMIN` y `STORE_HOST`.
- Chat en tiempo real con contactos, usuarios conectados y salas relacionadas con actividades.

## Decisiones de implementación

- La aplicación se mantiene en Angular. Los servicios y componentes Angular cubren la paginación y
  los listados del proyecto.
- La paginación se resuelve en la API. El frontend envía los filtros y parámetros de ordenación junto
  con el número y tamaño de página.
- Los guards mejoran la navegación, pero la autorización real también se aplica en el backend.
- La contraseña y los datos de autoría de una operación sensible se validan o asignan en el servidor,
  no se consideran confiables por venir de la interfaz.
- Las salas de actividad solo deben estar disponibles para las personas inscritas en esa actividad.

## Comprobaciones

Para validar cambios en el frontend se puede ejecutar:

```powershell
npm run build
npm test
npm run lint
```

La compilación del backend y las pruebas de sus rutas se ejecutan en el repositorio correspondiente.
