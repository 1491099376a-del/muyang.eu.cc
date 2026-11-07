import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/data/site";
import { projectDetails } from "@/data/project-details";
import { externalUrl } from "@/lib/links";

export const metadata: Metadata = {
  title: "项目作品集",
  description: "记录已经做出的工具、实践过程，以及尚在探索的方向。",
  alternates: { canonical: `${site.url}/projects` },
};

export default function ProjectsPage() {
  const published = site.projects.items.filter((item) =>
    projectDetails.some((detail) => detail.slug === item.slug),
  );
  const exploring = site.projects.items.filter((item) =>
    !projectDetails.some((detail) => detail.slug === item.slug),
  );

  return (
    <div className="shell showcase-page">
      <p className="eyebrow" lang="en">Selected Work</p>
      <h1>项目与实践</h1>
      <p className="showcase-lead">把真实问题转化为可以使用的小工具。这里主要记录项目的功能、解决的问题和实践过程。</p>

      <section className="showcase-section" aria-labelledby="published-projects">
        <div className="showcase-section-heading">
          <h2 id="published-projects">已有实践</h2>
          <p>仅展示能够确认的功能，不使用虚构的数据或成果。</p>
        </div>
        <div className="project-grid grid gap-5 md:grid-cols-2">
          {published.map((project) => (
            <article key={project.title} className="project-card">
              <span className={`status status-${project.status.toLowerCase()}`} lang="en">{project.status}</span>
              <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3>
              <p>{project.description}</p>
              <ul aria-label="项目技术与主题" className="tags">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              <Link className="text-link" href={`/projects/${project.slug}`}>查看项目详情</Link>
            </article>
          ))}
        </div>
      </section>

      {exploring.length > 0 && (
        <section className="showcase-section" aria-labelledby="exploring-projects">
          <div className="showcase-section-heading">
            <h2 id="exploring-projects">探索方向</h2>
            <p>以下是正在关注的主题，不代表已有可以使用的成品。</p>
          </div>
          <div className="project-grid grid gap-5 md:grid-cols-2">
            {exploring.map((project) => (
              <article key={project.title} className="project-card">
                <span className={`status status-${project.status.toLowerCase()}`} lang="en">{project.status}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <ul aria-label="项目主题" className="tags">{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                {externalUrl(project.url) && <a className="text-link" href={externalUrl(project.url)} rel="noopener noreferrer" target="_blank">查看外部链接</a>}
              </article>
            ))}
          </div>
        </section>
      )}
      <p className="showcase-back"><Link href="/" className="text-link">返回首页</Link></p>
    </div>
  );
}
