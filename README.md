# D-day Widget

**English** | [한국어](README.ko.md)

A D-day widget you embed in a Notion page. Type something like `12/25 Christmas` in the input and press Enter, and the event is saved to a Notion database. The closest event is shown large, with the rest listed below it.

<!-- Screenshot placeholder: after deploying, save a capture of the widget embedded in Notion as docs/screenshot.png and uncomment the line below. -->
<!-- ![D-day widget](docs/screenshot.png) -->

- Uses Notion's default fonts and colors, so it blends into the page.
- Light/dark mode follows your system setting.
- Past events are archived in Notion automatically. You can restore them from the trash.

## What you need

- A Notion account
- A GitHub account (used in step 6 to sign in to Vercel and to hold your copy of the widget; free)

---

## 1. Create a Notion API connection

Get the API token the widget uses to access Notion.

1. Open Notion **Settings**, search for `developer`, and turn on **Enable developer features**.
2. Go to **Settings → Features → Connections**, click **Add connection**, and choose **Developer connection**. You are taken to the **Developer tools** screen.
3. Click **New connection**, fill in the following, and create it.
   - Connection name: anything (e.g. `D-day Widget`)
   - Authentication method: **API token**
4. Copy the issued **API token** (it starts with `ntn_`).
5. Click the connection you just made and check that all three of these are enabled under **Capabilities**.
   - Read content
   - Update content
   - Insert content

> This token works like a password. Don't show it to anyone or paste it anywhere public.

## 2. Create a database for the widget

1. Create a new page in Notion and type `/database`. **Database - Full page** is recommended, but inline works too.
2. Set up the properties **exactly** as below. Names are case-sensitive; if even one character differs, the widget won't work.

   | Property name | Type |
   |---|---|
   | `Name` | Title (the default title property is already `Name`; leave it as is) |
   | `Date` | Date (click **Add property**, choose **Date**, and name it `Date`) |

   Other properties are fine to have.

## 3. Add the connection to the database

1. Click **`⋯`** at the top right of the database page → **More** → **Connections**.
2. Search for the connection from step 1 and add it.

## 4. Find the database ID

Use whichever method is easier. Hyphens (`-`) are optional.

- At the very bottom of the database page, find **DATABASE** with the ID next to it, and click its copy button
- Open the database as a full page and copy it from the address bar. The URL looks like one of these:
  ```
  https://www.notion.so/<workspace>/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d?v=...
  https://app.notion.com/p/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d?v=...
                           └─────────── database ID ───────────┘
  ```
  The 32 characters **before** `?v=` are the database ID. The part after `?v=` is the view ID and isn't used.

> Note: the **parent page ID** and the **data source ID** are different values. Make sure you use the **database ID**.

## 5. Generate an access key

Create an **access key** only you know, so people who learn the widget URL can't see or change your events. Think of it as a password for the site.

[![Generate access key](https://img.shields.io/badge/Access%20key-Generate-2383E2?style=for-the-badge)](https://d-day-widget.vercel.app/keygen.html)

1. Click the button above to generate a random 32-character key. The key is generated only in your browser and never sent anywhere.
2. Click **Copy** and save it somewhere. Once you close the page, you can't see the same key again.
3. Use this key, **exactly the same**, as `WIDGET_KEY` in step 6 and as `?key=` in the embed URL in step 7.

You can also pick your own: at least 32 characters, **letters and digits only**, and hard to guess.

## 6. Deploy your widget

Click the button below and Vercel copies the widget to your account and deploys it. No code or terminal needed.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fsbychul%2Fd-day-widget&project-name=d-day-widget&repository-name=d-day-widget&env=NOTION_TOKEN,NOTION_DB_ID,WIDGET_KEY&envDescription=NOTION_TOKEN%3A%20API%20token%20from%20step%201%20%2F%20NOTION_DB_ID%3A%20database%20ID%20from%20step%204%20%2F%20WIDGET_KEY%3A%20access%20key%20from%20step%205)

1. Click the button and sign in to Vercel with your GitHub account. If you don't have a Vercel account, one is created now (free).
2. Leave the repository name as is and click **Create**. A copy of the widget is created in your GitHub.
3. Fill in the three environment variables.

   | Name | Value |
   |---|---|
   | `NOTION_TOKEN` | API token from step 1 |
   | `NOTION_DB_ID` | Database ID from step 4 |
   | `WIDGET_KEY` | Access key from step 5 |

4. Click **Deploy**. After about a minute, the success screen shows your widget URL. `d-day-widget.vercel.app` is already taken, so Vercel adds characters to the end automatically (e.g. `https://d-day-widget-abc12.vercel.app`). You can find it later under **Settings → Domains** in your Vercel project.

> If you entered a wrong value, fix it in **Settings → Environment Variables** of your Vercel project, then **Redeploy** the latest deployment from **Deployments**.

## 7. Embed it in Notion

1. On the Notion page where you want the widget, type `/embed`. The **Link** tab opens by default.
2. Paste your widget URL from step 6 with `?key=<access key>` appended, then click **Embed Link**.
   ```
   https://your-widget.vercel.app/?key=ACCESS_KEY_FROM_STEP_5
   ```
   If the widget shows `The key in the widget URL is missing or wrong`, check the key again.
3. Drag the bottom edge of the block to adjust its height. Long lists scroll inside the widget.

> Dark mode tip: the widget follows your **system (OS/browser) setting**. If you pin Notion's theme to dark, the widget's colors may not match. Set Notion **Settings → Preferences → Appearance → Theme** to **Use system setting** to keep them in sync.

---

## Usage

### Add an event

Type `<date> <event name>` in the input and press Enter. There **must be a space** between the date and the name.

| Format | Example |
|---|---|
| Month/day (`/`, `-`, `.` all work) | `12/25 Christmas`, `12-25 …`, `12.25 …` |
| Year-month-day | `2026-12-25 …`, `26-12-25 …` |
| Digits only | `1225 …` (MMDD), `261225 …` (YYMMDD) |
| Korean | `12월 25일 …`, `2026년 12월 25일 …` |

- Without a year, this year is used. If the date has already passed this year, next year is used. Today shows as `D-Day`.
- If you give a year and the date has already passed, it isn't added.
- Event names can be up to 200 characters.

### Edit

Click an event (including the large one) and the input fills with its contents, like `2026-12-25 Christmas`. Press Enter to save, or press the **Cancel** button above the input (or Esc) to cancel. With a keyboard, focus an event and press Enter.

### Delete

Hover over an event to reveal `×`. On mobile it's always visible.
1. Click `×` and it changes to `Delete?`.
2. Click it again within 3 seconds to delete.

Deleted events go to the Notion trash and can be restored for 30 days.

### Automatic cleanup and refresh

- Past events are archived in Notion the next time the widget opens. You can restore them from the Notion trash.
- Changes made on another device or directly in Notion are loaded when you come back to the widget tab, or after midnight.

## Caveats

- **The access key is part of the embed URL.** Anyone who can view the Notion page can also see the embed URL, so **don't publish the page with the widget to the web or share it with others.**
- If the key leaks, change `WIDGET_KEY` to a new value in **Settings → Environment Variables** of your Vercel project and **Redeploy**, then update `?key=` in your Notion embed URL as well. The old key stops working.
- Updates to the original widget are not applied to your copy automatically.
- The Notion database is the source of truth for the widget's data. You can add or edit events directly in Notion too, but items with an empty `Date` don't appear in the widget.

## For developers

To modify or run it yourself, see [docs/development.md](docs/development.md).
