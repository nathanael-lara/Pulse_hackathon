import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VisitFlow iPhone',
  description: 'Mobile-first cardiac care companion optimized for iPhone.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
