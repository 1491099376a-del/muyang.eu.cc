# Muyang 个人网站

极简个人主页，使用 Next.js App Router、TypeScript 和 Tailwind CSS，可直接部署到 Vercel。内容以实践与长期学习为中心。

## 先了解项目

- 首页包含 Personal Introduction、Projects、Currently Learning、Blog / Notes 和 Contact。
- 个人文案、项目、文章、联系方式集中在 `src/data/site.ts`。
- 项目目前是 **Exploring 探索方向**，不代表已经完成；没有虚构项目成果或文章。
- 显示名 `Muyang` 暂取自域名，请改成你希望公开的名字。
- GitHub、X、Email 和项目地址默认留空，不显示链接。格式无效的外部地址也不会显示。
- 主题支持跟随系统、浅色、深色，保存于当前浏览器；没有头像或外部字体请求。

## 1. 本地启动

先安装 Node.js 的受支持 LTS 版本（至少 20.9），然后在 PowerShell 输入：

```powershell
cd 'D:\project site'
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`。如果终端显示其他端口，以终端输出为准。保存文件后，页面通常会自动更新。停止服务按 `Ctrl+C`。

发布前检查：

```powershell
npm run lint
npm run build
```

查看正式构建：

```powershell
npm run start
```

`start` 需要先成功执行 `build`。Next.js 16 的构建不会自动执行 lint，因此两项都要运行。

## 2. 修改个人资料

打开 `src/data/site.ts`，修改 `name`、`title`、`description` 和 `introduction`。`learning.items` 是正在学习的内容。

联系方式在 `contact` 中：

```ts
github: "", // 填你的真实 GitHub 完整地址：https://github.com/...
x: "",      // 填你的真实 X 完整地址：https://x.com/...
email: "",  // 仅填邮箱地址，不加 mailto:
```

没有要公开的信息，就保持空字符串。不要填 `#` 或临时占位地址。`url` 已设为 `https://muyang.eu.cc`；它用于 SEO，并不会自动完成域名绑定。

## 3. 添加项目

在 `projects.items` 数组中添加一个对象，或将现有探索方向替换为你的真实项目：

```ts
{
  title: "你实际在做的项目名称",
  description: "如实说明项目用途与当前阶段。",
  status: "Building",
  tags: ["自动化", "AI"],
  url: "",
},
```

状态可选 `Building`（正在构建）、`Prototype`（原型）、`Exploring`（探索）。地址为空时只显示内容；填写完整的 `https://...` 地址才会显示“查看项目”。默认三个条目只是方向占位，请按照实际情况更新。

如果项目状态变化，也要更新 `projects.description`，避免首页继续写“尚无公开成果”。

## 4. 添加文章

`notes.items` 默认是空数组。将 `items: [] as Note[]` 改成：

```ts
items: [
  {
    slug: "my-first-note",
    title: "你的真实文章标题",
    description: "用一两句话介绍这篇文章。",
    date: "2026-10-04", // 改为真实发布日期
    topic: "学习笔记",
    paragraphs: [
      "第一段正文。",
      "第二段正文。",
    ],
  },
] as Note[],
```

示例仅用于说明格式，不是已发布内容。`slug` 使用唯一的小写英文、数字和短横线，不包含空格或斜杠。日期使用 `YYYY-MM-DD`。正文目前是纯文本段落，不解析 Markdown 或 HTML。

保存后首页会显示文章入口，详情页地址为 `/notes/my-first-note`。每次添加文章后重新构建并部署，文章详情页和 sitemap 会一起更新。未配置的文章地址返回 404。

## 5. 上传 GitHub

Git 已初始化，默认分支为 `main`。先登录 GitHub，创建一个空仓库，**不要勾选生成 README、.gitignore 或 license**。

然后在 PowerShell 执行：

