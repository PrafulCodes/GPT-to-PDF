import Link from 'next/link';

export default function ContentPackSection() {
  return (
    <section className="site-container home-section section-wide" aria-labelledby="saving-is-hard">
      <div className="section-intro">
        <h2 id="saving-is-hard" className="section-heading">
          Why Saving a ChatGPT Conversation Is Harder Than It Looks
        </h2>
        <p className="seo-body">
          A ChatGPT conversation looks like plain text on screen, but underneath it is a structured document: headings, nested lists,
          fenced code blocks, tables and LaTeX equations, written as markdown and rendered by your browser. Saving it faithfully is a
          rendering problem, not a copy-and-paste problem. Every layer of structure has to survive the trip from a scrolling web page to
          fixed, paginated paper, and each layer fails in its own way.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900">Markdown Parsing Is Where the Trouble Starts</h3>
          <p className="mt-2">
            Large language models write in markdown, and markdown is more ambiguous than it appears. An expression like a_1 + b_2 can be
            read as italic text, a dollar sign can mean currency, and a pipe inside a code span can split a table cell. A reliable converter
            protects code and math first, parses markdown second, and restores the protected pieces last.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900">Code Blocks, Tables and Equations Need Their Own Layout Rules</h3>
          <p className="mt-2">
            Code is whitespace-sensitive, tables need to stay inside the margins, and display equations are single unbreakable units.
            Multilingual text, emoji and mathematical symbols add another requirement: the PDF needs fonts that contain those glyphs.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900">Why Browser Print Fails for AI Chats</h3>
          <p className="mt-2">
            Ctrl+P asks the browser to paginate a page built for a screen. The usual results are clipped code, invisible text, truncated
            scrollable content and awkward page breaks. Print settings can reduce some problems, but saving a conversation should not need
            a ten-step workaround.
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900">How GPTtoPDF Approaches the Problem</h3>
          <p className="mt-2">
            GPTtoPDF starts from a public ChatGPT shared link, formats the conversation as a document designed for paper, and returns a PDF.
            Code stays monospaced, tables stay inside the margins, equations stay legible and headings keep their hierarchy. Conversation
            content is held in memory just long enough to create the file and is not stored.
          </p>
        </article>
      </div>
      <p className="seo-body">
        Students, developers, researchers, consultants and teams all need a readable copy of an AI conversation that does not depend on a
        link staying alive. A PDF is a fixed, portable record you can file, print, annotate or send to anyone.
      </p>
      <p className="seo-body">
        Go deeper:{' '}
        <Link href="/blog/why-browser-printing-breaks-chatgpt-code-blocks-and-tables" className="link text-blue-700 hover:underline">
          Why Native Browser Printing Breaks ChatGPT Code Blocks and Tables
        </Link>
        {' · '}
        <Link href="/blog/archiving-ai-research-and-prompt-engineering-outputs-for-teams" className="link text-blue-700 hover:underline">
          The Ultimate Guide to Archiving AI Research and Prompt Engineering Outputs for Teams
        </Link>
        {' · '}
        <Link href="/blog/legal-compliance-teams-document-llm-interactions-secure-pdfs" className="link text-blue-700 hover:underline">
          How Legal and Compliance Teams Document LLM Interactions Using Secure PDFs
        </Link>
      </p>
    </section>
  );
}
