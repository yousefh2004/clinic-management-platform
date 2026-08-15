import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Home } from './features/home/home';
import { DepartmentList } from './features/departments/department-list/department-list';
import { DepartmentForm } from './features/departments/department-form/department-form';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'departments', component: DepartmentList },
  { path: 'departments/new', component: DepartmentForm },
  { path: 'departments/:id/edit', component: DepartmentForm },
  { path: '', component: Home },
];