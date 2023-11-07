import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./signal-table/signal-table.component').then((m) => m.SignalTableComponent),
  },
  {
    path: 'disp',
    loadComponent: () => import('./test-dispose/test-dispose.component').then((m) => m.TestDisposeComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
