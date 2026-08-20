import { Component, Inject, OnInit, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';
import { DepartmentResponse } from '../../../core/models/department.model';

export interface DoctorFormData {
  id: string | null;
}

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule
  ],
  templateUrl: './doctor-form.html',
  styleUrl: './doctor-form.scss',
  encapsulation: ViewEncapsulation.None
})
export class DoctorForm implements OnInit {
  form: FormGroup;
  isEditMode: boolean;
  departments = signal<DepartmentResponse[]>([]);

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private dialogRef: MatDialogRef<DoctorForm>,
    @Inject(MAT_DIALOG_DATA) public data: DoctorFormData
  ) {
    this.isEditMode = !!data.id;
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      departmentId: [null, Validators.required],
      specialty: ['']
    });
  }

  ngOnInit(): void {
    this.departmentService.listAll().subscribe((res) => {
      this.departments.set(res.content);
    });

    if (this.isEditMode && this.data.id) {
      this.doctorService.getById(this.data.id).subscribe((doc) => {
        this.form.patchValue({
          firstName: doc.firstName,
          lastName: doc.lastName,
          email: doc.email,
          phoneNumber: doc.phoneNumber,
          departmentId: doc.departmentId,
          specialty: doc.specialty
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const request = this.form.value;

    if (this.isEditMode && this.data.id) {
      this.doctorService.update(this.data.id, request).subscribe(() => {
        this.dialogRef.close(true);
      });
    } else {
      this.doctorService.create(request).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}