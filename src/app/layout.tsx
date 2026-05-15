import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "清醒研究院 | SoberMind — 建立你的生命操作系统",
  description: "402 节系统日课，把哲学、心理学、行动练习和复盘打卡连接成长期成长闭环。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen bg-cream text-ink">
        {children}
      </body>
    </html>
  );
}
