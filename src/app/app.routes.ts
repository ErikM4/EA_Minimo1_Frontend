import { Routes } from '@angular/router';

import { AuthorForm } from './components/author-form/author-form';
import { AuthorsList } from './components/authors-list/authors-list';
import { BookForm } from './components/book-form/book-form';
import { BooksList } from './components/books-list/books-list';
import { Chat } from './components/chat/chat';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { adminGuard, authGuard, guestGuard } from './guards/auth.guard';

// canActivate: los guards que se comprueban, en orden, antes de entrar en la ruta.
//   guestGuard            solo sin sesión (login y registro)
//   authGuard             solo con sesión; si no, al login
//   authGuard, adminGuard con sesión y además rol admin; un user vuelve a la página de inicio
export const routes: Routes = [
  { path: '', component: Home, canActivate: [authGuard], title: 'Inicio' },
  { path: 'login', component: Login, canActivate: [guestGuard], title: 'Iniciar sesión' },
  { path: 'register', component: Register, canActivate: [guestGuard], title: 'Crear cuenta' },

  {
    path: 'authors',
    component: AuthorsList,
    canActivate: [authGuard, adminGuard],
    title: 'Autores',
  },
  {
    path: 'authors/new',
    component: AuthorForm,
    canActivate: [authGuard, adminGuard],
    title: 'Nuevo autor',
  },
  {
    path: 'authors/:id/edit',
    component: AuthorForm,
    canActivate: [authGuard, adminGuard],
    title: 'Editar autor',
  },
  { path: 'books', component: BooksList, canActivate: [authGuard, adminGuard], title: 'Libros' },
  {
    path: 'books/new',
    component: BookForm,
    canActivate: [authGuard, adminGuard],
    title: 'Nuevo libro',
  },
  { path: 'chat', component: Chat, canActivate: [authGuard], title: 'Chat' },
  {
    path: 'books/:id/edit',
    component: BookForm,
    canActivate: [authGuard, adminGuard],
    title: 'Editar libro',
  },

  // Cualquier otra URL vuelve a la página de inicio (o al login, si no hay sesión)
  { path: '**', redirectTo: '' },
];
