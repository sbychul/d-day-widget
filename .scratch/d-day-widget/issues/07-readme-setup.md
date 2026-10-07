# 07 — README 셋업 안내

Status: resolved
Blocked by: 05

## 목표

사용자가 혼자서 Notion 연결부터 Notion 임베드까지 마칠 수 있는 `README.md`를 쓴다(AGENTS.md #19, #20).

## 범위

`README.md`는 다음 순서로 쓴다(spec 6절 기준).

1. 위젯 소개 1–2줄과 스크린샷 자리
2. Notion 내부 통합 만들기와 토큰 복사
3. 전용 DB 만들기. 속성 이름은 `이름`, `날짜`로 **정확히** 맞춘다.
4. DB에 통합 연결하기
5. DB ID 찾기(URL 예시 포함)
6. 로컬 실행: `.env` 작성(`.env.example` 복사. `npx vercel dev`는 `.env.local`을 읽지 않는다) → `npm install` → `npx vercel dev`
7. GitHub 저장소 만들기와 push
8. Vercel Import, 환경변수 등록, Deploy
9. Notion 페이지에 `/embed` → 배포 URL → 높이 조절
10. 사용법: 지원하는 날짜 형식 표, 수정(클릭/Esc), 삭제(두 번 클릭), 지난 일정 자동 보관
11. 주의: 인증이 없어서 URL이 유출되면 누구나 수정할 수 있다는 점. 보관된 항목은 Notion 휴지통에서 복구할 수 있다는 점.

## 완료 조건

- 각 단계에 사용자가 클릭하거나 입력할 내용이 구체적으로 적혀 있다.
- 사용자가 README만 보고 배포·임베드까지 마칠 수 있다(사용자 확인).

## Comments

## Answer

`README.md`를 작성했다. 이슈의 11개 항목을 모두 다뤘다.
- 추가한 내용:
  - Node.js 최소 버전 22.12(vitest의 engines 기준)
  - `vercel link`로 이미 프로젝트를 만든 경우 Git을 연결하는 법
  - 환경변수를 바꾼 뒤 Redeploy가 필요하다는 점
  - 다크 모드 팁: Notion 테마를 "시스템 설정 사용"으로 두기. 위젯은 OS/브라우저 설정을 따르기 때문이다.
  - Windows에서 포트가 남는 문제
  - `gh repo create` 한 줄 대안
- 완료 조건 "사용자가 README만 보고 배포까지 마칠 수 있다"는 실제 배포 때 확인한다.
- Handoff: `handoffs/2026-10-07-12-claude-code.md`
- 2026-10-07 claude-code (사용자 피드백 반영)
  - Notion 연결 만드는 절차가 바뀌었다(사용자 제보). 개발자 모드 → 설정 → 기능 → 연결 → 연결 추가하기 → 개발자 연결 → API 토큰. 연결의 기능에서 읽기, 업데이트, 삽입을 확인한다. README 1단계를 고치고, 용어도 "통합"에서 "연결"로 바꿨다.
  - README를 일반 사용자용으로 바꿨다.
    - 로컬 실행, GitHub, 수동 배포는 `docs/development.md`로 옮겼다(Q28).
    - 일반 사용자가 위젯 주소를 얻는 방법은 **Deploy with Vercel** 버튼이다(Q27). 이를 위해 원본 저장소는 Public이어야 한다.
  - 버튼 링크의 `<OWNER>`는 GitHub 저장소를 만들 때 바꾼다(README에 TODO 주석).
