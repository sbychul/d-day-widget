# 04 — 날짜 파서

Status: ready-for-agent
Blocked by: 03

## 목표

spec 3절을 그대로 구현한다.

## 범위

- `src/parse.ts`
  - `parseInput(input, today)`
  - `ddays(today, date)`
  - `formatToday(date)`: `YYYY.MM.DD (요일)`
- `src/parse.test.ts`: spec 7절에 나열된 경우를 모두 다룬다.

## 주의

- `Date` 객체의 로컬 시간대 해석에 기대지 않는다. 연·월·일 정수로 비교하고, 날짜 산술에는 `Date.UTC`만 쓴다.
- 오류 문구는 spec 표의 문자열을 글자 그대로 쓴다.

## 완료 조건

- `npx vitest run` 통과
- `npx tsc --noEmit` 통과

## Comments
