# GPT to PDF

Convert public ChatGPT shared links into polished, downloadable PDFs.

A lightweight Next.js 15 (App Router) webapp + API for fetching public ChatGPT conversations, parsing the conversation hydration data, and producing premium-formatted PDF exports.

Badges: ![Vercel](https://img.shields.io/badge/deploy-vercel-000000?style=flat&logo=vercel) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## Live Demo

- Demo: https://gpt-to-pdf-six.vercel.app

---

## Features

- Convert ChatGPT shared links to PDF
- Beautiful, premium PDF formatting and typographic defaults
- Markdown rendering with code block support and syntax highlighting
- Mobile-friendly UI and responsive PDFs
- No login required; works with public ChatGPT shared links
- No browser extension needed — server-side PDF generation
- Fast generation using headless Chromium in serverless environments
- SEO-optimized landing page

---

## How it works

1. Paste a public ChatGPT shared URL into the UI.
2. Server fetches the public conversation HTML/json.
3. Parser extracts structured hydration data from the OpenAI markup.
4. The server formats the conversation into a printable HTML template.
5. Puppeteer/Puppeteer-core renders the HTML and generates a premium PDF.
6. PDF is streamed back for instant download.

This repository contains both the frontend pages and the API routes that perform retrieval, parsing, formatting, and PDF rendering.

---

## Tech Stack

Frontend

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend

- Next.js API routes
- Puppeteer / puppeteer-core
- @sparticuz/chromium (serverless Chromium)

Deployment

- Vercel (recommended)

---

## Screenshots

- Landing Page

![Landing Page](./public/screenshots/landing.png)

- PDF Output

![PDF Output](./public/screenshots/pdf-output.png)

- Mobile Experience

![Mobile Experience](./public/screenshots/mobile.png)

(Replace the image files in `public/screenshots/` with real screenshots.)

---

## Installation (local)

1. Clone the repo

```bash
git clone https://github.com/your-username/gpt-to-pdf.git
cd gpt-to-pdf
```

2. Install dependencies

```bash
npm install
```

3. Run development server

```bash
npm run dev
```

4. Open http://localhost:3000

---

## Environment variables

Create a `.env` or configure in your deployment platform. Typical variables used by this project:

- `NEXT_PUBLIC_SITE_URL` — canonical site URL (used for SEO/meta links)
- `VERCEL_URL` — set automatically in Vercel; useful for absolute URLs

No secret keys are required for the core functionality that converts public shares, but if you add analytics or rate-limiting, add the relevant keys here.

---

## Project structure

```
app/                 # Next.js app routes + pages
  api/                # API routes (generate-pdf, stats, visitor-count)
components/          # UI components
lib/                  # Fetch, parse, generate helpers
public/               # Static assets and demo screenshots
styles/               # Global styles
```

- `app/` — React pages and entry points
- `components/` — UI building blocks (Hero, Footer, Input card)
- `lib/` — core logic: `fetch-chat.ts`, `parse-chat.ts`, `generate-pdf.ts`, `pdf-stats.ts`

---

## API Endpoints

- `POST /api/generate-pdf`
  - Request: JSON `{ "url": "https://chat.openai.com/share/XXXXXXXX" }`
  - Response: `application/pdf` stream (binary PDF)

- `GET /api/stats`
  - Returns basic stats/telemetry for the service (JSON)

Example local test (curl):

```bash
curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"url":"https://chat.openai.com/share/XXXXXXXX"}' --output convo.pdf
```

---

## Deployment (Vercel)

1. Push this repository to GitHub.
2. On Vercel, choose "Import Project" and select this repository.
3. Vercel will detect the Next.js app; set any environment variables if needed.
4. Deploy — Vercel will build and host the frontend and API routes.

Notes: The project uses `puppeteer-core` with `@sparticuz/chromium` to run headless Chrome in Vercel serverless functions. No additional custom server is required for typical deployments.

---

## Known limitations

- Only public ChatGPT shared links are supported. Private chats (behind authentication) are not accessible.
- Extremely long conversations can increase generation time and may hit serverless execution limits.
- HTML parsing relies on OpenAI's client markup; markup changes may require parser updates.
- Minor PDF rendering differences may appear between browsers/devices.

---

## Roadmap

- Additional PDF themes and templates
- More export formats (HTML, Markdown, DOCX)
- Improved layout and typographic options
- Analytics and usage dashboards

---

## Contributing

Contributions are welcome. Please open issues for bugs or feature requests and submit pull requests with clear descriptions and tests where appropriate.

---

## License

This project is provided under the MIT License. See the `LICENSE` file for details.

---

## Author

Created by Praful Mohite

- GitHub: https://github.com/PrafulCodes
- Website: https://gpt-to-pdf-six.vercel.app

---

## Notes (preserved)

- Uses `puppeteer-core` + `@sparticuz/chromium` for headless Chrome compatible with Vercel serverless.
- Parser uses heuristics; OpenAI markup can change — error handling is included.

