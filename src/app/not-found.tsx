import Link from "next/link";

export default function NotFound() {
  return <div className="shell article-page"><p className="eyebrow">404</p><h1>这一页还不存在。</h1><p>地址可能有误，或内容尚未发布。</p><Link className="text-link" href="/">返回首页</Link></div>;
}
