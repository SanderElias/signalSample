import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./signal-table/signal-table.component').then((m) => m.SignalTableComponent),
  },
  {
    path: 'fps',
    loadComponent: () => import('./test-fps/test-fps.component').then((m) => m.TestFPSComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
