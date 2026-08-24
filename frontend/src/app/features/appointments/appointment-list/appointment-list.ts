import { Component, OnInit, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AppointmentResponse, AppointmentStatus } from '../../../core/models/appointment.model';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatPaginatorModule, MatSortModule,
    MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatInputModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './appointment-list.html',
  styleUrl: './appointment-list.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppointmentList implements OnInit {
  displayedColumns = ['doctor', 'patient', 'datetime', 'status', 'actions'];
  appointments = signal<AppointmentResponse[]>([]);
  totalElements = signal(0);
  pageSize = 5;
  pageIndex = 0;

  fromDate: Date | null = null;
  toDate: Date | null = null;
  statusFilter: AppointmentStatus | null = null;

  sortField = 'appointmentDateTime';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private appointmentService: AppointmentService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const sort = `${this.sortField},${this.sortDirection}`;
    this.appointmentService.list(
      null,
      null,
      this.fromDate ? this.fromDate.toISOString() : null,
      this.toDate ? this.toDate.toISOString() : null,
      this.statusFilter,
      this.pageIndex,
      this.pageSize,
      sort
    ).subscribe((res) => {
      this.appointments.set(res.content);
      this.totalElements.set(res.totalElements);
    });
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.load();
  }

  onSortChange(sort: Sort): void {
    this.sortField = sort.active || 'appointmentDateTime';
    this.sortDirection = (sort.direction || 'desc') as 'asc' | 'desc';
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  confirmCancel(appointment: AppointmentResponse): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Cancel appointment',
        message: `Cancel the appointment with ${appointment.patientName}?`
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.appointmentService.cancel(appointment.id).subscribe(() => this.load());
      }
    });
  }

  markComplete(appointment: AppointmentResponse): void {
    this.appointmentService.complete(appointment.id).subscribe(() => this.load());
  }
}