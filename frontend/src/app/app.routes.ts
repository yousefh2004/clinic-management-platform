import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Home } from './features/home/home';
import { DepartmentList } from './features/departments/department-list/department-list';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'departments', component: DepartmentList },
  { path: '', component: Home },
];