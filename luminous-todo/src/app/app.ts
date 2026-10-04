import { Component, computed, effect, signal } from '@angular/core';

type Filter = 'all' | 'active' | 'done';

interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'lumina-todos';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly draft = signal('');
  protected readonly filter = signal<Filter>('all');
  protected readonly editingId = signal<string | null>(null);
  protected readonly editDraft = signal('');
  protected readonly todos = signal<Todo[]>(this.load());

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
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos()));
    });
  }

  protected add(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.todos.update((list) => [
      { id: crypto.randomUUID(), text, done: false, createdAt: Date.now() },
      ...list,
    ]);
    this.draft.set('');
  }

  protected toggle(id: string): void {
    this.todos.update((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  protected remove(id: string): void {
    this.todos.update((list) => list.filter((t) => t.id !== id));
    if (this.editingId() === id) this.cancelEdit();
  }

  protected setFilter(next: Filter): void {
    this.filter.set(next);
  }

  protected startEdit(todo: Todo): void {
    this.editingId.set(todo.id);
    this.editDraft.set(todo.text);
  }

  protected saveEdit(): void {
    const id = this.editingId();
    const text = this.editDraft().trim();
    if (!id) return;
    if (!text) {
      this.remove(id);
      return;
    }
    this.todos.update((list) => list.map((t) => (t.id === id ? { ...t, text } : t)));
    this.cancelEdit();
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
    this.editDraft.set('');
  }

  protected clearDone(): void {
    this.todos.update((list) => list.filter((t) => !t.done));
  }

  private load(): Todo[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return this.seed();
      const parsed = JSON.parse(raw) as Todo[];
      return Array.isArray(parsed) ? parsed : this.seed();
    } catch {
      return this.seed();
    }
  }

  private seed(): Todo[] {
    return [
      { id: crypto.randomUUID(), text: 'Breathe. Then begin.', done: true, createdAt: Date.now() - 3 },
      { id: crypto.randomUUID(), text: 'Write the thing that matters', done: false, createdAt: Date.now() - 2 },
      { id: crypto.randomUUID(), text: 'Leave one kind note for tomorrow', done: false, createdAt: Date.now() - 1 },
    ];
  }
}
