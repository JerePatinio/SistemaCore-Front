import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../api/category.service';
import { TaskService } from '../api/task.service';
import { Category, PRIORITIES, Priority, STATUS_LABELS, Task } from '../models/models';

@Component({
  selector: 'app-tasks',
  imports: [FormsModule],
  template: `
    <h2 class="page-title">Tasks</h2>
    @if (error()) {
      <div class="alert" role="alert">{{ error() }}</div>
    }

    <form class="card form-row" (ngSubmit)="save()" aria-label="Task form">
      <div class="field grow">
        <label for="title">Title</label>
        <input id="title" name="title" [(ngModel)]="title" required maxlength="200" placeholder="What needs to be done?" />
      </div>
      <div class="field">
        <label for="category">Category</label>
        <select id="category" name="category" [(ngModel)]="categoryId">
          <option [ngValue]="null">No category</option>
          @for (c of categories(); track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>
      </div>
      <div class="field">
        <label for="priority">Priority</label>
        <select id="priority" name="priority" [(ngModel)]="priority">
          @for (p of priorities; track p) {
            <option [value]="p">{{ p }}</option>
          }
        </select>
      </div>
      <div class="actions">
        <button type="submit" class="btn primary" [disabled]="!title.trim()">
          {{ editingId() === null ? 'Add task' : 'Save changes' }}
        </button>
        @if (editingId() !== null) {
          <button type="button" class="btn" (click)="cancelEdit()">Cancel</button>
        }
      </div>
    </form>

    <section class="card filters" aria-label="Filters">
      <div class="field">
        <label for="f-category">Category</label>
        <select id="f-category" [ngModel]="fCategory()" (ngModelChange)="fCategory.set($event); load()">
          <option [ngValue]="null">All</option>
          @for (c of categories(); track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>
      </div>
      <div class="field">
        <label for="f-status">Status</label>
        <select id="f-status" [ngModel]="fDone()" (ngModelChange)="fDone.set($event); load()">
          <option [ngValue]="null">All</option>
          <option [ngValue]="false">Pending</option>
          <option [ngValue]="true">Done</option>
        </select>
      </div>
      <div class="field">
        <label for="f-priority">Priority</label>
        <select id="f-priority" [ngModel]="fPriority()" (ngModelChange)="fPriority.set($event); load()">
          <option [ngValue]="null">All</option>
          @for (p of priorities; track p) {
            <option [ngValue]="p">{{ p }}</option>
          }
        </select>
      </div>
    </section>

    @if (tasks().length === 0) {
      <div class="card empty">No tasks match the current filters.</div>
    } @else {
      <ul class="card plain-list task-list">
        @for (t of tasks(); track t.id) {
          <li class="task" [class.done]="t.done">
            <input type="checkbox" [checked]="t.done" (change)="toggle(t)"
                   [attr.aria-label]="'Mark ' + t.title + (t.done ? ' as pending' : ' as done')" />
            <div class="task-main">
              <span class="task-title">{{ t.title }}</span>
              <div class="meta">
                @if (categoryOf(t); as c) {
                  <span class="chip"><span class="chip-dot" [style.background]="c.color"></span>{{ c.name }}</span>
                }
                <span [class]="'badge ' + t.priority.toLowerCase()">{{ t.priority }}</span>
                <span class="chip">{{ statusLabels[t.status] }}</span>
              </div>
            </div>
            <div class="actions">
              <button type="button" class="btn small" (click)="edit(t)">Edit</button>
              <button type="button" class="btn small danger" (click)="remove(t)">Delete</button>
            </div>
          </li>
        }
      </ul>
    }
  `,
})
export class Tasks implements OnInit {
  private readonly taskApi = inject(TaskService);
  private readonly categoryApi = inject(CategoryService);

  protected readonly priorities = PRIORITIES;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly tasks = signal<Task[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly error = signal('');
  protected readonly editingId = signal<number | null>(null);

  protected readonly fCategory = signal<number | null>(null);
  protected readonly fDone = signal<boolean | null>(null);
  protected readonly fPriority = signal<Priority | null>(null);

  private readonly categoryById = computed(() => new Map(this.categories().map((c) => [c.id, c])));

  protected title = '';
  protected categoryId: number | null = null;
  protected priority: Priority = 'MEDIUM';

  ngOnInit(): void {
    this.categoryApi.list().subscribe({
      next: (c) => this.categories.set(c),
      error: () => this.fail('Could not load categories.'),
    });
    this.load();
  }

  protected categoryOf(t: Task): Category | undefined {
    return t.categoryId == null ? undefined : this.categoryById().get(t.categoryId);
  }

  protected load(): void {
    this.taskApi
      .list({ categoryId: this.fCategory(), done: this.fDone(), priority: this.fPriority() })
      .subscribe({
        next: (t) => {
          this.tasks.set(t);
          this.error.set('');
        },
        error: () => this.fail('Could not load tasks. Is the backend running on port 8080?'),
      });
  }

  protected save(): void {
    const body = { title: this.title.trim(), categoryId: this.categoryId, priority: this.priority };
    if (!body.title) return;
    const id = this.editingId();
    const request = id === null ? this.taskApi.create(body) : this.taskApi.update(id, body);
    request.subscribe({
      next: () => {
        this.cancelEdit();
        this.load();
      },
      error: () => this.fail('Could not save the task.'),
    });
  }

  protected edit(t: Task): void {
    this.editingId.set(t.id);
    this.title = t.title;
    this.categoryId = t.categoryId;
    this.priority = t.priority;
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.title = '';
    this.categoryId = null;
    this.priority = 'MEDIUM';
  }

  protected toggle(t: Task): void {
    this.taskApi.toggle(t.id).subscribe({
      next: () => this.load(),
      error: () => this.fail('Could not update the task.'),
    });
  }

  protected remove(t: Task): void {
    this.taskApi.remove(t.id).subscribe({
      next: () => {
        if (this.editingId() === t.id) this.cancelEdit();
        this.load();
      },
      error: () => this.fail('Could not delete the task.'),
    });
  }

  private fail(message: string): void {
    this.error.set(message);
  }
}
