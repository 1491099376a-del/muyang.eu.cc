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
    slug: "dropship-order-assistant",
    problem: "跨系统处理订单时，导出文件、对应关系、生成模板和结果核对容易变成重复操作；如果数据对应错误，还可能产生错误的发货文件。",
    solution: "开发 Windows 本地辅助流程，使用浏览器自动化获取文件，预先检查字段，再调用现有桌面工具生成模板，最后独立核对输出结果。",
    highlights: [
      "对源文件和模板执行字段检查与关联校验，不合格批次停止处理。",
      "记录批次状态；重复运行优先复用已验证结果，避免意外重复生成。",
      "本地模板生成与独立校验有测试记录；只读报价比较功能仍需要实际业务场景进一步验收。",
      "不包含自动向物流平台提交订单的功能。",
    ],
    lessons: [
      "把文件处理、桌面交互和校验拆开，比单纯模拟鼠标点击更容易排查和恢复。",
      "清晰区分本地校验成功和真实业务操作成功，避免扩大自动化的实际能力描述。",
    ],
  },
  {
    slug: "daily-report-automation",
    problem: "每天从不同后台导出、整理并更新多个在线工作表，步骤重复且容易错填日期、列或历史记录。",
    solution: "用 Playwright 驱动已授权的浏览器完成导出，Python 做字段映射与校验，再通过 WPS AirScript 将处理结果写入指定在线表格并回读核对。",
    highlights: [
      "将数据导出、处理、写入和核验拆成独立步骤。",
      "按工作表需要分别采用覆盖或追加模式，尽量避免重复日期和覆盖历史记录。",
      "保留日志、错误状态与恢复路径；登录失效或数据不符合规则时停止并要求人工处理。",
      "依赖本地 Windows 环境和有效的业务系统授权，并非可直接公开运行的网页应用。",
    ],
    lessons: [
      "自动化的价值不仅在于少点鼠标，更在于写入前的规则校验和写入后的回读核对。",
    ],
  },
  {
    slug: "amazon-competitor-tracker",
    problem: "定期记录多个商品的价格与排名需要逐一核对产品标识、日期和不同工作表结构。",
    solution: "编写 Python 脚本，根据 ASIN 定位目标数据区域，尝试从公开商品页面获取信息，并将结果按日期整理回 Excel 工作簿。",
    highlights: [
      "支持预检查和 dry-run，先验证将要修改的工作表与日期列。",
      "按 ASIN 和表头匹配数据区域；新增日期或更新已存在的日期列。",
      "修改前创建备份，抓取失败时保留空值及日志，不将失败当作有效数据。",
      "读取公开页面可能受到站点访问限制，实际可用性取决于数据源，属于原型实践。",
    ],
    lessons: [
      "面对复杂的现有 Excel 文件，必须考虑图片、格式与历史数据的保留。",
      "将数据采集与表格写入分离，可以降低后续更换合法数据源的成本。",
    ],
  },

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
