import { Component, OnInit, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSortModule, Sort } from '@angular/material/sort';
import { debounceTime } from 'rxjs';
import { DoctorService } from '../../../core/services/doctor.service';
import { DepartmentService } from '../../../core/services/department.service';
import { DoctorSummary } from '../../../core/models/doctor.model';
import { DepartmentResponse } from '../../../core/models/department.model';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { DoctorForm, DoctorFormData } from '../doctor-form/doctor-form';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './doctor-list.html',
  styleUrl: './doctor-list.scss',
  encapsulation: ViewEncapsulation.None
})
export class DoctorList implements OnInit {
  displayedColumns = ['name', 'department', 'specialty', 'status', 'actions'];
  doctors = signal<DoctorSummary[]>([]);
  departments = signal<DepartmentResponse[]>([]);
  totalElements = signal(0);
  pageSize = 5;
  pageIndex = 0;
  searchControl = new FormControl('');
  selectedDepartmentId: string | null = null;

  sortField = 'firstName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private doctorService: DoctorService,
    private departmentService: DepartmentService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.departmentService.listAll().subscribe((res) => {
      this.departments.set(res.content);
    });

    this.load();
    this.searchControl.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.pageIndex = 0;
      this.load();
    });
  }

  load(): void {
    const sort = `${this.sortField},${this.sortDirection}`;
    this.doctorService.list(
      this.searchControl.value || '',
      this.selectedDepartmentId,
      null,
      this.pageIndex,
      this.pageSize,
      sort
    ).subscribe((res) => {
      this.doctors.set(res.content);
      this.totalElements.set(res.totalElements);
    });
  }

  onDepartmentFilterChange(): void {
    this.pageIndex = 0;
    this.load();
  }

  onSortChange(sort: Sort): void {
    this.sortField = sort.active || 'firstName';
    this.sortDirection = (sort.direction || 'asc') as 'asc' | 'desc';
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(DoctorForm, {
      width: '480px',
      panelClass: 'themed-dialog',
      data: { id: null } as DoctorFormData
    });

    ref.afterClosed().subscribe((saved) => {
      if (saved) this.load();
    });
  }

  openEditDialog(id: string): void {
    const ref = this.dialog.open(DoctorForm, {
      width: '480px',
      panelClass: 'themed-dialog',
      data: { id } as DoctorFormData
    });

    ref.afterClosed().subscribe((saved) => {
      if (saved) this.load();
    });
  }

  confirmDeactivate(doctor: DoctorSummary): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Deactivate doctor',
        message: `Deactivate Dr. ${doctor.firstName} ${doctor.lastName}? They will no longer be available for new appointments.`
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.doctorService.deactivate(doctor.id).subscribe(() => this.load());
      }
    });
  }
}