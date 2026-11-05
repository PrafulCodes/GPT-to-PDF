import type { Metadata } from 'next';
import BlogArticle from '../../../components/BlogArticle';
import { siteUrl } from '../../../lib/branding';

export const metadata: Metadata = {
  title: 'Archiving AI Research and Prompts for Teams',
  description: 'A practical workflow for archiving AI research and prompt engineering outputs: what to keep, how to name and log it, and how to govern it.',
  alternates: { canonical: `${siteUrl}/blog/archiving-ai-research-and-prompt-engineering-outputs-for-teams` }
};

export default function TeamArchivingPost() {
  return <BlogArticle title="Archiving AI Research and Prompts for Teams" description={metadata.description as string} date="October 15, 2026" sections={[
    { heading: 'Start with a reviewable unit of work', paragraphs: ['Use one conversation per task or decision where possible. Before sharing it, remove secrets and personal information that the recipient does not need. A public ChatGPT share link can be viewed by anyone who has it, so treat the link itself as sensitive.'] },
    { heading: 'Capture the context, not just the answer', paragraphs: ['Record the date, project, purpose, model if known, prompt version, sources checked, reviewer, and what the team decided to do next. The PDF is a readable capture, not proof that an AI answer is correct.'] },
    { heading: 'A naming convention that scales', paragraphs: ['Put the date first so files sort chronologically, followed by enough context to recognize the file: YYYY-MM-DD_project-or-topic_tool_version_initials.pdf. Store it in an access-controlled location with a documented retention period.'] },
    { heading: 'Where GPTtoPDF fits', paragraphs: ['GPTtoPDF accepts a public HTTPS share link and renders a PDF with headings, lists, code, tables, images, and supported mathematical content where the source exposes them. It does not accept private conversations or arbitrary URLs. The application does not intentionally save conversation contents or generated PDFs in its database or file storage, but operational metadata can be processed by hosting and analytics providers.'] },
    { heading: 'Make the archive useful later', paragraphs: ['Keep the exported file with related project notes, sources, and review status. For regulated or high-stakes work, ask your legal or records team whether a PDF meets the required retention, access-control, and audit standards.'] }
  ]} />;
}
