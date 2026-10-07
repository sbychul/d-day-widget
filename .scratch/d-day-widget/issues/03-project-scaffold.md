# 03 — 프로젝트 골격

Status: resolved
Blocked by: 02

## 목표

Vite(vanilla-ts) + Vercel 함수 + vitest가 동작하는 최소 골격을 만든다.

## 범위

- `git init` (기본 브랜치 `main`)
- `package.json`
  - 스크립트: `dev`(vite), `build`(`tsc --noEmit && vite build`), `test`(`vitest run`)
  - devDependencies: `vite`, `typescript`, `vitest`, `@types/node`
  - 런타임 의존성은 0개를 목표로 한다.
- `tsconfig.json`: `strict: true`. `src/`(DOM)와 `api/`(Node)를 함께 검사한다.
- `index.html`, `src/main.ts`(빈 진입점), `src/style.css`
- `api/events.ts`(빈 GET이 `[]`를 반환)
- `.gitignore`: `node_modules`, `dist`, `.env*.local`, `.vercel`. **`.scratch/`는 무시하지 않는다.**
- `.env.example`: `NOTION_TOKEN=`, `NOTION_DB_ID=`

`vercel.json`은 만들지 않는다. Vercel이 Vite와 `api/`를 자동으로 인식한다. 필요해지면 사유를 Handoff에 남긴다.

## 완료 조건

- `npm install`, `npm run build`, `npx vitest run`(테스트 0개여도 통과), `npx tsc --noEmit`이 모두 성공한다.
- `npx vercel dev`로 `GET /api/events`가 `[]`를 반환한다. Vercel CLI 로그인이 필요해서 실행하지 못하면 Handoff에 그 사실을 적는다.

## Comments

## Answer

골격을 만들었다. 확인 결과는 다음과 같다.
- `npx tsc --noEmit`, `npm run build`, `npm test`(종료 코드 0) 모두 통과했다.
- `GET`을 직접 호출하면 `200 application/json []`을 반환한다(Node 24의 TS 실행 기능으로 확인).
- `npx vercel dev`는 실행하지 못했다. Vercel CLI 로그인과 `vercel link`가 대화형이기 때문이다. 사용자가 처음 한 번 직접 해야 한다.
- 설치된 버전: vite 8.3, typescript 7.0, vitest 5.0, @types/node 26.6. 런타임 의존성은 0개다.
- Handoff: `handoffs/2026-10-07-05-claude-code.md`
