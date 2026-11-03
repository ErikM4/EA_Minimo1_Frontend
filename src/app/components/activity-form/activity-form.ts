import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  Activity,
  ActivityCategory,
  ActivityInput,
  ActivityModality,
  ActivityStatus,
  ActivitySubcategory,
} from '../../models';
import { ActivityService } from '../../services/activity.service';
import { apiErrorMessage } from '../../utils/api-error';

function toLocalDateTime(value?: string): string {
  if (!value) return '';
  // El campo de fecha local no muestra la zona horaria, por eso ajustamos el valor.
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function validateSchedule(control: AbstractControl): ValidationErrors | null {
  const startTime = control.get('startTime')?.value;
  const endTime = control.get('endTime')?.value;
  if (!startTime || !endTime) return null;
  // La fecha final debe ser posterior al inicio para que el horario tenga sentido.
  return new Date(endTime) > new Date(startTime) ? null : { invalidSchedule: true };
}

@Component({
  selector: 'app-activity-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './activity-form.html',
  styleUrl: './activity-form.css',
})
export class ActivityForm implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private activityService = inject(ActivityService);
  private router = inject(Router);

  id = input<string>();
  loading = signal(false);
  saving = signal(false);
  loadFailed = signal(false);
  error = signal('');

  readonly categories: ActivityCategory[] = ['SPORT', 'LEISURE'];
  readonly subcategories: ActivitySubcategory[] = [
    'BASKETBALL',
    'RUNNING',
    'ARCADE',
    'TCG_BOARDGAMES',
  ];
  readonly modalities: ActivityModality[] = ['CASUAL', 'ORGANIZED'];
  readonly statuses: ActivityStatus[] = ['OPEN', 'FULL', 'COMPLETED', 'CANCELLED'];

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    category: ['SPORT' as ActivityCategory, Validators.required],
    subcategory: ['BASKETBALL' as ActivitySubcategory, Validators.required],
    modality: ['CASUAL' as ActivityModality, Validators.required],
    status: ['OPEN' as ActivityStatus, Validators.required],
    addressName: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    minParticipants: this.fb.control(2, [Validators.required, Validators.min(1)]),
    maxParticipants: this.fb.control(2, [Validators.required, Validators.min(1)]),
    price: this.fb.control(0, [Validators.required, Validators.min(0)]),
    prizeInfo: [''],
  }, { validators: validateSchedule });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;

    this.loading.set(true);
    this.activityService.getActivity(id).subscribe({
      next: ({ activity }) => {
        this.fillForm(activity);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.loadFailed.set(true);
        this.loading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    // La API espera ubicación y horario agrupados.
    const payload: ActivityInput = {
      title: values.title.trim(),
      description: values.description.trim(),
      category: values.category,
      subcategory: values.subcategory,
      modality: values.modality,
      status: values.status,
      location: {
        type: 'Point',
        addressName: values.addressName.trim(),
        isStoreLocation: false,
      },
      schedule: {
        startTime: new Date(values.startTime).toISOString(),
        endTime: new Date(values.endTime).toISOString(),
      },
      capacity: {
        minParticipants: values.minParticipants,
        maxParticipants: values.maxParticipants,
      },
      pricing: {
        price: values.price,
        prizeInfo: values.prizeInfo.trim(),
      },
    };

    const id = this.id();
    this.saving.set(true);
    this.error.set('');
    const request = id
      ? this.activityService.updateActivity(id, payload)
      : this.activityService.createActivity(payload);
    request.subscribe({
      next: () => this.router.navigate(['/activities'], { replaceUrl: true }),
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.saving.set(false);
      },
    });
  }

  private fillForm(activity: Activity): void {
    // Convierte los datos de la API al formato que usan los campos del formulario.
    this.form.patchValue({
      title: activity.title,
      description: activity.description,
      category: activity.category,
      subcategory: activity.subcategory,
      modality: activity.modality,
      status: activity.status,
      addressName: activity.location.addressName,
      startTime: toLocalDateTime(activity.schedule.startTime),
      endTime: toLocalDateTime(activity.schedule.endTime),
      minParticipants: activity.capacity.minParticipants,
      maxParticipants: activity.capacity.maxParticipants,
      price: activity.pricing.price,
      prizeInfo: activity.pricing.prizeInfo ?? '',
    });
  }
}
