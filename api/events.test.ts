import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET, PATCH, POST } from './events';

const page = (id: string, title: string, date: string | null, created = '2026-10-01T00:00:00.000Z') => ({
  id,
  created_time: created,
  properties: {
    '이름': { title: title ? [{ plain_text: title }] : [] },
    '날짜': { date: date ? { start: date } : null },
  },
});

let calls: { url: string; method: string; body: any }[];
let replies: { status?: number; body: unknown }[];

beforeEach(() => {
  process.env.NOTION_TOKEN = 'test-token';
  process.env.NOTION_DB_ID = 'db1';
  calls = [];
  replies = [];
  vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, method: init.method!, body: init.body ? JSON.parse(String(init.body)) : undefined });
    const r = replies.shift() ?? { body: {} };
    return new Response(JSON.stringify(r.body), { status: r.status ?? 200 });
  });
});
afterEach(() => vi.unstubAllGlobals());

const req = (path: string, method = 'GET', body?: unknown) =>
  new Request(`http://localhost${path}`, { method, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body) });

describe('GET', () => {
  it('archives past events, skips dateless pages, follows pagination', async () => {
    replies = [
      { body: { results: [page('p1', '지난 일', '2026-10-06'), page('p2', '날짜 없음', null)], has_more: true, next_cursor: 'c2' } },
      { body: { results: [page('p3', '오늘', '2026-10-07'), page('p4', '크리스마스', '2026-12-25T09:00:00.000+09:00')], has_more: false, next_cursor: null } },
      { body: {} }, // archive p1
    ];
    const res = await GET(req('/api/events?today=2026-10-07'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      { id: 'p3', title: '오늘', date: '2026-10-07', created: '2026-10-01T00:00:00.000Z' },
      { id: 'p4', title: '크리스마스', date: '2026-12-25', created: '2026-10-01T00:00:00.000Z' },
    ]);
    expect(calls.map((c) => `${c.method} ${c.url.replace('https://api.notion.com/v1', '')}`)).toEqual([
      'POST /databases/db1/query',
      'POST /databases/db1/query',
      'PATCH /pages/p1',
    ]);
    expect(calls[1].body.start_cursor).toBe('c2');
    expect(calls[2].body).toEqual({ archived: true });
    expect(calls[0].body.sorts).toEqual([
      { property: '날짜', direction: 'ascending' },
      { timestamp: 'created_time', direction: 'ascending' },
    ]);
  });

  it.each(['', '?today=2026-13-01', '?today=2026-02-30', '?today=20261007'])('rejects today %s', async (q) => {
    expect((await GET(req(`/api/events${q}`))).status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it('returns 500 when not configured', async () => {
    delete process.env.NOTION_DB_ID;
    const res = await GET(req('/api/events?today=2026-10-07'));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: 'server not configured' });
  });

  it('maps Notion errors to 502 with the message', async () => {
    replies = [{ status: 401, body: { message: 'API token is invalid.' } }];
    const res = await GET(req('/api/events?today=2026-10-07'));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'API token is invalid.' });
  });
});

describe('POST', () => {
  it('creates a page with trimmed title', async () => {
    replies = [{ body: page('new', '크리스마스', '2026-12-25') }];
    const res = await POST(req('/api/events', 'POST', { title: '  크리스마스 ', date: '2026-12-25' }));
    expect(res.status).toBe(201);
    expect(await res.json()).toMatchObject({ id: 'new', title: '크리스마스', date: '2026-12-25' });
    expect(calls[0].body).toEqual({
      parent: { database_id: 'db1' },
      properties: {
        '이름': { title: [{ text: { content: '크리스마스' } }] },
        '날짜': { date: { start: '2026-12-25' } },
      },
    });
  });

  it.each([
    ['bad JSON', '{'],
    ['missing title', { date: '2026-12-25' }],
    ['blank title', { title: '   ', date: '2026-12-25' }],
    ['201 chars', { title: '가'.repeat(201), date: '2026-12-25' }],
    ['bad date', { title: 'x', date: '2026-02-30' }],
    ['null body', null],
  ])('rejects %s', async (_, body) => {
    expect((await POST(req('/api/events', 'POST', body))).status).toBe(400);
    expect(calls).toHaveLength(0);
  });

  it('accepts exactly 200 chars (code points)', async () => {
    replies = [{ body: page('new', 'x', '2026-12-25') }];
    expect((await POST(req('/api/events', 'POST', { title: '😀'.repeat(200), date: '2026-12-25' }))).status).toBe(201);
  });
});

describe('PATCH / DELETE', () => {
  const id = '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d';

  it('updates title and date', async () => {
    replies = [{ body: page(id, '새 이름', '2026-12-31') }];
    const res = await PATCH(req(`/api/events?id=${id}`, 'PATCH', { title: '새 이름', date: '2026-12-31' }));
    expect(res.status).toBe(200);
    expect(calls[0]).toMatchObject({ method: 'PATCH', url: `https://api.notion.com/v1/pages/${id}` });
  });

  it('archives on delete', async () => {
    const res = await DELETE(req(`/api/events?id=${id.replaceAll('-', '')}`, 'DELETE'));
    expect(res.status).toBe(204);
    expect(calls[0].body).toEqual({ archived: true });
  });

  it.each(['', '?id=../databases/x', '?id=xyz'])('rejects id %s', async (q) => {
    expect((await DELETE(req(`/api/events${q}`, 'DELETE'))).status).toBe(400);
    expect(calls).toHaveLength(0);
  });
});
