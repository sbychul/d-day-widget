// Single Vercel function relaying the widget to the Notion REST API (spec §4).
// Kept self-contained: Vercel runs api/ files as unbundled ESM, so importing ../src is avoided.

import { timingSafeEqual } from 'node:crypto';

const NOTION = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';
const TITLE_MAX = 200; // same rule as src/parse.ts

export type Event = { id: string; title: string; date: string; created: string };

type NotionPage = {
  id: string;
  created_time: string;
  properties: {
    '이름'?: { title?: { plain_text: string }[] };
    '날짜'?: { date?: { start: string } | null };
  };
};

class HttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const ID_RE = /^([0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

function isDate(value: unknown): value is string {
  const m = typeof value === 'string' ? DATE_RE.exec(value) : null;
  if (!m) return false;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  return mo >= 1 && mo <= 12 && d >= 1 && d <= new Date(Date.UTC(y, mo, 0)).getUTCDate();
}

function config() {
  const token = process.env.NOTION_TOKEN?.trim();
  const db = process.env.NOTION_DB_ID?.trim();
  if (!token || !db) throw new HttpError(500, 'server not configured');
  return { token, db };
}

async function notion<T>(path: string, method: string, body?: unknown): Promise<T> {
  const res = await fetch(NOTION + path, {
    method,
    headers: {
      Authorization: `Bearer ${config().token}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new HttpError(502, (data as { message?: string }).message ?? `notion ${res.status}`);
  return data as T;
}

function toEvent(page: NotionPage): Event | null {
  const date = page.properties['날짜']?.date?.start?.slice(0, 10);
  if (!date) return null;
  const title = (page.properties['이름']?.title ?? []).map((t) => t.plain_text).join('');
  return { id: page.id, title, date, created: page.created_time };
}

const properties = (title: string, date: string) => ({
  '이름': { title: [{ text: { content: title } }] },
  '날짜': { date: { start: date } },
});

async function queryAll(): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | undefined;
  do {
    const data = await notion<{ results: NotionPage[]; has_more: boolean; next_cursor: string | null }>(
      `/databases/${config().db}/query`,
      'POST',
      {
        sorts: [
          { property: '날짜', direction: 'ascending' },
          { timestamp: 'created_time', direction: 'ascending' },
        ],
        page_size: 100,
        ...(cursor && { start_cursor: cursor }),
      },
    );
    pages.push(...data.results);
    cursor = data.has_more && data.next_cursor ? data.next_cursor : undefined;
  } while (cursor);
  return pages;
}

const archive = (id: string) => notion(`/pages/${id}`, 'PATCH', { archived: true });

async function readBody(request: Request): Promise<{ title: string; date: string }> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new HttpError(400, 'invalid JSON');
  }
  const { title, date } = (body ?? {}) as Record<string, unknown>;
  const trimmed = typeof title === 'string' ? title.trim() : '';
  const length = [...trimmed].length;
  if (length < 1 || length > TITLE_MAX) throw new HttpError(400, 'invalid title');
  if (!isDate(date)) throw new HttpError(400, 'invalid date');
  return { title: trimmed, date };
}

function readId(request: Request): string {
  const id = new URL(request.url).searchParams.get('id');
  if (!id || !ID_RE.test(id)) throw new HttpError(400, 'invalid id');
  return id;
}

/** Every request must carry the widget key (env WIDGET_KEY) in the X-Widget-Key header. */
function authorize(request: Request) {
  const expected = process.env.WIDGET_KEY?.trim();
  if (!expected) throw new HttpError(500, 'server not configured');
  const given = Buffer.from(request.headers.get('x-widget-key') ?? '');
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) throw new HttpError(401, 'unauthorized');
}

async function handle(request: Request, run: () => Promise<Response>): Promise<Response> {
  try {
    authorize(request);
    return await run();
  } catch (e) {
    if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
    return Response.json({ error: 'internal error' }, { status: 500 });
  }
}

export function GET(request: Request): Promise<Response> {
  return handle(request, async () => {
    const today = new URL(request.url).searchParams.get('today');
    if (!isDate(today)) throw new HttpError(400, 'invalid today');
    const events: Event[] = [];
    for (const page of await queryAll()) {
      const event = toEvent(page);
      if (!event) continue;
      // Sequential on purpose: Notion allows ~3 requests/s.
      if (event.date < today) await archive(event.id);
      else events.push(event);
    }
    return Response.json(events);
  });
}

export function POST(request: Request): Promise<Response> {
  return handle(request, async () => {
    const { title, date } = await readBody(request);
    const page = await notion<NotionPage>('/pages', 'POST', {
      parent: { database_id: config().db },
      properties: properties(title, date),
    });
    return Response.json(toEvent(page), { status: 201 });
  });
}

export function PATCH(request: Request): Promise<Response> {
  return handle(request, async () => {
    const id = readId(request);
    const { title, date } = await readBody(request);
    const page = await notion<NotionPage>(`/pages/${id}`, 'PATCH', { properties: properties(title, date) });
    return Response.json(toEvent(page));
  });
}

export function DELETE(request: Request): Promise<Response> {
  return handle(request, async () => {
    await archive(readId(request));
    return new Response(null, { status: 204 });
  });
}
