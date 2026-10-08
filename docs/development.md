# 개발 가이드

위젯을 직접 실행하거나 고치거나 배포하는 사람을 위한 문서입니다. 사용자용 안내는 [README](../README.ko.md)에 있습니다. AI 에이전트 작업 규칙은 [AGENTS.md](../AGENTS.md), 상세 규격은 [spec](../.scratch/d-day-widget/spec.md)에 있습니다.

준비물: Node.js 22.12 이상, Vercel 계정, Notion API 토큰·데이터베이스 ID·접근 키(README 1–5단계).

## 로컬에서 실행하기

1. 저장소를 받고 의존성을 설치합니다.
   ```bash
   npm install
   ```
2. `.env.example`을 복사해서 프로젝트 폴더에 `.env` 파일을 만들고 값을 채웁니다.
   ```
   NOTION_TOKEN=ntn_...
   NOTION_DB_ID=데이터베이스ID
   WIDGET_KEY=영문숫자32자이상의접근키
   ```
   `npx vercel dev`는 `.env.local`이 아니라 `.env`를 읽습니다. 두 파일 모두 git에 올라가지 않습니다.
3. Vercel CLI에 로그인하고 프로젝트를 연결합니다. 처음 한 번만 하면 됩니다.
   ```bash
   npx vercel login
   ```
   ```bash
   npx vercel link
   ```
4. 실행합니다.
   ```bash
   npx vercel dev
   ```
   터미널에 나온 주소 뒤에 `?key=`를 붙여서 엽니다(예: `http://localhost:3000/?key=<WIDGET_KEY>`). 키가 없거나 틀리면 API가 401을 반환합니다.

> Windows에서 `vercel dev`를 끈 뒤 다시 켤 때 포트가 이미 사용 중이라고 나오면, 남아 있는 `node` 프로세스를 작업 관리자에서 종료하세요.

## GitHub에 올리기

1. GitHub에서 새 저장소를 만듭니다(예: `d-day-widget`). README 등은 추가하지 않습니다. README의 **Deploy with Vercel** 버튼을 쓰려면 저장소가 **Public**이어야 합니다. 버튼 링크의 `<OWNER>`도 실제 계정명으로 바꿉니다.
2. 프로젝트 폴더에서 원격 저장소를 연결하고 push합니다.
   ```bash
   git remote add origin https://github.com/<내 아이디>/d-day-widget.git
   ```
   ```bash
   git push -u origin main
   ```

GitHub CLI(`gh`)가 있다면 1–2단계를 한 번에 할 수 있습니다.
```bash
gh repo create d-day-widget --public --source . --push
```

## Vercel에 직접 배포하기

1. https://vercel.com/new 에서 GitHub 저장소를 **Import**합니다.
   - `vercel link`로 이미 Vercel 프로젝트를 만들었다면, 새로 Import하지 않아도 됩니다. 그 프로젝트의 **Settings → Git**에서 저장소를 연결하세요.
2. Framework Preset은 **Vite**로 자동 인식됩니다. 빌드 설정은 바꾸지 않습니다.
3. **Environment Variables**에 두 값을 등록합니다.

   | Key | Value |
   |---|---|
   | `NOTION_TOKEN` | Notion API 토큰 ([README 1단계](../README.ko.md)) |
   | `NOTION_DB_ID` | 데이터베이스 ID ([README 4단계](../README.ko.md)) |
   | `WIDGET_KEY` | 접근 키 ([README 5단계](../README.ko.md)) |

4. **Deploy**를 누릅니다. 끝나면 `https://<프로젝트이름>.vercel.app` 같은 주소가 생깁니다.

이후로는 `main` 브랜치에 push할 때마다 자동으로 다시 배포됩니다.

> 환경변수를 나중에 추가하거나 바꿨다면 **Deployments**에서 최신 배포를 **Redeploy**해야 적용됩니다.

## 명령과 구성

| 용도 | 명령 |
|---|---|
| 테스트 | `npm test` |
| 타입 검사 | `npx tsc --noEmit` |
| 빌드 | `npm run build` |
| 로컬 실행 (프론트 + API) | `npx vercel dev` |

구성은 다음과 같습니다.
- `index.html`, `src/`: 화면(Vite, TypeScript, 의존성 없음)
- `api/events.ts`: Notion API 중계 함수
- `public/keygen.html`: 접근 키 생성 페이지(README 5단계 버튼). 정적 파일이며, CSP로 네트워크 요청을 모두 막는다.

> 배포에 비밀값 파일이 올라가지 않도록 `.vercelignore`가 `.env*`를 제외합니다. CLI 배포(`vercel --prod`)는 이 파일이 없으면 로컬 `.env`까지 업로드하고, 서버가 그 값을 사용합니다.
