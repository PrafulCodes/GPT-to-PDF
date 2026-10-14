import type { Metadata } from 'next';
import BlogArticle from '../../../components/BlogArticle';
import { siteUrl } from '../../../lib/branding';

export const metadata: Metadata = {
  title: 'Why Browser Print Breaks ChatGPT Code and Tables',
  description: 'Why Ctrl+P clips code, drops table columns and garbles equations in ChatGPT chats, what causes each failure, and how to get a clean PDF instead.',
  alternates: { canonical: `${siteUrl}/blog/why-browser-printing-breaks-chatgpt-code-blocks-and-tables` }
};

export default function BrowserPrintingPost() {
  return <BlogArticle title="Why Browser Print Breaks ChatGPT Code and Tables" description={metadata.description as string} date="October 15, 2026" sections={[
    { heading: 'A chat window is not a paper document', paragraphs: ['Pressing Ctrl+P asks the browser to paginate a page built for a screen. Chat interfaces are interactive applications, and they rarely ship a dedicated print layout. The result is often a document that looks acceptable in a preview but loses important structure on paper.'] },
    { heading: 'Why code blocks get clipped', paragraphs: ['Long lines sit inside horizontally scrolling containers. A screen can scroll; a printed page cannot, so the browser may cut off the right side or shrink the code until it is unreadable. A PDF exporter needs explicit wrapping and page-break rules while preserving indentation.'] },
    { heading: 'Why tables and equations fail', paragraphs: ['Tables can exceed the printable width or split mid-row without useful header context. Equations need their own typesetting pass, especially when markdown, inline math and display math are mixed. Background colors and fonts can also disappear in ordinary print settings.'] },
    { heading: 'A cleaner export workflow', paragraphs: ['GPTtoPDF starts from a public ChatGPT shared link, protects code and math before parsing markdown, and creates a document designed for fixed pages. No converter handles every edge case, so inspect important exports and report formatting problems.'] }
  ]} />;
}
