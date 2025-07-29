import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/heroui/providers";
import ThemeInitializer from "@/components/theme/ThemeInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "K线回放系统",
  description: "专业的K线数据回放和分析系统",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            /* 防止初始闪烁的内联样式 */
            html { 
              background-color: #ffffff; 
              color: #000000;
              transition: none !important;
            }
            html.dark { 
              background-color: #0f172a; 
              color: #ffffff;
            }
            * { 
              transition: none !important; 
            }
          `
        }} />
      </head>
      <body className={`${inter.className} min-h-screen bg-surface text-primary will-change-theme`}>
        <Providers>
          <ThemeInitializer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
