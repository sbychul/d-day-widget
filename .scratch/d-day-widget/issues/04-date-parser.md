# 04 — 날짜 파서

Status: resolved
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

## Answer

`src/parse.ts`와 `src/parse.test.ts`(45개 테스트)를 만들었다.
- 공개 함수:
  - `parseInput`, `ddays`, `formatToday`
  - `dLabel`: `D-Day`/`D-n`
  - `localToday`: 로컬 YYYY-MM-DD, 클라이언트가 `today` 파라미터로 쓴다.
  - `isValidDate`, `titleLength`, `TITLE_MAX`, `ERR`: 이슈 05의 서버 검증에서 재사용할 수 있다.
- spec 3절에 비어 있던 두 가지를 명시했다.
  - 글자 수는 코드 포인트 기준으로 센다.
  - 오류는 정해진 순서로 판정하고, 먼저 걸린 하나만 표시한다.
- Handoff: `handoffs/2026-10-07-07-claude-code.md`
