import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(join(dataDir, 'lumina.db'));
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS todos (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    todo_id TEXT,
    detail TEXT,
    created_at INTEGER NOT NULL
  );
`);

function logEvent(action, todoId, detail) {
  db.prepare(
    'INSERT INTO events (id, action, todo_id, detail, created_at) VALUES (?, ?, ?, ?, ?)',
  ).run(randomUUID(), action, todoId ?? null, detail ?? null, Date.now());
}

function toTodo(row) {
  return {
    id: row.id,
    text: row.text,
    done: Boolean(row.done),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toEvent(row) {
  return {
    id: row.id,
    action: row.action,
    todoId: row.todo_id,
    detail: row.detail,
    createdAt: row.created_at,
  };
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS n FROM todos').get().n;
  if (count > 0) return;
  const now = Date.now();
  const rows = [
    ['Breathe. Then begin.', 1, now - 3000],
    ['Write the thing that matters', 0, now - 2000],
    ['Leave one kind note for tomorrow', 0, now - 1000],
  ];
  const insert = db.prepare(
    'INSERT INTO todos (id, text, done, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
  );
  for (const [text, done, createdAt] of rows) {
    const id = randomUUID();
    insert.run(id, text, done, createdAt, createdAt);
    logEvent(done ? 'completed' : 'created', id, text);
  }
}

seedIfEmpty();

const app = express();
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, store: 'sqlite' });
});

app.get('/api/todos', (_req, res) => {
  const rows = db.prepare('SELECT * FROM todos ORDER BY created_at DESC').all();
  res.json(rows.map(toTodo));
});

app.post('/api/todos', (req, res) => {
  const text = String(req.body?.text ?? '').trim();
  if (!text) {
    res.status(400).json({ error: 'text required' });
    return;
  }
  const now = Date.now();
  const row = { id: randomUUID(), text, done: 0, created_at: now, updated_at: now };
  db.prepare(
    'INSERT INTO todos (id, text, done, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
  ).run(row.id, row.text, row.done, row.created_at, row.updated_at);
  logEvent('created', row.id, text);
  res.status(201).json(toTodo(row));
});

app.patch('/api/todos/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  const text = req.body.text !== undefined ? String(req.body.text).trim() : existing.text;
  const done = req.body.done !== undefined ? (req.body.done ? 1 : 0) : existing.done;
  if (!text) {
    res.status(400).json({ error: 'text required' });
    return;
  }
  const updated_at = Date.now();
  db.prepare('UPDATE todos SET text = ?, done = ?, updated_at = ? WHERE id = ?').run(
    text,
    done,
    updated_at,
    existing.id,
  );
  if (done !== existing.done) {
    logEvent(done ? 'completed' : 'reopened', existing.id, text);
  } else if (text !== existing.text) {
    logEvent('updated', existing.id, text);
  }
  res.json(toTodo({ id: existing.id, text, done, created_at: existing.created_at, updated_at }));
});

app.delete('/api/todos/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'not found' });
    return;
  }
  db.prepare('DELETE FROM todos WHERE id = ?').run(existing.id);
  logEvent('deleted', existing.id, existing.text);
  res.status(204).end();
});

app.delete('/api/todos', (req, res) => {
  if (req.query.done !== 'true') {
    res.status(400).json({ error: 'unsupported' });
    return;
  }
  const rows = db.prepare('SELECT * FROM todos WHERE done = 1').all();
  db.prepare('DELETE FROM todos WHERE done = 1').run();
  for (const row of rows) logEvent('cleared', row.id, row.text);
  res.json({ removed: rows.length });
});

app.get('/api/events', (_req, res) => {
  const rows = db.prepare('SELECT * FROM events ORDER BY created_at DESC LIMIT 12').all();
  res.json(rows.map(toEvent));
});

const port = Number(process.env.PORT || 3001);
app.listen(port, '0.0.0.0', () => {
  console.log(`SQLite API listening on http://localhost:${port}`);
});
