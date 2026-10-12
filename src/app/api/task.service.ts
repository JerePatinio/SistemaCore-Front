import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BoardColumn, MoveRequest, Task, TaskFilters, TaskRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/tasks';

  list(filters: TaskFilters = {}): Observable<Task[]> {
    let params = new HttpParams();
    if (filters.categoryId != null) params = params.set('categoryId', filters.categoryId);
    if (filters.done != null) params = params.set('done', filters.done);
    if (filters.priority) params = params.set('priority', filters.priority);
    return this.http.get<Task[]>(this.url, { params });
  }

  board(categoryId: number | null = null): Observable<BoardColumn[]> {
    let params = new HttpParams();
    if (categoryId != null) params = params.set('categoryId', categoryId);
    return this.http.get<BoardColumn[]>('/api/board', { params });
  }

  move(id: number, body: MoveRequest): Observable<Task> {
    return this.http.patch<Task>(`${this.url}/${id}/move`, body);
  }

  create(body: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.url, body);
  }

  update(id: number, body: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.url}/${id}`, body);
  }

  toggle(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.url}/${id}/toggle`, {});
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
