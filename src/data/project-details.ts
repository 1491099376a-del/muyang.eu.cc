/**
 * 只在这里记录经过核实的项目事实。新增项目时：
 * 1. 在 site.projects.items 增加 slug、名称、简介、状态和标签。
 * 2. 在这里增加对应 slug 的介绍；不要填写公司机密或真实订单数据。
 * 3. 图片放在 public/projects/<slug>/ 下，路径填 /projects/<slug>/xxx.webp。
 */
export type ProjectDetail = {
  slug: string;
  problem: string;
  solution: string;
  highlights: string[];
  lessons?: string[];
  images?: { src: string; alt: string }[];
  repositoryUrl?: string;
};

export const projectDetails: ProjectDetail[] = [
  {
    slug: "gym-training-log",
    problem: "训练记录分散时，不容易快速查看动作、重量和次数的历史变化。",
    solution: "用一个轻量的浏览器工具记录训练数据，并查看自己的训练历史。",
    highlights: [
      "记录训练动作、重量与次数。",
      "可查看历史记录。",
      "目前数据保存在当前浏览器，暂不支持跨设备同步。",
    ],
  },
];
