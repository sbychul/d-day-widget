# 07 — README 셋업 안내

Status: ready-for-agent
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
6. 로컬 실행: `.env.local` 작성 → `npm install` → `npx vercel dev`
7. GitHub 저장소 만들기와 push
8. Vercel Import, 환경변수 등록, Deploy
9. Notion 페이지에 `/embed` → 배포 URL → 높이 조절
10. 사용법: 지원하는 날짜 형식 표, 수정(클릭/Esc), 삭제(두 번 클릭), 지난 일정 자동 보관
11. 주의: 인증이 없어서 URL이 유출되면 누구나 수정할 수 있다는 점. 보관된 항목은 Notion 휴지통에서 복구할 수 있다는 점.

## 완료 조건

- 각 단계에 사용자가 클릭하거나 입력할 내용이 구체적으로 적혀 있다.
- 사용자가 README만 보고 배포·임베드까지 마칠 수 있다(사용자 확인).

## Comments
