import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
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
  departments: DepartmentResponse[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  searchControl = new FormControl('');

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
    this.departmentService.list(this.searchControl.value || '', this.pageIndex, this.pageSize)
      .subscribe((res) => {
        this.departments = res.content;
        this.totalElements = res.totalElements;
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  goToCreate(): void {
    this.router.navigate(['/departments/new']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/departments', id, 'edit']);
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