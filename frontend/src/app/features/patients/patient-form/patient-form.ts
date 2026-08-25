import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PatientService } from '../../../core/services/patient.service';
import { PatientResponse } from '../../../core/models/patient.model';
import { AuditDatePipe } from '../../../shared/audit-date-pipe';

export interface PatientFormData {
  id: string | null;
}

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatDatepickerModule, MatDialogModule, AuditDatePipe
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './patient-form.html',
  styleUrl: './patient-form.scss',
  encapsulation: ViewEncapsulation.None
})
export class PatientForm implements OnInit {
  form: FormGroup;
  isEditMode: boolean;
  patient: PatientResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private dialogRef: MatDialogRef<PatientForm>,
    @Inject(MAT_DIALOG_DATA) public data: PatientFormData
  ) {
    this.isEditMode = !!data.id;
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: [null, Validators.required],
      gender: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', Validators.email],
      address: ['']
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.id) {
      this.patientService.getById(this.data.id).subscribe((p) => {
        this.patient = p;
        this.form.patchValue({
          firstName: p.firstName,
          lastName: p.lastName,
          dateOfBirth: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
          gender: p.gender,
          phoneNumber: p.phoneNumber,
          email: p.email,
          address: p.address
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const raw = this.form.value;
    const request = {
      ...raw,
      dateOfBirth: this.toIsoDate(raw.dateOfBirth)
    };

    if (this.isEditMode && this.data.id) {
      this.patientService.update(this.data.id, request).subscribe(() => {
        this.dialogRef.close(true);
      });
    } else {
      this.patientService.create(request).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}