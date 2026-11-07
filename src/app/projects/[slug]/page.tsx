import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projectDetails } from "@/data/project-details";
import { site } from "@/data/site";
import { externalUrl } from "@/lib/links";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const dynamic = "force-static";

export function generateStaticParams() {
  return projectDetails.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = site.projects.items.find((item) => item.slug === slug);
  const detail = projectDetails.find((item) => item.slug === slug);
  if (!project || !detail) notFound();
  const url = `${site.url}/projects/${slug}`;
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: url },
    openGraph: { title: project.title, description: project.description, url },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = site.projects.items.find((item) => item.slug === slug);
  const detail = projectDetails.find((item) => item.slug === slug);
  if (!project || !detail) notFound();

  return (
    <article className="shell article-page project-detail">
      <Link href="/projects" className="text-link">返回项目列表</Link>
      <header>
        <p className="eyebrow" lang="en">Project / {project.status}</p>
        <h1>{project.title}</h1>
        <p className="article-description">{project.description}</p>
        <ul aria-label="项目技术与主题" className="tags project-detail-tags">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
      </header>
      <section className="project-detail-section">
        <h2>解决的问题</h2>
        <p>{detail.problem}</p>
      </section>
      <section className="project-detail-section">
        <h2>实现方式</h2>
        <p>{detail.solution}</p>
      </section>
      <section className="project-detail-section">
        <h2>目前功能</h2>
        <ul className="project-detail-list">{detail.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
      </section>
      {!!detail.lessons?.length && (
        <section className="project-detail-section">
          <h2>实践收获</h2>
          <ul className="project-detail-list">{detail.lessons.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      )}
      {!!detail.images?.length && (
        <section className="project-detail-section">
          <h2>项目截图</h2>
          <div className="project-screenshots">{detail.images.map(({ src, alt }) => (
            <Image key={src} src={src} alt={alt} width={1200} height={750} className="project-screenshot" />
          ))}</div>
        </section>
      )}
      <div className="project-detail-links">
        {externalUrl(project.url) && <a className="text-link" href={externalUrl(project.url)} rel="noopener noreferrer" target="_blank">体验项目（新标签页）</a>}
        {externalUrl(detail.repositoryUrl || "") && <a className="text-link" href={externalUrl(detail.repositoryUrl || "")} rel="noopener noreferrer" target="_blank">查看代码（新标签页）</a>}
      </div>
    </article>
  );
}
