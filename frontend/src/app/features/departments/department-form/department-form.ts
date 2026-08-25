import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DepartmentService } from '../../../core/services/department.service';
import { DepartmentResponse } from '../../../core/models/department.model';
import { AuditDatePipe } from '../../../shared/audit-date-pipe';

export interface DepartmentFormData {
  id: string | null;
}


@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
  CommonModule, ReactiveFormsModule,
  MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule,
  AuditDatePipe
],
  templateUrl: './department-form.html',
  styleUrl: './department-form.scss',
  encapsulation: ViewEncapsulation.None
})
export class DepartmentForm implements OnInit {
  form: FormGroup;
  isEditMode: boolean;
  department: DepartmentResponse | null = null;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private dialogRef: MatDialogRef<DepartmentForm>,
    @Inject(MAT_DIALOG_DATA) public data: DepartmentFormData
  ) {
    this.isEditMode = !!data.id;
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.id) {
      this.departmentService.getById(this.data.id).subscribe((dept) => {
        this.department = dept;
        this.form.patchValue({ name: dept.name, code: dept.code });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const request = this.form.value;

    if (this.isEditMode && this.data.id) {
      this.departmentService.update(this.data.id, request).subscribe(() => {
        this.dialogRef.close(true);
      });
    } else {
      this.departmentService.create(request).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}