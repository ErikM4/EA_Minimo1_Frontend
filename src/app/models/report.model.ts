// Opciones que puede tener el objetivo, el motivo y el estado de un reporte.
export type ReportTargetType = 'ACTIVITY' | 'USER';
export type ReportReason = 'SPAM' | 'INAPPROPRIATE' | 'NO_SHOW' | 'FAKE_LOCATION' | 'OTHER';
export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

// Datos del reporte que se muestran en la aplicación.
export interface Report {
  _id: string;
  reporterId?: string | { _id: string; name?: string; email?: string };
  targetType: ReportTargetType;
  targetId: string | { _id: string; title?: string; name?: string };
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  adminNotes?: string;
  deleted: boolean;
  deletedAt?: string | null;
  createdAt?: string;
}

// Información que una persona autenticada puede enviar al crear un reporte.
export interface ReportInput {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description: string;
  status?: ReportStatus;
  adminNotes?: string;
}

// Campos que se pueden cambiar al revisar un reporte.
export type ReportUpdate = Partial<Pick<Report, 'status' | 'adminNotes' | 'reason' | 'description'>>;
