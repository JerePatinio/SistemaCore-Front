import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { HealthService } from './api/health.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="app-header">
      <div class="container header-inner">
        <h1 class="app-title">TaskBoard</h1>
        <nav class="nav" aria-label="Main navigation">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/board" routerLinkActive="active">Board</a>
          <a routerLink="/tasks" routerLinkActive="active">Tasks</a>
          <a routerLink="/categories" routerLinkActive="active">Categories</a>
        </nav>
        <div class="health" role="status" [attr.aria-label]="'API status: ' + health.state()">
          <span class="dot" [class.up]="health.state() === 'up'" [class.down]="health.state() === 'down'"></span>
          <span>{{ health.state() === 'up' ? 'API online' : health.state() === 'down' ? 'API offline' : 'Checking...' }}</span>
        </div>
      </div>
    </header>
    <main class="container">
      <router-outlet />
    </main>
  `,
})
export class App {
  protected readonly health = inject(HealthService);
}
