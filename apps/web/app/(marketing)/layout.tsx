import type { ReactNode } from 'react';
import { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnnouncementBar from '@/components/AnnouncementBar';
import StickyCTA from '@/components/StickyCTA';

export const metadata: Metadata = {
  title: 'Trades',
};
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      <Footer />
      <StickyCTA />
    </>
  );
}
