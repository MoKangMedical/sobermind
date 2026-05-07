import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "人间清醒 | SoberMind — 每日一课，清醒一生",
  description: "把人生哲学变成实际行动。每天十分钟，用古老的智慧和现代的方法，清醒地过好这一生。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased min-h-screen bg-[#FAF7F0] text-ink">
        {children}
      </body>
    </html>
  );
}
