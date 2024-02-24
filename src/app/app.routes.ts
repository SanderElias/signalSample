import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./signal-table/signal-table.component').then((m) => m.SignalTableComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
