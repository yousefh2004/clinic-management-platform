import { Component, OnInit, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSortModule, Sort } from '@angular/material/sort';
import { debounceTime } from 'rxjs';
import { PatientService } from '../../../core/services/patient.service';
import { PatientResponse } from '../../../core/models/patient.model';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { PatientForm, PatientFormData } from '../patient-form/patient-form';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss',
  encapsulation: ViewEncapsulation.None
})
export class PatientList implements OnInit {
  displayedColumns = ['name', 'phone', 'email', 'status', 'actions'];
  patients = signal<PatientResponse[]>([]);
  totalElements = signal(0);
  pageSize = 5;
  pageIndex = 0;
  nameControl = new FormControl('');
  phoneControl = new FormControl('');

  sortField = 'firstName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private patientService: PatientService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.load();

    this.nameControl.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.pageIndex = 0;
      this.load();
    });

    this.phoneControl.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.pageIndex = 0;
      this.load();
    });
  }

  load(): void {
    const sort = `${this.sortField},${this.sortDirection}`;
    this.patientService.list(
      this.nameControl.value || '',
      this.phoneControl.value || '',
      null,
      this.pageIndex,
      this.pageSize,
      sort
    ).subscribe((res) => {
      this.patients.set(res.content);
      this.totalElements.set(res.totalElements);
    });
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
    const ref = this.dialog.open(PatientForm, {
      width: '520px',
      panelClass: 'themed-dialog',
      data: { id: null } as PatientFormData
    });

    ref.afterClosed().subscribe((saved) => {
      if (saved) this.load();
    });
  }

  openEditDialog(id: string): void {
    const ref = this.dialog.open(PatientForm, {
      width: '520px',
      panelClass: 'themed-dialog',
      data: { id } as PatientFormData
    });

    ref.afterClosed().subscribe((saved) => {
      if (saved) this.load();
    });
  }

  confirmDeactivate(patient: PatientResponse): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Deactivate patient',
        message: `Deactivate ${patient.firstName} ${patient.lastName}? Their record stays but they won't be available for new appointments.`
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.patientService.deactivate(patient.id).subscribe(() => this.load());
      }
    });
  }
}