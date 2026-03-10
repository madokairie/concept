import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ローンチコンセプト設計ツール",
  description: "完成型ファースト × 3素材収集 × 評価ループ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-[#0D0D0D] text-[#E8E0D5]">
        {children}
      </body>
    </html>
  );
}
