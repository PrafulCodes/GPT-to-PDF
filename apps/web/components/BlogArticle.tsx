import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';

export type BlogSection = { heading: string; paragraphs: string[] };

export default function BlogArticle({
  title,
  description,
  date,
  sections
}: {
  title: string;
  description: string;
  date: string;
  sections: BlogSection[];
}) {
  return (
    <div>
      <Navbar />
      <main className="px-4 py-10">
        <article className="mx-auto max-w-3xl">
          <Link href="/blog" className="text-sm font-medium text-blue-700 hover:underline">All guides</Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Guide by Praful Mohite · {date}</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">{title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">{description}</p>
          <div className="mt-10 space-y-9 text-slate-700 md:text-lg md:leading-relaxed">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-2xl font-bold text-slate-900">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-3">{paragraph}</p>)}
              </section>
            ))}
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
