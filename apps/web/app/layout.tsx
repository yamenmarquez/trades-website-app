import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { fetchTheme } from '@/lib/cms';
import type { ReactNode } from 'react';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Trades Website',
  description: 'Professional trades and services',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const theme = await fetchTheme();
  const style = {
    '--color-primary': theme?.brand_color ?? '#0ea5e9',
    '--color-accent': theme?.accent ?? '#22c55e',
    '--color-neutral': theme?.neutral ?? '#0f172a',
    '--radius': theme?.radius ?? '1rem',
    '--font-heading': theme?.font_heading ?? 'var(--font-geist-sans)',
    '--font-body': theme?.font_body ?? 'var(--font-geist-sans)',
  } as React.CSSProperties;

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={style}>
        {children}
      </body>
    </html>
  );
}
