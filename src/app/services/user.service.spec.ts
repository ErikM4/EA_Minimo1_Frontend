import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends pagination, sorting and search parameters to the users endpoint', () => {
    service
      .getUsers({ page: 2, limit: 10, sortBy: 'email', sortOrder: 'asc', search: ' Ada ' })
      .subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/users?page=2&limit=10&sortBy=email&sortOrder=asc&search=Ada`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({ data: [], totalDocs: 0, totalPages: 1, currentPage: 2 });
  });

  it('supports user detail and CRUD requests', () => {
    service.getUser('u1').subscribe();
    httpMock.expectOne(`${environment.apiUrl}/users/u1`).flush({ user: { _id: 'u1' } });

    service.createUser({ name: 'Ada', email: 'ada@example.com', role: 'USER', password: 'pass1234' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/users`).flush({ user: { _id: 'u1' } });

    service.updateUser('u1', { name: 'Ada Lovelace' }).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/users/u1`).flush({ user: { _id: 'u1' } });

    service.deleteUser('u1').subscribe();
    const deleteRequest = httpMock.expectOne(`${environment.apiUrl}/users/u1/soft-delete`);
    expect(deleteRequest.request.method).toBe('PATCH');
    deleteRequest.flush(null);
  });
});
