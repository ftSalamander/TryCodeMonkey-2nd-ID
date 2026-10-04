import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
  updatedAt?: number;
}

export interface TodoEvent {
  id: string;
  action: string;
  todoId: string | null;
  detail: string | null;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);

  list(): Promise<Todo[]> {
    return firstValueFrom(this.http.get<Todo[]>('/api/todos'));
  }

  create(text: string): Promise<Todo> {
    return firstValueFrom(this.http.post<Todo>('/api/todos', { text }));
  }

  update(id: string, patch: Partial<Pick<Todo, 'text' | 'done'>>): Promise<Todo> {
    return firstValueFrom(this.http.patch<Todo>(`/api/todos/${id}`, patch));
  }

  remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/todos/${id}`));
  }

  clearDone(): Promise<{ removed: number }> {
    return firstValueFrom(
      this.http.delete<{ removed: number }>('/api/todos', { params: { done: 'true' } }),
    );
  }

  events(): Promise<TodoEvent[]> {
    return firstValueFrom(this.http.get<TodoEvent[]>('/api/events'));
  }
}
