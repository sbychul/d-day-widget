export type ParseResult =
  | { ok: true; date: string; title: string }
  | { ok: false; error: string };

export const TITLE_MAX = 200;

export const ERR = {
  noDate: '날짜를 알아볼 수 없어요 (예: 12/25 크리스마스)',
  invalid: '없는 날짜예요',
  past: '이미 지난 날짜예요',
  noTitle: '일정명을 입력해 주세요',
  tooLong: `일정명은 ${TITLE_MAX}자까지 쓸 수 있어요`,
} as const;

type Parts = { y?: number; m: number; d: number };

// Order matters: the first match wins. Every token must be followed by whitespace or the end.
const PATTERNS: [RegExp, (g: string[]) => Parts][] = [
  [/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?=\s|$)/, (g) => ({ y: +g[1], m: +g[2], d: +g[3] })],
  [/^(\d{2})[-/.](\d{1,2})[-/.](\d{1,2})(?=\s|$)/, (g) => ({ y: 2000 + +g[1], m: +g[2], d: +g[3] })],
  [/^(\d{1,2})[-/.](\d{1,2})(?=\s|$)/, (g) => ({ m: +g[1], d: +g[2] })],
  [/^(\d{2})(\d{2})(\d{2})(?=\s|$)/, (g) => ({ y: 2000 + +g[1], m: +g[2], d: +g[3] })],
  [/^(\d{2})(\d{2})(?=\s|$)/, (g) => ({ m: +g[1], d: +g[2] })],
  [
    /^(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일(?=\s|$)/,
    (g) => ({ y: g[1] ? +g[1] : undefined, m: +g[2], d: +g[3] }),
  ],
];

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const utc = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

export function isValidDate(y: number, m: number, d: number): boolean {
  return m >= 1 && m <= 12 && d >= 1 && d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function titleLength(title: string): number {
  return [...title].length;
}

/** Parses `날짜 일정명`. `today` is the viewer's local date as YYYY-MM-DD. */
export function parseInput(input: string, today: string): ParseResult {
  const text = input.trim();
  for (const [re, toParts] of PATTERNS) {
    const match = re.exec(text);
    if (!match) continue;

    const parts = toParts(match);
    const { m, d } = parts;
    let y = parts.y;
    const [ty, tm, td] = today.split('-').map(Number);
    const yearGiven = y !== undefined;
    if (y === undefined) y = m < tm || (m === tm && d < td) ? ty + 1 : ty;

    if (!isValidDate(y, m, d)) return { ok: false, error: ERR.invalid };
    const date = iso(y, m, d);
    if (yearGiven && date < today) return { ok: false, error: ERR.past };

    const title = text.slice(match[0].length).trim();
    if (!title) return { ok: false, error: ERR.noTitle };
    if (titleLength(title) > TITLE_MAX) return { ok: false, error: ERR.tooLong };
    return { ok: true, date, title };
  }
  return { ok: false, error: ERR.noDate };
}

export function ddays(today: string, date: string): number {
  return Math.round((utc(date) - utc(today)) / 86_400_000);
}

export function dLabel(days: number): string {
  return days === 0 ? 'D-Day' : `D-${days}`;
}

/** Local calendar date of `now` as YYYY-MM-DD. */
export function localToday(now = new Date()): string {
  return iso(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/** `2026.10.07 (수)` */
export function formatToday(now = new Date()): string {
  const day = '일월화수목금토'[now.getDay()];
  return `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} (${day})`;
}
