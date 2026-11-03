import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { ActivityService } from './activity.service';

describe('ActivityService', () => {
  let service: ActivityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ActivityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('sends pagination, sorting and search parameters', () => {
    service
      .getActivities({ page: 3, limit: 10, sortBy: 'title', sortOrder: 'desc', search: 'review' })
      .subscribe();

    const request = httpMock.expectOne(
      `${environment.apiUrl}/activities?page=3&limit=10&sortBy=title&sortOrder=desc&search=review`,
    );
    expect(request.request.method).toBe('GET');
    request.flush({ data: [], totalDocs: 0, totalPages: 1, currentPage: 3 });
  });
});
