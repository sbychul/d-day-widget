# 05 — 서버 함수 `api/events.ts`

Status: ready-for-agent
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
