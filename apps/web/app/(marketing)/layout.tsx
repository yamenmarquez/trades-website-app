import type { Metadata } from 'next';
import '../globals.css';
import { AnnouncementBar } from '../../src/components/AnnouncementBar';
import { Header } from '../../src/components/Header';
import { Footer } from '../../src/components/Footer';
import { StickyCTA } from '../../src/components/StickyCTA';
import { getSiteConfig } from '../../src/lib/cms';

export const metadata: Metadata = {
  title: 'Trades',
  description: 'Professional trades services',
};

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  // Obtener theme desde CMS
  const cfg = await getSiteConfig().catch(() => null);

  // Inyectar CSS vars de brand si existen
  const style = cfg
    ? {
        ['--color-primary' as string]: cfg.primary || '#0ea5e9',
        ['--color-accent' as string]: cfg.accent || '#16a34a',
      }
    : undefined;

  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-neutral-900 antialiased" style={style}>
        <AnnouncementBar />
        <Header theme={{ phone: cfg?.phone, whatsapp: cfg?.whatsapp, gbp: cfg?.gbp_url }} />
        <main>{children}</main>
        <Footer theme={{ phone: cfg?.phone, whatsapp: cfg?.whatsapp, gbp: cfg?.gbp_url }} />
        <StickyCTA />
      </body>
    </html>
  );
}
