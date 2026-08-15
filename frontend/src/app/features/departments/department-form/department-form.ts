import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DepartmentService } from '../../../core/services/department.service';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule
  ],
  templateUrl: './department-form.html',
  styleUrl: './department-form.scss',
  encapsulation: ViewEncapsulation.None
})
export class DepartmentForm implements OnInit {
  form: FormGroup;
  isEditMode = false;
  departmentId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.departmentId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.departmentId;

    if (this.isEditMode && this.departmentId) {
      this.departmentService.getById(this.departmentId).subscribe((dept) => {
        this.form.patchValue({ name: dept.name, code: dept.code });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const request = this.form.value;

    if (this.isEditMode && this.departmentId) {
      this.departmentService.update(this.departmentId, request).subscribe(() => {
        this.router.navigate(['/departments']);
      });
    } else {
      this.departmentService.create(request).subscribe(() => {
        this.router.navigate(['/departments']);
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/departments']);
  }
}