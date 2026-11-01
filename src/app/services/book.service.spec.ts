import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Book, BooksPage } from '../models';
import { environment } from '../../environments/environment';
import { BookService } from './book.service';

describe('BookService', () => {
  let service: BookService;
  let httpMock: HttpTestingController;

  const book: Book = {
    _id: 'b1',
    title: 'Clean Code',
    isbn: '9780132350884',
    authors: [
      { _id: 'a1', name: 'Robert C. Martin', email: 'uncle@example.com', nationality: 'American' },
    ],
    price: 29.99,
    tags: ['ensayo'],
    language: 'en',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getBooks() requests and returns a paginated response', () => {
    let response: BooksPage | undefined;
    service.getBooks().subscribe((res) => (response = res));

    const req = httpMock.expectOne(`${environment.apiUrl}/books?page=1&limit=5`);
    expect(req.request.method).toBe('GET');
    req.flush({ books: [book], total: 1, page: 1, pages: 1 });

    expect(response).toEqual({ books: [book], total: 1, page: 1, pages: 1 });
  });

  it('getBooks() sends the requested page and limit', () => {
    service.getBooks(3, 20, 'Foundation').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/books?page=3&limit=20&search=Foundation`);
    expect(req.request.method).toBe('GET');
    req.flush({ books: [], total: 0, page: 3, pages: 0 });
  });

  it('getBook() returns the raw { book } response', () => {
    let response: Book | undefined;
    service.getBook('b1').subscribe((res) => (response = res.book));
    httpMock.expectOne(`${environment.apiUrl}/books/b1`).flush({ book });

    expect(response).toEqual(book);
  });

  it('createBook() posts the payload', () => {
    service.createBook({ title: 'Clean Code', isbn: '9780132350884', authors: ['a1'] }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/books`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.authors).toEqual(['a1']);
    req.flush({ book });
  });

  it('updateBook() puts the payload to the id url', () => {
    service.updateBook('b1', { price: 19.99 }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/books/b1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.price).toBe(19.99);
    req.flush({ book: { ...book, price: 19.99 } });
  });

  it('deleteBook() sends a DELETE to the id url', () => {
    service.deleteBook('b1').subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/books/b1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('propagates the server error to the subscriber', () => {
    let failed = false;
    service.getBooks().subscribe({ error: () => (failed = true) });
    httpMock
      .expectOne(`${environment.apiUrl}/books?page=1&limit=5`)
      .flush({ message: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(failed).toBe(true);
  });
});
