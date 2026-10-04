import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";
import { emailUrl, externalUrl } from "@/lib/links";

export const metadata: Metadata = { alternates: { canonical: site.url } };

function SectionHeading({ eyebrow, heading }: { eyebrow: string; heading: string }) {
  return <div className="section-heading"><p className="eyebrow" lang="en">{eyebrow}</p><h2>{heading}</h2></div>;
}

export default function Home() {
  const contactLinks = [
    { label: "GitHub", href: externalUrl(site.contact.github) },
    { label: "X", href: externalUrl(site.contact.x) },
    { label: "Email", href: emailUrl(site.contact.email) },
  ].filter((link) => link.href);

  return (
    <div className="shell">
      <section id="about" aria-labelledby="intro-title" className="intro section">
        <div>
          <p className="eyebrow" lang="en">{site.introduction.eyebrow}</p>
          <h1 id="intro-title">{site.introduction.heading}</h1>
          <div className="intro-copy space-y-4">
            {site.introduction.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
        <aside aria-label={site.introduction.interestsLabel} className="interests">
          <p className="small-label">{site.introduction.interestsLabel}</p>
          <ul>{site.introduction.interests.map((interest) => <li key={interest}>{interest}</li>)}</ul>
        </aside>
      </section>

      <section id="projects" aria-label={site.projects.eyebrow} className="section">
        <SectionHeading {...site.projects} />
        <p className="section-description">{site.projects.description}</p>
        <div className="project-grid grid gap-5 md:grid-cols-3">
          {site.projects.items.map((project) => {
            const href = externalUrl(project.url);
            return (
              <article key={project.title} className="project-card">
                <span className={`status status-${project.status.toLowerCase()}`} lang="en">{project.status}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <ul aria-label="项目主题" className="tags">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                {href && <a href={href} className="text-link" target="_blank" rel="noopener noreferrer">{site.projects.linkLabel}<span className="sr-only">（在新标签页打开）</span></a>}
              </article>
            );
          })}
        </div>
      </section>

      <section id="learning" aria-label={site.learning.eyebrow} className="section learning-section">
        <SectionHeading {...site.learning} />
        <ul className="learning-list">
          {site.learning.items.map((item, index) => (
            <li key={item.title}>
              <span className="learning-number" aria-hidden="true">0{index + 1}</span>
              <div><h3>{item.title}</h3><p>{item.description}</p></div>
            </li>
          ))}
        </ul>
      </section>

      <section id="notes" aria-label={site.notes.eyebrow} className="section">
        <SectionHeading {...site.notes} />
        {site.notes.items.length ? (
          <ul className="notes-list">
            {site.notes.items.map((note) => (
              <li key={note.slug}>
                <div className="note-meta"><time dateTime={note.date}>{note.date}</time><span>{note.topic}</span></div>
                <h3><Link href={`/notes/${note.slug}`} className="text-link">{note.title}</Link></h3>
                <p>{note.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="notes-empty"><h3>{site.notes.emptyTitle}</h3><p>{site.notes.emptyDescription}</p></div>
        )}
      </section>

      <section id="contact" aria-label={site.contact.eyebrow} className="section contact-section">
        <SectionHeading {...site.contact} />
        <div><p>{site.contact.description}</p>
          {contactLinks.length ? <ul className="contact-links">{contactLinks.map((link) => <li key={link.label}><a className="text-link" href={link.href}>{link.label}</a></li>)}</ul> : <p className="contact-empty">{site.contact.emptyDescription}</p>}
        </div>
      </section>
    </div>
  );
}
