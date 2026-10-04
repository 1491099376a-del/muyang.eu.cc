export type ProjectStatus = "Building" | "Prototype" | "Exploring";

export type Project = {
  title: string;
  description: string;
  status: ProjectStatus;
  tags: string[];
  url: string;
};

export type Note = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO 日期：YYYY-MM-DD。只填写真实的发布日期。
  topic: string;
  paragraphs: string[];
};

// 个人资料、首页文案、项目和文章都在这里修改。
// Muyang 暂取自域名，请替换成你希望公开展示的名字。
export const site = {
  url: "https://muyang.eu.cc",
  name: "Muyang",
  title: "Muyang · 实践与学习笔记",
  description:
    "Muyang 的个人主页，记录 Amazon 运营、AI、自动化、Agent 与 MCP 的探索，以及英语输出、结构化表达和商业与财务学习。",
  language: "zh-CN",
  navigation: [
    { label: "介绍", href: "#about" },
    { label: "项目", href: "#projects" },
    { label: "学习", href: "#learning" },
    { label: "笔记", href: "#notes" },
    { label: "联系", href: "#contact" },
  ],
  introduction: {
    eyebrow: "Personal Introduction",
    heading: "把想法，逐步变成实践。",
    paragraphs: [
      "我关注 Amazon 运营、AI 与自动化，探索如何用 Codex、Agent 和 MCP 将想法落实为可用的工具。",
      "这里是我的长期个人主页，用来记录项目探索、持续学习和思考，也给尚未完成的尝试留一个位置。",
    ],
    interests: ["Amazon 运营", "AI 与自动化", "Codex / Agent / MCP", "Vibe Coding"],
    interestsLabel: "关注的方向",
  },
  projects: {
    eyebrow: "Projects",
    heading: "从问题出发，持续探索。",
    description: "以下是准备探索的项目方向，尚无公开成果。",
    linkLabel: "查看项目",
    items: [
      {
        title: "Amazon 运营与自动化",
        description: "探索将重复的运营工作整理为清晰、可复用的流程。",
        status: "Exploring",
        tags: ["Amazon", "自动化"],
        url: "",
      },
      {
        title: "Agent 与工具协作",
        description: "探索 Codex、Agent 和 MCP 的协作方式，以及 Vibe Coding 的实际应用。",
        status: "Exploring",
        tags: ["Codex", "Agent", "MCP"],
        url: "",
      },
      {
        title: "英语输出与表达",
        description: "探索让英语输出训练与结构化表达融入日常练习的方法。",
        status: "Exploring",
        tags: ["英语", "结构化表达"],
        url: "",
      },
    ] satisfies Project[],
  },
  learning: {
    eyebrow: "Currently Learning",
    heading: "保持学习，也练习输出。",
    items: [
      { title: "AI 与工具实践", description: "Codex、Agent、MCP、自动化与 Vibe Coding。" },
      { title: "语言与表达", description: "英语输出训练，把思考组织成清楚的表达。" },
      { title: "商业与财务", description: "学习商业与财务知识，建立理解业务的基础。" },
    ],
  },
  notes: {
    eyebrow: "Blog / Notes",
    heading: "给思考留下记录。",
    emptyTitle: "第一篇笔记，正在酝酿。",
    emptyDescription: "这里将记录实践中的发现、学习笔记和阶段性思考。",
    backLabel: "返回首页笔记",
    items: [] as Note[],
  },
  contact: {
    eyebrow: "Contact",
    heading: "从一个共同的问题开始。",
    description: "关于 Amazon 运营、AI、自动化或学习与表达，期待交流。",
    emptyDescription: "联系方式尚未公开。",
    github: "",
    x: "",
    email: "",
  },
  footer: "持续实践，持续记录。",
};
