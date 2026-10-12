import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, CategoryRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/categories';

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(this.url);
  }

  create(body: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(this.url, body);
  }

  update(id: number, body: CategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.url}/${id}`, body);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
