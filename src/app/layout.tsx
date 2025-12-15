import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "../components/Layout/Header";
import ChatWidget from "../components/Chat/ChatWidget";
import { theme } from "../lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Locker System",
  description: "Secure and Easy Locker Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ margin: 0, padding: 0, background: theme.white, color: theme.text }}>
        <Providers>
          <Header />
          <main style={{ minHeight: 'calc(100vh - 80px)', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            {children}
          </main>
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
