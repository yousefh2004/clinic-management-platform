import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { SchedulerModule, CalendarSchedulerEvent } from 'angular-calendar-scheduler';
import { CalendarView, DateAdapter } from 'angular-calendar';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AppointmentSummary, AppointmentStatus } from '../../../core/models/appointment.model';
import { AppointmentForm, AppointmentFormData } from '../appointment-form/appointment-form';
import { Subject } from 'rxjs';

const STATUS_COLOR: Record<AppointmentStatus, { primary: string; secondary: string }> = {
  SCHEDULED: { primary: '#5D62D5', secondary: '#e4e5fb' },
  COMPLETED: { primary: '#16a34a', secondary: '#dcfce7' },
  CANCELLED: { primary: '#94a3b8', secondary: '#f1f5f9' }
};

@Component({
  selector: 'app-appointment-calendar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, SchedulerModule],
  templateUrl: './appointment-calendar.html',
  styleUrl: './appointment-calendar.scss',
  encapsulation: ViewEncapsulation.None
})
export class AppointmentCalendar implements OnInit {
  viewDate = new Date();
  viewDays = 7; // 1 = day view, 7 = week view
  events: CalendarSchedulerEvent[] = [];
  loading = false;
  refresh = new Subject<void>();

  private appointmentsById = new Map<string, AppointmentSummary>();

  constructor(
    private appointmentService: AppointmentService,
    private dateAdapter: DateAdapter,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPeriod();
  }

  get periodLabel(): string {
    return this.viewDate.toLocaleDateString('en-US', {
      month: 'long',
      day: this.viewDays === 1 ? 'numeric' : undefined,
      year: 'numeric'
    });
  }

  setDayView(): void {
    this.viewDays = 1;
    this.loadPeriod();
  }

  setWeekView(): void {
    this.viewDays = 7;
    this.loadPeriod();
  }

  prev(): void {
    const days = this.viewDays;
    const d = new Date(this.viewDate);
    d.setDate(d.getDate() - days);
    this.viewDate = d;
    this.loadPeriod();
  }

  next(): void {
    const days = this.viewDays;
    const d = new Date(this.viewDate);
    d.setDate(d.getDate() + days);
    this.viewDate = d;
    this.loadPeriod();
  }

  today(): void {
    this.viewDate = new Date();
    this.loadPeriod();
  }

  eventClicked(event: CalendarSchedulerEvent): void {
    const appointment = this.appointmentsById.get(event.id);
    if (!appointment) return;

    const ref = this.dialog.open(AppointmentForm, {
      width: '560px',
      panelClass: 'themed-dialog',
      data: { id: appointment.id } as AppointmentFormData
    });

    ref.afterClosed().subscribe((saved) => {
      if (saved) this.loadPeriod();
    });
  }

  private loadPeriod(): void {
    const from = new Date(this.viewDate);
    from.setDate(from.getDate() - 1);
    from.setHours(0, 0, 0, 0);

    const to = new Date(this.viewDate);
    to.setDate(to.getDate() + this.viewDays + 1);
    to.setHours(0, 0, 0, 0);

    this.loading = true;
    this.appointmentService
      .list(null, null, from.toISOString(), to.toISOString(), null, 0, 500, 'appointmentDateTime,asc')
      .subscribe({
        next: (res) => {
          this.appointmentsById.clear();
          this.events = res.content.map((appt) => {
            this.appointmentsById.set(appt.id, appt);
            const start = new Date(appt.appointmentDateTime);
            const end = new Date(start);
            end.setMinutes(end.getMinutes() + 30); 
            return {
              id: appt.id,
              start,
              end,
              title: `${appt.patientName} — Dr. ${appt.doctorName}`,
              color: STATUS_COLOR[appt.status],
              isDisabled: appt.status === 'CANCELLED',
              cssClass: appt.status.toLowerCase()
            } as CalendarSchedulerEvent;
          });
          this.loading = false;
          this.refresh.next(); 
        },
        error: () => (this.loading = false)
      });
  }
}