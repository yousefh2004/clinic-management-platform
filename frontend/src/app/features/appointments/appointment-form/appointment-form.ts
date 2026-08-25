import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { debounceTime, switchMap } from 'rxjs';
import { AppointmentService } from '../../../core/services/appointment.service';
import { DoctorService } from '../../../core/services/doctor.service';
import { PatientService } from '../../../core/services/patient.service';
import { DoctorSummary } from '../../../core/models/doctor.model';
import { PatientSummary } from '../../../core/models/patient.model';
import { AppointmentResponse } from '../../../core/models/appointment.model';
import { AuditDatePipe } from '../../../shared/audit-date-pipe';

export interface AppointmentFormData {
  id: string | null;
}

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatAutocompleteModule, MatDatepickerModule, MatDialogModule, AuditDatePipe
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './appointment-form.html',
  styleUrl: './appointment-form.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppointmentForm implements OnInit {
  form: FormGroup;
  isEditMode: boolean;
  appointment: AppointmentResponse | null = null;

  doctorSearchControl = new FormControl('');
  patientSearchControl = new FormControl('');
  doctorOptions: DoctorSummary[] = [];
  patientOptions: PatientSummary[] = [];

  selectedDoctorId: string | null = null;
  selectedPatientId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private patientService: PatientService,
    private dialogRef: MatDialogRef<AppointmentForm>,
    @Inject(MAT_DIALOG_DATA) public data: AppointmentFormData
  ) {
    this.isEditMode = !!data.id;
    this.form = this.fb.group({
      date: [null, Validators.required],
      time: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.doctorSearchControl.valueChanges.pipe(
      debounceTime(300),
      switchMap((name) => this.doctorService.searchByName(name || ''))
    ).subscribe((results) => this.doctorOptions = results);

    this.patientSearchControl.valueChanges.pipe(
      debounceTime(300),
      switchMap((name) => this.patientService.searchByName(name || ''))
    ).subscribe((results) => this.patientOptions = results);

    if (this.isEditMode && this.data.id) {
      this.appointmentService.getById(this.data.id).subscribe((appt) => {
        this.appointment = appt;
        this.selectedDoctorId = appt.doctorId;
        this.selectedPatientId = appt.patientId;
        this.doctorSearchControl.setValue('Dr. ' + appt.doctorName, { emitEvent: false });
        this.patientSearchControl.setValue(appt.patientName, { emitEvent: false });

        const dt = new Date(appt.appointmentDateTime);
        this.form.patchValue({
          date: dt,
          time: this.toTimeString(dt)
        });
      });
    }
  }

  displayDoctor(doctor: DoctorSummary | string): string {
  console.log('displayDoctor received:', doctor);
  if (typeof doctor === 'string') return doctor;
  return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : '';
}

  displayPatient(patient: PatientSummary | string): string {
  if (typeof patient === 'string') return patient;
  return patient ? `${patient.firstName} ${patient.lastName}` : '';
}

  onDoctorSelected(doctor: DoctorSummary): void {
    this.selectedDoctorId = doctor.id;
  }

  onPatientSelected(patient: PatientSummary): void {
    this.selectedPatientId = patient.id;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.selectedDoctorId || !this.selectedPatientId) return;

    const date: Date = this.form.value.date;
    const time: string = this.form.value.time;
    const [hours, minutes] = time.split(':').map(Number);

    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);

    const request = {
      doctorId: this.selectedDoctorId,
      patientId: this.selectedPatientId,
      appointmentDateTime: combined.toISOString()
    };

    if (this.isEditMode && this.data.id) {
      this.appointmentService.update(this.data.id, request).subscribe(() => {
        this.dialogRef.close(true);
      });
    } else {
      this.appointmentService.create(request).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private toTimeString(date: Date): string {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}