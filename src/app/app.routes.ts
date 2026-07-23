import { Routes } from '@angular/router';
import { Login } from './features/auth/pages/login/login';
import { Register } from './features/auth/pages/register/register';
import { Dashboard } from './features/dashboard/pages/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { Departments } from './features/departments/pages/departments/departments';
import { roleGuard } from './core/guards/role-guard';
import { MainLayout } from './layout/main-layout/main-layout';
import { Doctors } from './features/doctor/pages/doctors/doctors';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      {
        path: 'departments',
        component: Departments,
        canActivate: [roleGuard],
        data: { roles: ['doctor', 'nurse', 'administrator'] },
      },
      { path: 'doctors', component: Doctors },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
