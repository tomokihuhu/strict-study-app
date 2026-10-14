import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// 💡追加: 先ほど作った Providers を読み込む
import { Providers } from "./Providers"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Strict Study App",
  description: "ストイックな学習タイマー",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {/* 💡追加: アプリ全体を Providers で包み込む */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}