# GPT to PDF (backend)

Minimal Next.js 15 (App Router) backend that accepts a public ChatGPT share URL and returns a downloadable PDF of the conversation.

Local testing

- Install:

```bash
npm install
```

- Run dev server:

```bash
npm run dev
```

- Test the API (example):

```bash
curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"url":"https://chat.openai.com/share/XXXXXXXX"}' --output convo.pdf
```

Deployment to Vercel (free tier)

- Push this repo to GitHub.
- On Vercel dashboard, import the repo, select the root project.
- No special environment variables required.
- Vercel will use the build command `npm run build` and `npm start` on production serverless functions.

Notes
- Uses `puppeteer-core` + `@sparticuz/chromium` for headless Chrome compatible with Vercel serverless.
- Parser uses heuristics; OpenAI markup can change — error handling is included.
