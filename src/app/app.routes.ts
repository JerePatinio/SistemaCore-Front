import { Routes } from '@angular/router';
import { Board } from './pages/board';
import { Categories } from './pages/categories';
import { Dashboard } from './pages/dashboard';
import { Tasks } from './pages/tasks';

export const routes: Routes = [
  { path: '', component: Dashboard, title: 'Dashboard' },
  { path: 'board', component: Board, title: 'Board' },
  { path: 'tasks', component: Tasks, title: 'Tasks' },
  { path: 'categories', component: Categories, title: 'Categories' },
  { path: '**', redirectTo: '' },
];
