import { describe, expect, it } from 'vitest';
import { ERR, dLabel, ddays, formatToday, localToday, parseInput } from './parse';

const TODAY = '2026-10-07';
const ok = (date: string, title = '크리스마스') => ({ ok: true, date, title });
const fail = (error: string) => ({ ok: false, error });

describe('parseInput: formats', () => {
  it.each([
    ['2026-12-25 크리스마스'],
    ['2026.12.25 크리스마스'],
    ['2026/12/25 크리스마스'],
    ['26-12-25 크리스마스'],
    ['12/25 크리스마스'],
    ['12-25 크리스마스'],
    ['12.25 크리스마스'],
    ['261225 크리스마스'],
    ['1225 크리스마스'],
    ['2026년 12월 25일 크리스마스'],
    ['12월 25일 크리스마스'],
    ['12월25일 크리스마스'],
  ])('%s', (input) => {
    expect(parseInput(input, TODAY)).toEqual(ok('2026-12-25'));
  });

  it('accepts single-digit month and day', () => {
    expect(parseInput('1/5 신정', TODAY)).toEqual(ok('2027-01-05', '신정'));
  });

  it('trims input and title, keeps inner spaces', () => {
    expect(parseInput('  12/25   크리스마스 파티  ', TODAY)).toEqual(ok('2026-12-25', '크리스마스 파티'));
  });

  it('keeps a title that starts with digits', () => {
    expect(parseInput('1225 2차 면접', TODAY)).toEqual(ok('2026-12-25', '2차 면접'));
  });
});

describe('parseInput: year inference', () => {
  it('today stays this year', () => expect(parseInput('10/7 오늘', TODAY)).toEqual(ok('2026-10-07', '오늘')));
  it('yesterday moves to next year', () => expect(parseInput('10/6 어제', TODAY)).toEqual(ok('2027-10-06', '어제')));
  it('tomorrow stays this year', () => expect(parseInput('10/8 내일', TODAY)).toEqual(ok('2026-10-08', '내일')));
  it('rolls over at year end', () => expect(parseInput('1/1 신정', '2026-12-31')).toEqual(ok('2027-01-01', '신정')));
  it('applies to MMDD and 월/일 forms', () => {
    expect(parseInput('0301 개강', TODAY)).toEqual(ok('2027-03-01', '개강'));
    expect(parseInput('3월 1일 개강', TODAY)).toEqual(ok('2027-03-01', '개강'));
  });
});

describe('parseInput: leap years', () => {
  it('rejects 2/29 when the inferred year is not leap', () => {
    expect(parseInput('2/29 윤일', TODAY)).toEqual(fail(ERR.invalid));
  });
  it('accepts 2/29 when the inferred year is leap', () => {
    expect(parseInput('2/29 윤일', '2027-10-07')).toEqual(ok('2028-02-29', '윤일'));
  });
  it('accepts an explicit leap day', () => {
    expect(parseInput('2028-02-29 윤일', TODAY)).toEqual(ok('2028-02-29', '윤일'));
  });
});

describe('parseInput: errors', () => {
  it.each(['2/30 x', '13/1 x', '0/5 x', '12/0 x', '2026-02-30 x', '12월 32일 x'])('invalid date: %s', (input) => {
    expect(parseInput(input, TODAY)).toEqual(fail(ERR.invalid));
  });

  it('rejects an explicit past date', () => {
    expect(parseInput('2026-10-06 어제', TODAY)).toEqual(fail(ERR.past));
    expect(parseInput('26.10.06 어제', TODAY)).toEqual(fail(ERR.past));
  });

  it('accepts an explicit date equal to today', () => {
    expect(parseInput('2026-10-07 오늘', TODAY)).toEqual(ok('2026-10-07', '오늘'));
  });

  it.each(['12/25', '12/25    ', '2026-12-25'])('empty title: "%s"', (input) => {
    expect(parseInput(input, TODAY)).toEqual(fail(ERR.noTitle));
  });

  it('limits the title to 200 characters', () => {
    expect(parseInput(`12/25 ${'가'.repeat(200)}`, TODAY).ok).toBe(true);
    expect(parseInput(`12/25 ${'가'.repeat(201)}`, TODAY)).toEqual(fail(ERR.tooLong));
  });

  it.each(['12/25크리스마스', '크리스마스', '', '12345 x', '20261225 x', 'D-10 시험'])('no date: "%s"', (input) => {
    expect(parseInput(input, TODAY)).toEqual(fail(ERR.noDate));
  });
});

describe('ddays / dLabel', () => {
  it('counts calendar days', () => {
    expect(ddays(TODAY, TODAY)).toBe(0);
    expect(ddays(TODAY, '2026-10-08')).toBe(1);
    expect(ddays(TODAY, '2026-12-25')).toBe(79);
    expect(ddays('2026-12-31', '2027-01-01')).toBe(1);
    expect(ddays('2028-02-28', '2028-03-01')).toBe(2);
  });
  it('labels D-Day and D-n', () => {
    expect(dLabel(0)).toBe('D-Day');
    expect(dLabel(10)).toBe('D-10');
  });
});

describe('localToday / formatToday', () => {
  const d = new Date(2026, 9, 7, 23, 59);
  it('uses local calendar date', () => expect(localToday(d)).toBe('2026-10-07'));
  it('formats with weekday', () => expect(formatToday(d)).toBe('2026.10.07 (Wed)'));
});
