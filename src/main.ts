import './style.css';
import type { Event } from '../api/events';
import { dLabel, ddays, formatToday, localToday, parseInput } from './parse';

const MSG = {
  empty: '일정이 없어요',
  editing: '수정 중 · Esc로 취소',
  loadFailed: '불러오지 못했어요',
  saveFailed: '저장하지 못했어요',
  deleteFailed: '삭제하지 못했어요',
  confirm: '삭제?',
} as const;
const CONFIRM_MS = 3000;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const todayEl = $('today');
const mainEl = $('main');
const listEl = $('list');
const form = $<HTMLFormElement>('form');
const input = $<HTMLInputElement>('input');
const statusEl = $('status');

let events: Event[] = [];
let editingId: string | null = null;
let confirmId: string | null = null;
let confirmTimer: ReturnType<typeof setTimeout> | undefined;
let focusDeleteOf: string | null = null;
let error = '';
let pending = 0;

const isTemp = (id: string) => id.startsWith('temp-');

function sortEvents() {
  events.sort((a, b) => a.date.localeCompare(b.date) || a.created.localeCompare(b.created));
}

async function api<T>(method: string, query = '', body?: unknown): Promise<T> {
  const res = await fetch(`/api/events${query}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (res.status === 204 ? null : await res.json()) as T;
}

/** Runs an optimistic request; reloads are skipped while any is in flight (spec §5). */
async function track(run: () => Promise<void>) {
  pending++;
  try {
    await run();
  } finally {
    pending--;
    sortEvents();
    render();
  }
}

// ---------- rendering ----------

function el(tag: string, className: string, text?: string) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text; // user text only via textContent
  return node;
}

function deleteButton(ev: Event) {
  const confirming = confirmId === ev.id;
  const btn = el('button', confirming ? 'del confirm' : 'del', confirming ? MSG.confirm : '×') as HTMLButtonElement;
  btn.type = 'button';
  btn.dataset.del = ev.id;
  btn.setAttribute('aria-label', confirming ? `${ev.title} 삭제 확인` : `${ev.title} 삭제`);
  return btn;
}

function stateClass(node: HTMLElement, ev: Event) {
  node.classList.toggle('editing', editingId === ev.id);
  node.classList.toggle('confirming', confirmId === ev.id);
}

function render() {
  const today = localToday();
  todayEl.textContent = formatToday();

  const [first, ...rest] = events;
  mainEl.replaceChildren();
  mainEl.className = 'main';
  if (first) {
    mainEl.dataset.id = first.id;
    mainEl.tabIndex = 0;
    mainEl.setAttribute('role', 'button');
    mainEl.setAttribute('aria-label', `${dLabel(ddays(today, first.date))} ${first.title}, 수정`);
    mainEl.append(
      el('div', 'main-d', dLabel(ddays(today, first.date))),
      el('div', 'main-title ellipsis', first.title),
      deleteButton(first),
    );
    stateClass(mainEl, first);
  } else {
    delete mainEl.dataset.id;
    mainEl.removeAttribute('tabindex');
    mainEl.removeAttribute('role');
    mainEl.removeAttribute('aria-label');
    mainEl.classList.add('empty');
    mainEl.append(el('div', 'main-title', MSG.empty));
  }

  listEl.replaceChildren(
    ...rest.map((ev) => {
      const row = el('li', 'row');
      row.dataset.id = ev.id;
      row.tabIndex = 0;
      row.append(el('span', 'row-d', dLabel(ddays(today, ev.date))), el('span', 'row-title ellipsis', ev.title), deleteButton(ev));
      stateClass(row, ev);
      return row;
    }),
  );

  statusEl.textContent = error || (editingId ? MSG.editing : '');
  statusEl.classList.toggle('error', !!error);

  if (focusDeleteOf) {
    document.querySelector<HTMLButtonElement>(`[data-del="${CSS.escape(focusDeleteOf)}"]`)?.focus();
    focusDeleteOf = null;
  }
}

// ---------- actions ----------

async function load() {
  if (pending) return;
  try {
    events = await api<Event[]>('GET', `?today=${localToday()}`);
    if (error === MSG.loadFailed) error = '';
    if (editingId && !events.some((e) => e.id === editingId)) stopEditing();
  } catch {
    error = MSG.loadFailed;
  }
  sortEvents();
  render();
}

function stopEditing() {
  editingId = null;
  input.value = '';
}

function add(date: string, title: string, raw: string) {
  const temp: Event = { id: `temp-${Date.now()}`, title, date, created: new Date().toISOString() };
  events.push(temp);
  return track(async () => {
    try {
      const saved = await api<Event>('POST', '', { title, date });
      events = events.map((e) => (e.id === temp.id ? saved : e));
    } catch {
      events = events.filter((e) => e.id !== temp.id);
      if (!input.value) input.value = raw;
      error = MSG.saveFailed;
    }
  });
}

function saveEdit(id: string, date: string, title: string) {
  const prev = events.find((e) => e.id === id);
  if (!prev) return;
  events = events.map((e) => (e.id === id ? { ...e, title, date } : e));
  return track(async () => {
    try {
      const saved = await api<Event>('PATCH', `?id=${encodeURIComponent(id)}`, { title, date });
      events = events.map((e) => (e.id === id ? saved : e));
    } catch {
      events = events.map((e) => (e.id === id ? prev : e));
      error = MSG.saveFailed;
    }
  });
}

function startEditing(id: string) {
  const ev = events.find((e) => e.id === id);
  if (!ev || isTemp(id)) return;
  editingId = id;
  error = '';
  input.value = `${ev.date} ${ev.title}`;
  render();
  input.focus();
  input.setSelectionRange(input.value.length, input.value.length);
}

function onDelete(id: string) {
  if (isTemp(id)) return;
  clearTimeout(confirmTimer);
  if (confirmId !== id) {
    confirmId = id;
    focusDeleteOf = id;
    confirmTimer = setTimeout(() => {
      confirmId = null;
      render();
    }, CONFIRM_MS);
    render();
    return;
  }
  confirmId = null;
  const removed = events.find((e) => e.id === id);
  if (!removed) return;
  events = events.filter((e) => e.id !== id);
  if (editingId === id) stopEditing();
  render();
  void track(async () => {
    try {
      await api<null>('DELETE', `?id=${encodeURIComponent(id)}`);
    } catch {
      events.push(removed);
      error = MSG.deleteFailed;
    }
  });
}

// ---------- events ----------

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = input.value;
  const result = parseInput(raw, localToday());
  if (!result.ok) {
    error = result.error;
    render();
    return;
  }
  error = '';
  const id = editingId;
  stopEditing();
  if (id) void saveEdit(id, result.date, result.title);
  else void add(result.date, result.title, raw);
  sortEvents();
  render();
});

input.addEventListener('input', () => {
  if (!error) return;
  error = '';
  render();
});

input.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || !editingId) return;
  stopEditing();
  error = '';
  render();
});

function onItemClick(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const del = target.closest<HTMLElement>('[data-del]');
  if (del) return onDelete(del.dataset.del!);
  const item = target.closest<HTMLElement>('[data-id]');
  if (item) startEditing(item.dataset.id!);
}

function onItemKey(e: KeyboardEvent) {
  const target = e.target as HTMLElement;
  if (e.key === 'Enter' && target.dataset.id) {
    e.preventDefault();
    startEditing(target.dataset.id);
  }
}

for (const node of [mainEl, listEl]) {
  node.addEventListener('click', onItemClick);
  node.addEventListener('keydown', onItemKey);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') void load();
});

function scheduleMidnight() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  setTimeout(() => {
    void load();
    scheduleMidnight();
  }, next.getTime() - now.getTime());
}

render();
void load();
scheduleMidnight();
