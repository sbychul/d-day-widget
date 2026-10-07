# 02 — Figma 디자인 초안

Status: resolved
Blocked by: 01

## 목표

구현에 들어가기 전에 사용자가 화면을 직접 보고 승인할 수 있는 Figma 디자인을 만든다. 승인본은 UI의 기준이 된다(AGENTS.md #24, #25).

## 절차

1. Figma 팀 "소병철/컴퓨터공학부의 팀"에 새 디자인 파일 `D-day Widget`을 만든다.
2. **시안 단계**: 기본 상태(라이트)로 2–3개 방향을 만든다.
   - 모두 Notion 톤 안에서 변주한다. 바꿔 볼 요소는 여백, 메인 숫자 크기·굵기, 구분선 유무, 목록 행 밀도, 입력칸 모양이다.
   - 시안별로 한 줄 설명을 붙인다.
3. 사용자가 방향 하나를 고를 때까지 기다린다. 피드백이 있으면 반영한다.
4. **본 제작**: 고른 방향으로 아래 12프레임을 만든다.
5. 사용자의 승인을 받는다.
6. Figma 파일 URL을 `AGENTS.md` 1절에 기록한다. 승인 과정에서 바뀐 문구·수치를 `spec.md`에 반영한다.
7. Handoff를 작성한다.

## 프레임 (상태 6종 × 라이트/다크)

| 상태 | 내용 |
|---|---|
| 기본 | 일정 5–6개. 목록이 넘쳐서 스크롤되는 모습이 보이게 한다. 행 하나는 hover 상태로 `×`를 보여준다. |
| 빈 상태 | `일정이 없어요` |
| 수정 중 | 목록 행 하나가 하이라이트되고, 입력칸에 `2026-12-25 크리스마스`, 상태 줄에 `수정 중 · Esc로 취소`가 보인다. |
| 삭제 확인 | 목록 행 하나의 버튼이 `삭제?`로 바뀐 상태 |
| 입력 오류 | 입력칸에 `크리스마스`, 상태 줄에 빨간 `날짜를 알아볼 수 없어요 (예: 12/25 크리스마스)` |
| D-Day 당일 | 메인이 `D-Day` |

- 프레임 크기: 폭 360, 높이 420. 처음 기준은 720(Notion 기본 페이지 폭)이었으나 사용자 요청으로 절반으로 줄였다(2026-10-07).
- 오늘 날짜: `2026.10.07 (수)`.
- 샘플 데이터: 기말고사(D-10), 과제 제출(D-15), 동아리 MT(D-20), 졸업작품 발표(D-45), 크리스마스(D-79), 신정 연휴(D-86).
- 색과 글꼴은 spec 5절의 "스타일"을 시작점으로 쓴다. Figma에서는 Inter + Noto Sans KR로 대체해도 된다.
- 텍스트·색은 가능하면 Figma 변수와 스타일로 묶는다. 라이트/다크 모드 변수를 쓰는 것을 권장한다.

## 완료 조건

- 12프레임이 모두 있고, 사용자가 명시적으로 승인했다.
- `AGENTS.md`에 Figma URL이 기록되었다.

## Comments

- 2026-10-07 claude-code
  - Figma 파일: https://www.figma.com/design/QmqZtbIUqhJNng8R6xPUVl
  - 페이지 `01 시안`: A 블록형, B 콜아웃형, C 데이터베이스형.
  - 사용자가 **A 블록형**을 골랐다. 함께 받은 요청은 두 가지다.
    - 폭을 절반(360)으로 줄인다.
    - 시안에 넣었던 Notion 페이지 맥락(제목, 부제목, 메모)은 빼고 위젯만 그린다. 제목과 메모는 사용자가 Notion에서 직접 쓴다.
  - 페이지 `02 화면`: 12프레임 완성(섹션 `D-day Widget · 블록형 (360×420)`).
    - 색은 변수 컬렉션 `Theme`(Light/Dark 모드)으로 묶었다. 토큰은 8개다: `bg`, `text`, `sub`, `placeholder`, `divider`, `hover`, `highlight`, `error`.
    - 다크 프레임은 라이트 프레임을 복제한 뒤 모드만 Dark로 바꿨다.
  - **사용자 승인 대기 중.**
- 2026-10-07 claude-code (1차 피드백 반영)
  - 색을 Notion Color Reference(https://thomasfrank.notion.site/Color-Reference-0877519165f34930ad1fe53071e54155)에 맞춰 다시 구성했다.
    - 문서에 값이 있는 항목은 그 값을 썼다.
    - 문서에 없는 항목(bg, text, placeholder, divider, 다크 hover)은 같은 페이지를 렌더할 때 Notion이 쓰는 CSS 변수(`--c-*`)에서 가져왔다.

    | 토큰 | Light | Dark | 출처 |
    |---|---|---|---|
    | bg | `#FFFFFF` | `#191919` | Notion `--c-bacPri` |
    | text | `#2C2C2B` | `#F0EFED` | Notion `--c-texPri` |
    | sub | `#787774` | `#9B9B9B` | Color Reference · Gray text |
    | placeholder | `#A19E99` | `#7D7A75` | Notion `--c-texTer` |
    | divider | `#E6E5E3` | `#383836` | Notion `--c-borPri` |
    | hover | `#F1F1EF` | `#262626` | Light: Color Reference · Gray block highlight. Dark: Notion `--c-bacInt` |
    | highlight | `#D3E5EF` | `#28456C` | Color Reference · Blue BG |
    | error | `#D44C47` | `#DF5452` | Color Reference · Red text |

  - Main 레이어: hug(80)에서 고정 높이 90으로 바꾸고 SPACE_BETWEEN을 적용했다. D-00과 일정명 사이에 10px 간격이 생긴다.
  - 위젯 패딩을 12로 통일했다(상단 16 → 12, 오늘 날짜가 위로 올라감).
  - 빈 상태: Main 90, 하단 정렬. `일정이 없어요`는 일정명과 같은 서식(Noto Sans KR Medium 18, text)이다.
    - 구분선 y=140, 문구 y=106으로 일정이 있는 화면과 같다. 12프레임 모두 수치로 확인했다.
- 2026-10-07 claude-code (2차 피드백)
  - Main 높이를 90에서 84로 줄였다(간격이 너무 넓다는 피드백). 12프레임 모두 구분선 y=134, 일정명 y=100이다.
  - 사용자 답변 "나머지는 만족"을 승인으로 처리했다.

## Answer

12프레임(블록형, 360×420, 상태 6종 × Light/Dark)을 사용자가 승인했다.
- Figma: https://www.figma.com/design/QmqZtbIUqhJNng8R6xPUVl (페이지 `02 화면`)
- URL은 `AGENTS.md` 1절에 기록했다.
- 팔레트와 치수는 spec 5절 "스타일"에 반영했다.
- Handoff: `handoffs/2026-10-07-04-claude-code.md`
