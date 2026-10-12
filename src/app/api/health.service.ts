import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { Health } from '../models/models';

export type HealthState = 'checking' | 'up' | 'down';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  readonly state = signal<HealthState>('checking');

  constructor() {
    // Poll the backend every 15 seconds.
    timer(0, 15000)
      .pipe(
        switchMap(() =>
          this.http.get<Health>('/api/health').pipe(
            map((h): HealthState => (h.status === 'UP' ? 'up' : 'down')),
            catchError(() => of<HealthState>('down')),
          ),
        ),
      )
      .subscribe((s) => this.state.set(s));
  }
}
