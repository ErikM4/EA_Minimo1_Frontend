import { Routes } from '@angular/router';

import { ActivitiesList } from './components/activities-list/activities-list';
import { ActivityForm } from './components/activity-form/activity-form';
import { Chat } from './components/chat/chat';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { ReportsList } from './components/reports-list/reports-list';
import { ReportForm } from './components/report-form/report-form';
import { Register } from './components/register/register';
import { UserForm } from './components/user-form/user-form';
import { UsersList } from './components/users-list/users-list';
import { activityPublisherGuard, adminGuard, authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Las pantallas de administración requieren una cuenta ADMIN.
  { path: '', component: Home, canActivate: [authGuard], title: 'Inicio' },
  { path: 'login', component: Login, canActivate: [guestGuard], title: 'Iniciar sesión' },
  { path: 'register', component: Register, canActivate: [guestGuard], title: 'Crear cuenta' },
  { path: 'users', component: UsersList, canActivate: [authGuard, adminGuard], title: 'Usuarios' },
  {
    path: 'users/new',
    component: UserForm,
    canActivate: [authGuard, adminGuard],
    title: 'Nuevo usuario',
  },
  {
    path: 'users/:id/edit',
    component: UserForm,
    canActivate: [authGuard, adminGuard],
    title: 'Editar usuario',
  },
  {
    path: 'activities',
    component: ActivitiesList,
    // Cualquier persona con sesión puede consultar las actividades activas.
    canActivate: [authGuard],
    title: 'Actividades',
  },
  {
    path: 'activities/new',
    component: ActivityForm,
    // Pueden publicar actividades ADMIN y STORE_HOST.
    canActivate: [authGuard, activityPublisherGuard],
    title: 'Nueva actividad',
  },
  {
    path: 'activities/:id/edit',
    component: ActivityForm,
    canActivate: [authGuard, adminGuard],
    title: 'Editar actividad',
  },
  {
    path: 'reports',
    component: ReportsList,
    canActivate: [authGuard, adminGuard],
    title: 'Reportes',
  },
  {
    path: 'reports/new',
    component: ReportForm,
    // Cualquier persona con sesión puede enviar un reporte.
    canActivate: [authGuard],
    title: 'Nuevo reporte',
  },
  {
    path: 'reports/:id/edit',
    component: ReportForm,
    canActivate: [authGuard, adminGuard],
    title: 'Revisar reporte',
  },
  { path: 'chat', component: Chat, canActivate: [authGuard], title: 'Chat' },
  { path: '**', redirectTo: '' },
];
