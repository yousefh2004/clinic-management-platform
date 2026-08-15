import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { DepartmentList } from './features/departments/department-list/department-list';
import { Home } from './features/home/home';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'departments', component: DepartmentList },
  { path: '', component: Home },
];