import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { MainLayout } from './shared/main-layout/main-layout';
import { DepartmentList } from './features/departments/department-list/department-list';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: MainLayout,
    canActivate: [roleGuard],
    children: [
      { path: 'departments', component: DepartmentList },
      { path: '', redirectTo: 'departments', pathMatch: 'full' },
    ]
  },
];