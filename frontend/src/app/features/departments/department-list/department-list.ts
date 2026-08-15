import { Component, OnInit, ViewEncapsulation, signal  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { DepartmentService } from '../../../core/services/department.service';
import { DepartmentResponse } from '../../../core/models/department.model';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { DepartmentForm, DepartmentFormData } from '../department-form/department-form';
import { MatSortModule, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-department-list',
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
  templateUrl: './department-list.html',
  styleUrl: './department-list.scss',
  encapsulation: ViewEncapsulation.None
})
export class DepartmentList implements OnInit {
  displayedColumns = ['name', 'code', 'actions'];
  departments = signal<DepartmentResponse[]>([]);
  totalElements = signal(0);
  pageSize = 5;
  pageIndex = 0;
  searchControl = new FormControl('');

  sortField = 'name';
sortDirection: 'asc' | 'desc' = 'asc';

onSortChange(sort: Sort): void {
  this.sortField = sort.active || 'name';
  this.sortDirection = (sort.direction || 'asc') as 'asc' | 'desc';
  this.load();
}

  constructor(
    private departmentService: DepartmentService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.load();
    this.searchControl.valueChanges.pipe(debounceTime(400)).subscribe(() => {
      this.pageIndex = 0;
      this.load();
    });
  }

  load(): void {
  const sort = `${this.sortField},${this.sortDirection}`;
  this.departmentService.list(this.searchControl.value || '', this.pageIndex, this.pageSize, sort)
    .subscribe((res) => {
      this.departments.set(res.content);
      this.totalElements.set(res.totalElements);
    });
}

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }
  openCreateDialog(): void {
  const ref = this.dialog.open(DepartmentForm, {
    width: '480px',
    panelClass: 'themed-dialog',
    data: { id: null } as DepartmentFormData
  });

  ref.afterClosed().subscribe((saved) => {
    if (saved) this.load();
  });
}

openEditDialog(id: string): void {
  const ref = this.dialog.open(DepartmentForm, {
    width: '480px',
    panelClass: 'themed-dialog',
    data: { id } as DepartmentFormData
  });

  ref.afterClosed().subscribe((saved) => {
    if (saved) this.load();
  });
}

  confirmDelete(department: DepartmentResponse): void {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Delete department',
        message: `Delete "${department.name}"? This cannot be undone.`
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.departmentService.delete(department.id).subscribe(() => this.load());
      }
    });
  }
}