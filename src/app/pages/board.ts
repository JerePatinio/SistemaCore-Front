import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../api/category.service';
import { TaskService } from '../api/task.service';
import { BoardColumn, Category, Status, Task } from '../models/models';

@Component({
  selector: 'app-board',
  imports: [FormsModule, DragDropModule],
  template: `
    <div class="board-head">
      <h2 class="page-title">Board</h2>
      <div class="field">
        <label for="b-category">Category</label>
        <select id="b-category" [ngModel]="fCategory()" (ngModelChange)="fCategory.set($event); load()">
          <option [ngValue]="null">All</option>
          @for (c of categories(); track c.id) {
            <option [ngValue]="c.id">{{ c.name }}</option>
          }
        </select>
      </div>
    </div>
    @if (error()) {
      <div class="alert" role="alert">{{ error() }}</div>
    }

    <div class="board-scroll">
      <div class="board" cdkDropListGroup>
        @for (col of columns(); track col.status) {
          <section class="board-col" [class.drop-over]="overStatus() === col.status" [attr.aria-label]="col.title">
            <header class="board-col-head">
              <h3>{{ col.title }}</h3>
              <span class="count-pill">{{ col.tasks.length }}</span>
            </header>

            @if (col.status === 'TODO') {
              <form class="quick-add" (ngSubmit)="add()" aria-label="Add task">
                <input name="newTitle" [(ngModel)]="newTitle" maxlength="200" placeholder="Add a task..."
                       aria-label="New task title" />
                <button type="submit" class="btn primary small" [disabled]="!newTitle.trim()">Add</button>
              </form>
            }

            <div class="drop-list" cdkDropList [cdkDropListData]="col.tasks"
                 (cdkDropListDropped)="drop($event, col.status)"
                 (cdkDropListEntered)="overStatus.set(col.status)"
                 (cdkDropListExited)="overStatus.set(null)">
              @for (t of col.tasks; track t.id) {
                <article class="card board-card" cdkDrag [cdkDragData]="t">
                  <div class="board-card-top">
                    <span class="task-title">{{ t.title }}</span>
                    <button type="button" class="btn small danger icon-btn" (click)="remove(t)"
                            [attr.aria-label]="'Delete ' + t.title">&times;</button>
                  </div>
                  <div class="meta">
                    @if (categoryOf(t); as c) {
                      <span class="chip"><span class="chip-dot" [style.background]="c.color"></span>{{ c.name }}</span>
                    }
                    <span [class]="'badge ' + t.priority.toLowerCase()">{{ t.priority }}</span>
                  </div>
                  <div class="drag-placeholder" *cdkDragPlaceholder></div>
                </article>
              } @empty {
                <p class="empty col-empty">Drop tasks here</p>
              }
            </div>
          </section>
        }
      </div>
    </div>
  `,
})
export class Board implements OnInit {
  private readonly taskApi = inject(TaskService);
  private readonly categoryApi = inject(CategoryService);

  protected readonly columns = signal<BoardColumn[]>([]);
  protected readonly categories = signal<Category[]>([]);
  protected readonly error = signal('');
  protected readonly fCategory = signal<number | null>(null);
  protected readonly overStatus = signal<Status | null>(null);

  private readonly categoryById = computed(() => new Map(this.categories().map((c) => [c.id, c])));

  protected newTitle = '';

  ngOnInit(): void {
    this.categoryApi.list().subscribe({
      next: (c) => this.categories.set(c),
      error: () => this.error.set('Could not load categories.'),
    });
    this.load();
  }

  protected categoryOf(t: Task): Category | undefined {
    return t.categoryId == null ? undefined : this.categoryById().get(t.categoryId);
  }

  protected load(): void {
    this.taskApi.board(this.fCategory()).subscribe({
      next: (cols) => {
        this.columns.set(cols);
        this.error.set('');
      },
      error: () => this.error.set('Could not load the board. Is the backend running on port 8080?'),
    });
  }

  protected drop(event: CdkDragDrop<Task[]>, status: Status): void {
    this.overStatus.set(null);
    const sameColumn = event.previousContainer === event.container;
    if (sameColumn && event.previousIndex === event.currentIndex) return;

    const snapshot = this.columns().map((c) => ({ ...c, tasks: [...c.tasks] }));
    const moved = event.previousContainer.data[event.previousIndex];

    // Optimistic update.
    if (sameColumn) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
      event.container.data[event.currentIndex] = { ...moved, status };
    }
    this.columns.update((c) => [...c]);

    // The server position is the neighbour's position (shifted by one when moving down in the same column).
    // The board may be filtered, so the visual index is not the server index.
    const next = event.container.data[event.currentIndex + 1];
    let position = 2147483647;
    if (next) {
      position = next.position;
      if (sameColumn && moved.position < next.position) position--;
    }

    this.taskApi.move(moved.id, { status, position }).subscribe({
      next: () => this.load(),
      error: () => {
        this.columns.set(snapshot);
        this.error.set('Could not move the task. The change was reverted.');
      },
    });
  }

  protected add(): void {
    const title = this.newTitle.trim();
    if (!title) return;
    this.taskApi.create({ title, categoryId: this.fCategory(), priority: 'MEDIUM' }).subscribe({
      next: () => {
        this.newTitle = '';
        this.load();
      },
      error: () => this.error.set('Could not create the task.'),
    });
  }

  protected remove(t: Task): void {
    this.taskApi.remove(t.id).subscribe({
      next: () => this.load(),
      error: () => this.error.set('Could not delete the task.'),
    });
  }
}
