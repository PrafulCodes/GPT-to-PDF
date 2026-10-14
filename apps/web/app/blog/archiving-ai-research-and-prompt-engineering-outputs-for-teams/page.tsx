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
    { heading: 'A practical archiving workflow', paragraphs: ['Use one conversation per task, capture it when its output is used, convert the public share link to PDF, and remove the link after capture. Name the file consistently, log useful metadata, store it in an access-controlled location and review it on a schedule.'] },
    { heading: 'A naming convention that scales', paragraphs: ['Put the date first so files sort chronologically, followed by enough context to recognize the file: YYYY-MM-DD_project-or-topic_tool_version_initials.pdf.'] },
    { heading: 'Version prompts like code', paragraphs: ['Keep the prompt text, variables, model, settings, output and a note about what changed. Archive test cases and evaluation criteria so a later reader can understand why one version replaced another.'] },
    { heading: 'Security and privacy guardrails', paragraphs: ['Treat shared links as public, screen for secrets and personal data, limit access, set retention dates and use tools that do not keep conversation content. GPTtoPDF holds content in memory only long enough to build the PDF and does not store the conversation or file.'] },
    { heading: 'Governance: make the archive stick', paragraphs: ['Name an owner, make capture part of done, and audit a sample each quarter. An archive needs a clear unit of capture, consistent metadata and someone responsible for review.'] }
  ]} />;
}
