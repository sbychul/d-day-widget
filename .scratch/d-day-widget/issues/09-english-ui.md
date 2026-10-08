# 09 — UI 영어 통일, DB 속성 Name/Date, README 영어/한국어 분리

Status: resolved
Blocked by: 08

## 배경

일정명은 사용자가 직접 입력하므로, 나머지 고정 문구는 영어로 통일한다(사용자 요청 2026-10-08). 언어 설정이나 다국어 전환은 만들지 않는다.

## 범위

- 위젯 문구를 모두 영어로 바꾼다: 오늘 날짜 요일, 빈 상태, placeholder, 상태 줄, `Delete?`, 오류 문구, aria-label, `lang`.
- 한국어 날짜 입력(`12월 25일`)은 계속 받는다.
- Notion DB 속성 이름을 `이름`/`날짜`에서 `Name`/`Date`로 바꾼다.
- `public/keygen.html`을 영어로 바꾼다.
- `README.md`는 영어로 새로 쓴다. 기존 한국어 README는 `README.ko.md`로 옮긴다.
- AGENTS.md, spec.md, docs/development.md 링크, Figma `02 화면` 문구를 갱신한다.

## 완료 조건

- 위젯과 keygen에 한국어 고정 문구가 남지 않는다(사용자 데이터 제외).
- `npm test`, `npm run build`가 통과한다.

## Comments

- 2026-10-08 사용자 승인: 문구표대로 승인("언어 설정을 만들라는 얘기는 절대 아니야. 그냥 영어로 통일하자는 거야"). DB 속성은 영어(Name/Date)로 바꾸고, keygen도 영어로 바꾸고, 한국어 README는 `README.ko.md`로 둔다.

## Answer

- 영어 문구로 바꾸고 DB 속성 이름을 `Name`/`Date`로 바꿨다. README를 영어/한국어 두 개로 나눴다. Figma `02 화면` 문구도 바꿨다.
- 사용자 작업(배포 전): 현재 운영 Notion DB의 속성 이름을 `이름`에서 `Name`으로, `날짜`에서 `Date`로 바꿔야 한다. 바꾸지 않으면 push(자동 배포) 뒤 위젯이 일정을 읽지 못한다.
- Handoff: `handoffs/2026-10-08-02-claude-code.md`
