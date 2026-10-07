# 06 — 위젯 UI

Status: ready-for-agent
Blocked by: 04, 05

## 목표

Figma 승인본(이슈 02)과 spec 5절에 따라 위젯 화면과 동작을 구현한다.

## 범위

- `index.html`: 구조
  1. 오늘 날짜
  2. 메인
  3. 목록
  4. 입력칸
  5. 상태 줄
- `src/main.ts`
  - 상태(`events`, `editingId`, `pending`)
  - 렌더링
  - 추가·수정·삭제의 낙관적 업데이트와 롤백
  - 두 번 클릭 삭제(3초)
  - `visibilitychange`와 자정 재조회
- `src/style.css`: Figma 승인본의 값. 다크모드는 `prefers-color-scheme`, `×` 노출은 `hover` 미디어 쿼리.

## 주의

- 프레임워크나 UI 라이브러리를 추가하지 않는다. DOM API만 쓴다.
- localStorage 등 브라우저 저장소를 쓰지 않는다.
- 사용자 입력(일정명)은 `textContent`로만 넣는다. `innerHTML` 금지(XSS 방지).
- 접근성 요구사항은 spec 5절을 따른다.

## 완료 조건

- `npx vitest run`, `npx tsc --noEmit`, `npm run build` 통과
- `npx vercel dev`로 Figma의 6가지 상태가 모두 재현되는지 라이트/다크에서 확인한다(스크린샷 권장).

## Comments
