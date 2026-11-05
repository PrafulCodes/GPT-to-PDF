export const FAQ_ITEMS = [
  {
    q: 'How do I convert a ChatGPT shared link to PDF?',
    a: 'Copy a public ChatGPT share URL, paste it into the converter, and click Generate PDF. When processing finishes, your browser will download the result.'
  },
  {
    q: 'Do I need a Chrome extension?',
    a: 'No. This tool converts public ChatGPT shared links server-side, so no extension or ChatGPT login is required. The application does not intentionally save conversation contents or generated PDFs.'
  },
  { q: 'Is this ChatGPT PDF converter free?', a: 'Yes — the basic converter is free and requires no signup.' },
  { q: 'Does it work on iPhone and Android?', a: 'Yes. The site is mobile-first and works in mobile browsers without installing an app.' },
  { q: 'Will formatting and code blocks be preserved?', a: 'The renderer preserves headings, lists, code blocks, tables, and supported mathematical formulas where possible. Complex or unsupported browser formatting may not reproduce exactly.' },
  { q: 'Do I need to sign up?', a: 'No signup is required — simply paste a public ChatGPT share link.' },
  { q: 'Can I convert long ChatGPT conversations?', a: 'Large conversations can be converted, but very long chats may take longer or hit serverless limits.' },
  { q: 'Why was my link rejected?', a: 'The link must use HTTPS, come from a supported ChatGPT share domain, and be publicly accessible. Private links, login pages, incomplete URLs, and arbitrary web pages are rejected.' },
  { q: 'What if the PDF is incomplete or the download fails?', a: 'For a long or complex conversation, try a shorter public share link and run the export again. If the PDF downloads but looks incomplete, compare it with the source and contact support with the error details.' },
  { q: 'Are my ChatGPT links stored?', a: 'The application does not intentionally save conversation contents or generated PDF files in its database or file storage. Technical request and analytics metadata may be retained by hosting and operational systems.' }
];
