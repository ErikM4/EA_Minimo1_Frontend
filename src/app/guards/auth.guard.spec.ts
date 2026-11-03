import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { activityPublisherGuard, adminGuard, authGuard, guestGuard } from './auth.guard';

describe('auth guards', () => {
  // Un guard funcional usa inject(), así que hay que llamarlo dentro de un contexto de inyección
  function run(guard: CanActivateFn, url = '/activities'): boolean | UrlTree {
    return TestBed.runInInjectionContext(
      () =>
        guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot) as boolean | UrlTree,
    );
  }

  function loginAs(role: 'user' | 'admin' | 'store_host'): void {
    localStorage.setItem('user', JSON.stringify({ _id: 'u1', name: 'X', email: 'x@y.z', role }));
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  function setup(): void {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideRouter([])] });
  }

  it('authGuard sends a visitor without a session to the login, remembering the url', () => {
    setup();
    const result = run(authGuard, '/activities');
    expect(result.toString()).toBe('/login?returnUrl=%2Factivities');
  });

  it('authGuard lets a user with a session in', () => {
    loginAs('user');
    setup();
    expect(run(authGuard)).toBe(true);
  });

  it('adminGuard sends a user back to the home page', () => {
    loginAs('user');
    setup();
    expect(run(adminGuard).toString()).toBe('/');
  });

  it('adminGuard lets an admin in', () => {
    loginAs('admin');
    setup();
    expect(run(adminGuard)).toBe(true);
  });

  it('adminGuard accepts the admin role regardless of capitalization', () => {
    localStorage.setItem(
      'user',
      JSON.stringify({ _id: 'u1', name: 'X', email: 'x@y.z', role: 'AdMiN' }),
    );
    setup();
    expect(run(adminGuard)).toBe(true);
  });

  it('activityPublisherGuard lets a store host publish activities', () => {
    loginAs('store_host');
    setup();
    expect(run(activityPublisherGuard)).toBe(true);
  });

  it('activityPublisherGuard lets an admin publish activities', () => {
    loginAs('admin');
    setup();
    expect(run(activityPublisherGuard)).toBe(true);
  });

  it('activityPublisherGuard sends a regular user back to the home page', () => {
    loginAs('user');
    setup();
    expect(run(activityPublisherGuard).toString()).toBe('/');
  });

  it('guestGuard sends a user with a session to the home page', () => {
    loginAs('user');
    setup();
    expect(run(guestGuard).toString()).toBe('/');
  });

  it('guestGuard lets a visitor without a session in', () => {
    setup();
    expect(run(guestGuard)).toBe(true);
  });
});
