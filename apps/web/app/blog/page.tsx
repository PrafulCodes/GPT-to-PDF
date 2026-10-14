import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { siteUrl } from '../../lib/branding';

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Practical guides for preserving, archiving and governing ChatGPT conversations as readable PDFs.',
  alternates: { canonical: `${siteUrl}/blog` }
};

const posts = [
  ['Why Browser Print Breaks ChatGPT Code and Tables', '/blog/why-browser-printing-breaks-chatgpt-code-blocks-and-tables', 'Why Ctrl+P clips code, drops table columns and garbles equations in ChatGPT chats.'],
  ['Archiving AI Research and Prompts for Teams', '/blog/archiving-ai-research-and-prompt-engineering-outputs-for-teams', 'A practical workflow for archiving AI research and prompt engineering outputs.'],
  ['Documenting LLM Interactions With Secure PDFs', '/blog/legal-compliance-teams-document-llm-interactions-secure-pdfs', 'How legal and compliance teams capture, verify and store AI conversations as PDFs.']
];

export default function BlogIndexPage() {
  return <div><Navbar /><main className="px-4 py-12"><div className="mx-auto max-w-3xl"><h1 className="text-4xl font-extrabold">GPTtoPDF guides</h1><p className="mt-4 text-lg text-slate-600">Useful, honest guidance for keeping AI work readable and reviewable.</p><div className="mt-10 space-y-5">{posts.map(([title, href, description]) => <article key={href} className="rounded-2xl border border-slate-200 p-6"><h2 className="text-xl font-bold"><Link href={href} className="text-blue-700 hover:underline">{title}</Link></h2><p className="mt-2 text-slate-600">{description}</p></article>)}</div></div></main><Footer /></div>;
}
