import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { ReportService } from './report.service';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends pagination, sorting and search parameters', () => {
    service
      .getReports({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'asc', search: 'monthly' })
      .subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/reports?page=1&limit=10&sortBy=createdAt&sortOrder=asc&search=monthly`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({ data: [], totalDocs: 0, totalPages: 1, currentPage: 1 });
  });
});
