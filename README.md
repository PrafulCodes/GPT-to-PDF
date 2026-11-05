# GPT to PDF

[![Open Source](https://img.shields.io/badge/open%20source-yes-brightgreen?style=for-the-badge)](./LICENSE)

Convert public ChatGPT shared links into polished, downloadable PDFs.

A lightweight Next.js 15 (App Router) webapp + API for fetching public ChatGPT conversations, parsing the conversation hydration data, and producing premium-formatted PDF exports.

**GPT to PDF is open source.** Anyone can inspect the code, use the project,
report issues, and contribute improvements under the [Praful Attribution
License (PAL)](./LICENSE).

![Vercel](https://img.shields.io/badge/deploy-vercel-000000?style=flat&logo=vercel) ![License](https://img.shields.io/badge/license-PAL-blue)

---

## Live Demo

- Demo: https://www.gpttopdf.site

---

## Features

- Convert ChatGPT shared links to PDF
- Beautiful, premium PDF formatting and typographic defaults
- Markdown rendering with code block support and syntax highlighting
- KaTeX rendering for inline/display LaTeX, including multiline environments and matrices
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

### Mathematical content

The PDF pipeline renders `$...$`, `$$...$$`, `\(...\)`, and `\[...\]` with KaTeX. Common
equation, alignment, gather, cases, and matrix environments are supported. If a shared
conversation already contains browser-rendered KaTeX or MathJax, the original TeX
annotation is recovered before Markdown conversion so expressions are not discarded.
KaTeX fonts are embedded in the generated document because Puppeteer's `setContent`
pages do not have a filesystem base URL for relative font assets.

ChatGPT `:::writing{...}` wrappers are removed only when they occupy a complete
standalone line; literal LaTeX inside Markdown code spans and fenced code blocks is
left unchanged.

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
apps/web/            # Public Next.js app
  app/               # Pages, layouts, metadata, and API routes
  components/        # Reusable UI components
  lib/               # PDF, parsing, rate-limiting, and request helpers
  public/             # Static assets
  styles/             # Global and page styles
packages/analytics/  # Analytics parsing and test utilities
packages/db/         # Database and Prisma integration
packages/shared/     # Shared TypeScript utilities
scripts/              # Repository utility scripts
docs/                 # Project documentation and content assets
```

The repository is an npm workspace managed with Turborepo. The public
application lives in `apps/web/`; the `packages/` directories contain code
shared by the application and database tooling.

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
- Analytics and usage insights

---

## Contributing

Contributions are welcome. Start with these contributor resources:

- [Contributors](./contributors.md) — contribution standards and pull request checklist
- [Contributor development guide](./contributorsguide.md) — setup, testing, branches, commits, and pull requests

Please read both documents before opening an issue or pull request.

---

## License

This project is provided under the Praful Attribution License (PAL). See the
[`LICENSE`](./LICENSE) file for the complete terms.

---

## Author

Created by Praful Mohite

- GitHub: https://github.com/PrafulCodes
- Website: https://www.gpttopdf.site

---

## Notes (preserved)

- Uses `puppeteer-core` + `@sparticuz/chromium` for headless Chrome compatible with Vercel serverless.
- Parser uses heuristics; OpenAI markup can change — error handling is included.
