import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { BooksList } from './books-list';

describe('BooksList', () => {
  let component: BooksList;
  let fixture: ComponentFixture<BooksList>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BooksList],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(BooksList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock
      .expectOne(`${environment.apiUrl}/books?page=1&limit=4`)
      .flush({ books: [], total: 5, page: 1, pages: 2 });
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requests the selected server page and displays its pagination metadata', () => {
    component.loadPage(2);

    httpMock
      .expectOne(`${environment.apiUrl}/books?page=2&limit=4`)
      .flush({ books: [], total: 5, page: 2, pages: 2 });

    expect(component.page()).toBe(2);
    expect(component.total()).toBe(5);
    expect(component.totalPages()).toBe(2);
  });

  it('requests the first page again when searching', () => {
    component.search.set('Foundation');
    component.loadPage(1);

    httpMock
      .expectOne(`${environment.apiUrl}/books?page=1&limit=4&search=Foundation`)
      .flush({ books: [], total: 0, page: 1, pages: 0 });

    expect(component.page()).toBe(1);
    expect(component.total()).toBe(0);
    expect(component.totalPages()).toBe(1);
  });
});
