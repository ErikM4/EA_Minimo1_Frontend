import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Author, AuthorsPage } from '../models';
import { environment } from '../../environments/environment';
import { AuthorService } from './author.service';

describe('AuthorService', () => {
  let service: AuthorService;
  let httpMock: HttpTestingController;

  const author: Author = {
    _id: 'a1',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    nationality: 'British',
    active: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAuthors() requests and returns a paginated response', () => {
    let response: AuthorsPage | undefined;
    service.getAuthors().subscribe((res) => (response = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/authors?page=1&limit=5`);
    expect(req.request.method).toBe('GET');
    req.flush({ authors: [author], total: 1, page: 1, pages: 1 });

    expect(response).toEqual({ authors: [author], total: 1, page: 1, pages: 1 });
  });

  it('getAuthors() sends the requested page and limit', () => {
    service.getAuthors(2, 10, ' Ada ').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/authors?page=2&limit=10&search=Ada`);
    expect(req.request.method).toBe('GET');
    req.flush({ authors: [], total: 0, page: 2, pages: 0 });
  });

  it('getAuthor() returns the raw { author } response', () => {
    let response: Author | undefined;
    service.getAuthor('a1').subscribe((res) => (response = res.author));
    httpMock.expectOne(`${environment.apiUrl}/authors/a1`).flush({ author });

    expect(response).toEqual(author);
  });

  it('createAuthor() posts the payload', () => {
    service
      .createAuthor({
        name: 'A',
        email: 'a@b.c',
        nationality: 'X',
      })
      .subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/authors`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'A', email: 'a@b.c', nationality: 'X' });
    req.flush({ author });
  });

  it('updateAuthor() puts the payload to the id url', () => {
    service.updateAuthor('a1', { nationality: 'English' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/authors/a1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.nationality).toBe('English');
    req.flush({ author: { ...author, nationality: 'English' } });
  });

  it('deleteAuthor() sends a DELETE to the id url', () => {
    service.deleteAuthor('a1').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/authors/a1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('propagates the server error to the subscriber', () => {
    let failed = false;
    service.getAuthors().subscribe({ error: () => (failed = true) });
    httpMock
      .expectOne(`${environment.apiUrl}/authors?page=1&limit=5`)
      .flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(failed).toBe(true);
  });
});
