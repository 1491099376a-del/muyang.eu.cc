import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const dynamic = "force-static";

export function generateStaticParams() {
  return site.notes.items.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const note = site.notes.items.find((item) => item.slug === slug);
  if (!note) notFound();
  const url = `${site.url}/notes/${note.slug}`;
  return {
    title: note.title,
    description: note.description,
    alternates: { canonical: url },
    openGraph: { type: "article", title: note.title, description: note.description, url, publishedTime: note.date },
    twitter: { card: "summary", title: note.title, description: note.description },
  };
}

export default async function NotePage({ params }: Props) {
  const { slug } = await params;
  const note = site.notes.items.find((item) => item.slug === slug);
  if (!note) notFound();
  return (
    <article className="shell article-page">
      <Link className="text-link" href="/#notes">{site.notes.backLabel}</Link>
      <header>
        <p className="eyebrow">{note.topic}</p>
        <h1>{note.title}</h1>
        <time dateTime={note.date}>{note.date}</time>
        <p className="article-description">{note.description}</p>
      </header>
      <div className="article-body">{note.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
    </article>
  );
}
