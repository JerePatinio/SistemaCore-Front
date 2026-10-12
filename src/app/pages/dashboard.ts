import { Component, OnInit, inject, signal } from '@angular/core';
import { StatsService } from '../api/stats.service';
import { PRIORITIES, STATUSES, STATUS_LABELS, Stats } from '../models/models';

@Component({
  selector: 'app-dashboard',
  template: `
    <h2 class="page-title">Dashboard</h2>
    @if (error()) {
      <div class="alert" role="alert">{{ error() }}</div>
    }
    @if (stats(); as s) {
      <section class="grid stats-grid" aria-label="Summary">
        <div class="card stat">
          <span class="stat-label">Total tasks</span>
          <span class="stat-value">{{ s.total }}</span>
        </div>
        <div class="card stat">
          <span class="stat-label">Done</span>
          <span class="stat-value ok">{{ s.done }}</span>
        </div>
        <div class="card stat">
          <span class="stat-label">Pending</span>
          <span class="stat-value warn">{{ s.pending }}</span>
        </div>
        <div class="card stat">
          <span class="stat-label">Completion</span>
          <span class="stat-value">{{ s.completionRate }}%</span>
          <div class="progress" role="progressbar" aria-label="Completion rate"
               aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="s.completionRate">
            <div class="progress-fill" [style.width.%]="s.completionRate"></div>
          </div>
        </div>
      </section>

      <section class="grid two-col">
        <div class="card">
          <h3>Tasks by category</h3>
          @if (s.byCategory.length === 0) {
            <p class="empty">No categories yet.</p>
          } @else {
            <ul class="plain-list">
              @for (c of s.byCategory; track c.categoryId) {
                <li class="row-between">
                  <span>{{ c.name }}</span>
                  <span class="count">{{ c.count }}</span>
                </li>
              }
            </ul>
          }
        </div>
        <div class="card">
          <h3>Tasks by priority</h3>
          @for (p of priorities; track p) {
            <div class="bar-row">
              <span class="badge" [class]="'badge ' + p.toLowerCase()">{{ p }}</span>
              <div class="bar"><div class="bar-fill" [class]="'bar-fill ' + p.toLowerCase()"
                   [style.width.%]="s.total ? (s.byPriority[p] / s.total) * 100 : 0"></div></div>
              <span class="count">{{ s.byPriority[p] }}</span>
            </div>
          }
        </div>
      </section>

      <section class="card">
        <h3>Tasks by status</h3>
        @for (st of statuses; track st) {
          <div class="bar-row wide-label">
            <span>{{ statusLabels[st] }}</span>
            <div class="bar"><div class="bar-fill status" [style.width.%]="s.total ? (s.byStatus[st] / s.total) * 100 : 0"></div></div>
            <span class="count">{{ s.byStatus[st] }}</span>
          </div>
        }
      </section>
    } @else if (!error()) {
      <p class="empty">Loading...</p>
    }
  `,
})
export class Dashboard implements OnInit {
  private readonly api = inject(StatsService);
  protected readonly priorities = PRIORITIES;
  protected readonly statuses = STATUSES;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly stats = signal<Stats | null>(null);
  protected readonly error = signal('');

  ngOnInit(): void {
    this.api.get().subscribe({
      next: (s) => this.stats.set(s),
      error: () => this.error.set('Could not load statistics. Is the backend running on port 8080?'),
    });
  }
}
