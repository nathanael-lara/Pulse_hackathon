import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CorVas AI — Real-Time Cardiac Care",
  description: "AI-powered cardiac care co-pilot. Before, during, and after every visit.",
  keywords: ["cardiac rehab", "heart health", "AI health", "doctor visit"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={{
        ["--font-sans" as string]: '"Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
        ["--font-geist-mono" as string]: '"SFMono-Regular", "Menlo", "Monaco", "Courier New", monospace',
      }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
