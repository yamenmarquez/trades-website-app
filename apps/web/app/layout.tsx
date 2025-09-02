import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Trades',
  description: 'Professional trades services',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
