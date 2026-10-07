# 05 — 서버 함수 `api/events.ts`

Status: resolved
Blocked by: 03

## 목표

spec 4절을 그대로 구현한다. Notion REST를 중계하는 단일 함수다.

## 범위

- `export async function GET/POST/PATCH/DELETE(request: Request): Promise<Response>`
- 입력 검증: spec 4절 표
- Notion 호출: `fetch`, `Notion-Version: 2022-06-28`
  - 조회: `POST /v1/databases/{NOTION_DB_ID}/query`. `sorts`는 `날짜` asc, `created_time` asc이고, `has_more`/`next_cursor`로 끝까지 받는다.
  - 생성: `POST /v1/pages`. `parent.database_id`를 지정한다.
  - 수정·보관: `PATCH /v1/pages/{id}`
- Notion 페이지를 `Event`로 바꾸는 함수 1개. 제목은 `이름.title[].plain_text`를 이어 붙이고, 날짜는 `날짜.date.start`의 앞 10자다.
- GET의 지난 항목 보관은 순차 `await`로 처리한다(병렬 금지, 속도 제한 대응).

## 주의

- 속성 이름 `이름`, `날짜`는 불변이다(AGENTS.md #5).
- 토큰이나 Notion 원본 응답 전체를 클라이언트에 노출하지 않는다. 오류는 Notion의 `message`만 전달한다.

## 완료 조건

- `npx tsc --noEmit` 통과
- `npx vercel dev`와 실제 DB로 GET/POST/PATCH/DELETE와 지난 항목 보관을 확인한다. 토큰이 없어 확인하지 못하면 Handoff에 적고 이슈 07 이후로 넘긴다.

## Comments

## Answer

`api/events.ts`(GET/POST/PATCH/DELETE)와 `api/events.test.ts`(mock fetch 테스트 20개)를 만들었다.
- 서버는 `src/parse.ts`를 import하지 않고 자체 검증을 둔다. Vercel 함수는 번들되지 않은 ESM으로 실행되므로 `api/` 밖의 TS를 import하면 런타임에 실패할 위험이 있다. 겹치는 규칙(날짜 유효성, 200자 코드 포인트)은 테스트로 일치를 확인한다.
- 실제 Notion DB에서 검증했다.
  - Node로 핸들러를 직접 호출하는 방식: 조회 → 추가 → 어제 날짜 추가 → 수정 → 조회(어제 항목 자동 보관 확인) → 삭제 → 조회. 7단계 모두 정상이다.
  - `npx vercel dev`(Vercel 런타임): GET 200, POST 201, PATCH 200, DELETE 204, PUT 405, 검증 실패 400. 한글 왕복도 정상이다.
- 발견한 점: `vercel dev`는 `.env.local`의 값을 읽지 않고 `.env`를 읽는다. 문서(AGENTS.md, 이슈 07)를 고쳤다.
- Handoff: `handoffs/2026-10-07-08-claude-code.md`