```powershell
cd 'D:\project site'
git add .
git commit -m "Create Muyang personal website"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

请把示例 URL 替换为你自己的真实仓库地址。首次提交如果提示身份未设置，可以先执行（填真实资料）：

```powershell
git config user.name "你的提交显示名"
git config user.email "你的提交邮箱或 GitHub noreply 邮箱"
```

然后再运行 `git commit`。GitHub 登录使用浏览器或 Git Credential Manager；不要把密码或访问令牌写进代码。个人网站显示的 GitHub 链接仍需在 `site.ts` 单独填写。

## 6. 部署 Vercel

1. 登录 [Vercel](https://vercel.com)，选择 Add New → Project，导入刚刚的 GitHub 仓库。
2. Framework Preset 选择 **Next.js**；Root Directory 保持仓库根目录（`.`）。
3. Install Command 使用 `npm install`，Build Command 使用 `npm run build`，Output Directory 保持 Next.js 默认设置，不要改成 `dist`。
4. 选择受 Vercel 支持、符合本项目要求的 Node.js LTS 版本。本项目不需要环境变量。
5. 点击 Deploy。成功后先打开 Vercel 提供的 `vercel.app` 地址检查页面。

后续修改并推送 `main`，Vercel 会自动创建新的生产部署。可参照 [Vercel 的 Next.js 文档](https://vercel.com/docs/frameworks/full-stack/nextjs)。本项目没有自动创建 GitHub 仓库，也没有执行线上部署。

## 7. 绑定 muyang.eu.cc

1. 打开 Vercel 项目 → Settings → Domains，添加 `muyang.eu.cc`。
2. 打开你管理 `eu.cc` 或该子域名的 DNS 控制台，按 **Vercel 当前页面提供的记录**配置。若管理的是 `eu.cc` 区域，主机名通常填写 `muyang`；若平台要求完整名称，则填 `muyang.eu.cc`。目标值以 Vercel 实际显示为准，不要照抄别人的 IP 或 CNAME。
3. 如果 Vercel 要求验证域名所有权，添加它给出的 TXT 记录。不要删除无关的邮件或其他子域名记录。
4. 等待 Vercel 显示有效配置和 HTTPS 证书已签发，再访问 `https://muyang.eu.cc`。

绑定前需要你拥有该域名的 DNS 修改权限。操作可参照 [Vercel 自定义域名说明](https://vercel.com/docs/domains/working-with-domains/add-a-domain)。

域名生效后检查 `/robots.txt`、`/sitemap.xml`，以及页面源代码中的 canonical 和 Open Graph URL 是否指向 `https://muyang.eu.cc`。

## 主要文件

```text
src/
  data/site.ts                 个人资料、文案、项目、学习方向、文章
  lib/links.ts                 外部链接与邮箱格式检查
  components/                 页头、页脚、主题选择器
  app/
    layout.tsx                 文档语言、全局布局与基础 metadata
    page.tsx                   首页五个区块
    globals.css                颜色、排版与响应式样式
    notes/[slug]/page.tsx       数据驱动的文章页与文章 metadata
    not-found.tsx              404 页面
    robots.ts                  搜索引擎抓取规则
    sitemap.ts                 首页和已配置文章的站点地图
    icon.svg                   字母标记，不是真实头像
```

## 技术与范围

- 原生主题选择器可用键盘操作；首页有跳过导航入口、语义化区块和可见焦点。
- 深浅色均使用明确的文字、边框、背景色；默认没有动画、渐变或外部图片。
- Tailwind CSS 4 使用 PostCSS 插件，无需旧版 `tailwind.config.js`。
- Open Graph 包含标题、描述、类型、语言和 URL。暂未配置分享图片，避免放入未经确认的个人图片。
- 不含后台、登录、统计、联系表单或 CMS。内容修改通过数据文件和 Git 部署完成。
- `.gitignore` 排除了依赖、构建目录、本地环境变量和 Vercel 本地配置；请保留 `package-lock.json`，方便稳定安装。
