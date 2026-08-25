export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface AppointmentSummary {
  id: string;
  doctorName: string;
  patientName: string;
  appointmentDateTime: string;
  status: AppointmentStatus;
}

export interface AppointmentResponse extends AppointmentSummary {
  doctorId: string;
  patientId: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AppointmentRequest {
  doctorId: string;
  patientId: string;
  appointmentDateTime: string;
}