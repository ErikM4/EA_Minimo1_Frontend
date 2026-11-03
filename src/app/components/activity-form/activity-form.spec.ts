import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { environment } from '../../../environments/environment';
import { ActivityForm } from './activity-form';

describe('ActivityForm', () => {
  let fixture: ComponentFixture<ActivityForm>;
  let component: ActivityForm;
  let httpMock: HttpTestingController;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityForm],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(ActivityForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => httpMock.verify());

  it('creates an activity with GeoJSON coordinates in longitude-latitude order', () => {
    component.form.patchValue({
      title: 'Partido de baloncesto',
      description: 'Partido amistoso para todos los niveles.',
      addressName: 'Madrid',
      latitude: 40.4168,
      longitude: -3.7038,
      startTime: '2030-06-15T10:00',
      endTime: '2030-06-15T11:00',
    });

    component.save();

    const request = httpMock.expectOne(`${environment.apiUrl}/activities`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.location).toEqual({
      type: 'Point',
      coordinates: [-3.7038, 40.4168],
      addressName: 'Madrid',
      isStoreLocation: false,
    });
    request.flush({ activity: {} });

    expect(navigate).toHaveBeenCalledWith(['/activities'], { replaceUrl: true });
  });
});
