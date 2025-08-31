import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { fetchTheme } from '@/lib/cms';
import type { ReactNode } from 'react';
import { env } from '@trades/utils';
import { baseMetadata, ldLocalBusiness, ldWebSite } from '@/lib/seo';
import { getSiteConfig } from '@/lib/cms';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = baseMetadata();

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const theme = await fetchTheme();
  const cfg = await getSiteConfig();
  const cmsOrigin = new URL(env.CMS_BASE_URL).origin;
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
      <head>
        <link rel="preconnect" href={cmsOrigin} crossOrigin="" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              ldWebSite(),
              ldLocalBusiness({
                name: 'Your Trade Partner',
                phone: cfg?.phone,
                email: cfg?.email,
                address: cfg?.address,
              }),
            ]),
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={style}>
        {children}
      </body>
    </html>
  );
}
