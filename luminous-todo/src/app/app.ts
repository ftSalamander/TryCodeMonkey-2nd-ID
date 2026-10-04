import { Component, computed, inject, signal } from '@angular/core';
import { Todo, TodoEvent, TodoService } from './todo.service';

type Filter = 'all' | 'active' | 'done';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly api = inject(TodoService);

  protected readonly draft = signal('');
  protected readonly filter = signal<Filter>('all');
  protected readonly editingId = signal<string | null>(null);
  protected readonly editDraft = signal('');
  protected readonly todos = signal<Todo[]>([]);
  protected readonly events = signal<TodoEvent[]>([]);
  protected readonly ready = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected readonly remaining = computed(() => this.todos().filter((t) => !t.done).length);
  protected readonly completed = computed(() => this.todos().filter((t) => t.done).length);
  protected readonly total = computed(() => this.todos().length);
  protected readonly progress = computed(() => {
    const total = this.total();
    return total === 0 ? 0 : Math.round((this.completed() / total) * 100);
  });
  protected readonly visible = computed(() => {
    const list = this.todos();
    switch (this.filter()) {
      case 'active':
        return list.filter((t) => !t.done);
      case 'done':
        return list.filter((t) => t.done);
      default:
        return list;
    }
  });
  protected readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });
  protected readonly ring = computed(() => {
    const r = 18;
    const c = 2 * Math.PI * r;
    const offset = c - (this.progress() / 100) * c;
    return { c, offset };
  });

  constructor() {
    void this.refresh();
  }

  protected async add(): Promise<void> {
    const text = this.draft().trim();
    if (!text || this.busy()) return;
    this.draft.set('');
    await this.run(() => this.api.create(text));
  }

  protected async toggle(id: string): Promise<void> {
    const todo = this.todos().find((t) => t.id === id);
    if (!todo) return;
    await this.run(() => this.api.update(id, { done: !todo.done }));
  }

  protected async remove(id: string): Promise<void> {
    if (this.editingId() === id) this.cancelEdit();
    await this.run(() => this.api.remove(id));
  }

  protected setFilter(next: Filter): void {
    this.filter.set(next);
  }

  protected startEdit(todo: Todo): void {
    this.editingId.set(todo.id);
    this.editDraft.set(todo.text);
  }

  protected async saveEdit(): Promise<void> {
    const id = this.editingId();
    const text = this.editDraft().trim();
    if (!id) return;
    this.cancelEdit();
    if (!text) {
      await this.remove(id);
      return;
    }
    await this.run(() => this.api.update(id, { text }));
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.editDraft.set('');
  }

  protected async clearDone(): Promise<void> {
    await this.run(() => this.api.clearDone());
  }

  protected label(action: string): string {
    switch (action) {
      case 'created':
        return 'Added';
      case 'completed':
        return 'Done';
      case 'reopened':
        return 'Reopened';
      case 'updated':
        return 'Edited';
      case 'deleted':
        return 'Removed';
      case 'cleared':
        return 'Cleared';
      default:
        return action;
    }
  }

  private async refresh(): Promise<void> {
    try {
      const [todos, events] = await Promise.all([this.api.list(), this.api.events()]);
      this.todos.set(todos);
      this.events.set(events);
      this.error.set('');
    } catch {
      this.error.set('Could not reach SQLite. Start the API on port 3001.');
    } finally {
      this.ready.set(true);
    }
  }

  private async run(task: () => Promise<unknown>): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await task();
      await this.refresh();
    } catch {
      this.error.set('SQLite write failed. Try again.');
    } finally {
      this.busy.set(false);
    }
  }
}
