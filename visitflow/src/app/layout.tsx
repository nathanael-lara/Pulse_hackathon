import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://corvas.app'),
  title: 'CorVas',
  description: 'A calm, voice-friendly cardiac recovery companion built as a senior-friendly progressive web app.',
  applicationName: 'CorVas',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CorVas',
  },
  formatDetection: {
    telephone: true,
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#eff7f4',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      style={{
        ['--font-sans' as string]: '"Avenir Next", "Aptos", "Trebuchet MS", "Segoe UI", sans-serif',
        ['--font-mono' as string]: '"SFMono-Regular", "Menlo", "Monaco", monospace',
      }}
    >
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
