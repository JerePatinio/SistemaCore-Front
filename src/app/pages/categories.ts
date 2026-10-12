import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../api/category.service';
import { Category } from '../models/models';

@Component({
  selector: 'app-categories',
  imports: [FormsModule],
  template: `
    <h2 class="page-title">Categories</h2>
    @if (error()) {
      <div class="alert" role="alert">{{ error() }}</div>
    }

    <form class="card form-row" (ngSubmit)="save()" aria-label="Category form">
      <div class="field grow">
        <label for="name">Name</label>
        <input id="name" name="name" [(ngModel)]="name" required maxlength="60" placeholder="e.g. Errands" />
      </div>
      <div class="field">
        <label for="color">Color</label>
        <input id="color" name="color" type="color" class="color-input" [(ngModel)]="color" />
      </div>
      <div class="actions">
        <button type="submit" class="btn primary" [disabled]="!name.trim()">
          {{ editingId() === null ? 'Add category' : 'Save changes' }}
        </button>
        @if (editingId() !== null) {
          <button type="button" class="btn" (click)="cancelEdit()">Cancel</button>
        }
      </div>
    </form>

    @if (categories().length === 0) {
      <div class="card empty">No categories yet. Add your first one above.</div>
    } @else {
      <ul class="card plain-list task-list">
        @for (c of categories(); track c.id) {
          <li class="task">
            <span class="chip big"><span class="chip-dot" [style.background]="c.color"></span>{{ c.name }}</span>
            <span class="grow"></span>
            <div class="actions">
              <button type="button" class="btn small" (click)="edit(c)">Edit</button>
              <button type="button" class="btn small danger" (click)="remove(c)">Delete</button>
            </div>
          </li>
        }
      </ul>
    }
  `,
})
export class Categories implements OnInit {
  private readonly api = inject(CategoryService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly error = signal('');
  protected readonly editingId = signal<number | null>(null);

  protected name = '';
  protected color = '#3b82f6';

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.api.list().subscribe({
      next: (c) => {
        this.categories.set(c);
        this.error.set('');
      },
      error: () => this.error.set('Could not load categories. Is the backend running on port 8080?'),
    });
  }

  protected save(): void {
    const body = { name: this.name.trim(), color: this.color };
    if (!body.name) return;
    const id = this.editingId();
    const request = id === null ? this.api.create(body) : this.api.update(id, body);
    request.subscribe({
      next: () => {
        this.cancelEdit();
        this.load();
      },
      error: () => this.error.set('Could not save the category.'),
    });
  }

  protected edit(c: Category): void {
    this.editingId.set(c.id);
    this.name = c.name;
    this.color = c.color;
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.name = '';
    this.color = '#3b82f6';
  }

  protected remove(c: Category): void {
    this.api.remove(c.id).subscribe({
      next: () => {
        if (this.editingId() === c.id) this.cancelEdit();
        this.load();
      },
      error: () => this.error.set('Could not delete the category.'),
    });
  }
}
