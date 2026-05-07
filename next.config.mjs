/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 部署无需特殊配置
  // SQLite 数据库文件需持久化（Vercel 免费层 /tmp 可写但不持久）
  // 生产环境建议迁移至 Turso / Neon / Supabase
};

export default nextConfig;
