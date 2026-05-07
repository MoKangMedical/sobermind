/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // GitHub Pages 部署路径（如果用 custom domain 则不需要）
  basePath: '/sobermind',
  images: { unoptimized: true },
};

export default nextConfig;
