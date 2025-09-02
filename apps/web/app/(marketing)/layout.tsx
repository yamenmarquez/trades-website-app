import type { ReactNode } from 'react';
import { AnnouncementBar, Header, Footer, StickyCTA } from '@/components';
import { getSiteConfig } from '@/lib/cms';

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const cfg = await getSiteConfig();
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>{children}</main>
      <Footer />
      <StickyCTA phone={cfg?.phone} />
    </>
  );
}
