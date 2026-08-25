import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'auditDate',
  standalone: true
})
export class AuditDatePipe implements PipeTransform {
  private datePipe = inject(DatePipe);

  transform(value: string | null | undefined): string {
    if (!value) return '—';
    return this.datePipe.transform(value, 'MMM d, y \'at\' h:mm a') || '—';
  }
}