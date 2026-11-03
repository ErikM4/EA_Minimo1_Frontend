import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  Report,
  ReportInput,
  ReportReason,
  ReportStatus,
  ReportTargetType,
  ReportUpdate,
} from '../../models';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../services/report.service';
import { apiErrorMessage } from '../../utils/api-error';

@Component({
  selector: 'app-report-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './report-form.html',
  styleUrl: './report-form.css',
})
export class ReportForm implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  auth = inject(AuthService);
  private reportService = inject(ReportService);
  private router = inject(Router);

  id = input<string>();
  loading = signal(false);
  saving = signal(false);
  loadFailed = signal(false);
  error = signal('');

  readonly targetTypes: ReportTargetType[] = ['ACTIVITY', 'USER'];
  readonly reasons: ReportReason[] = ['SPAM', 'INAPPROPRIATE', 'NO_SHOW', 'FAKE_LOCATION', 'OTHER'];
  readonly statuses: ReportStatus[] = ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'];

  form = this.fb.group({
    targetType: ['ACTIVITY' as ReportTargetType, Validators.required],
    targetId: ['', [Validators.required, Validators.pattern(/^[a-f\d]{24}$/i)]],
    reason: ['OTHER' as ReportReason, Validators.required],
    description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(1000)]],
    status: ['PENDING' as ReportStatus, Validators.required],
    adminNotes: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;

    // Al revisar un reporte, primero cargamos sus datos desde la API.
    this.loading.set(true);
    this.reportService.getReport(id).subscribe({
      next: ({ report }) => {
        this.fillForm(report);
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

    const value = this.form.getRawValue();
    const id = this.id();
    // Un reporte nuevo se envía con sus datos.
    // La edición solo cambia la revisión administrativa.
    const request = id
      ? this.reportService.updateReport(id, {
          status: value.status,
          adminNotes: value.adminNotes.trim(),
        } satisfies ReportUpdate)
      : this.reportService.createReport({
          targetType: value.targetType,
          targetId: value.targetId.trim(),
          reason: value.reason,
          description: value.description.trim(),
        } satisfies ReportInput);

    this.saving.set(true);
    this.error.set('');
    request.subscribe({
      next: () => this.router.navigate(this.auth.isAdmin() ? ['/reports'] : ['/'], { replaceUrl: true }),
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.saving.set(false);
      },
    });
  }

  private fillForm(report: Report): void {
    // Los datos de la denuncia quedan bloqueados durante la revisión.
    this.form.patchValue({
      targetType: report.targetType,
      targetId: typeof report.targetId === 'string' ? report.targetId : report.targetId._id,
      reason: report.reason,
      description: report.description,
      status: report.status,
      adminNotes: report.adminNotes ?? '',
    });
    this.form.controls.targetType.disable();
    this.form.controls.targetId.disable();
    this.form.controls.reason.disable();
    this.form.controls.description.disable();
  }
}
