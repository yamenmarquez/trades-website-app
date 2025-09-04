'use client';

import Link from 'next/link';
import { useState } from 'react';

const NAV = [
  { href: '/services', label: 'Services' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/areas', label: 'Areas' },
];

export function Header({ theme }: { theme?: { phone?: string; whatsapp?: string; gbp?: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex items-center justify-between max-w-7xl px-4 sm:px-6 lg:px-8 h-16">
        <Link href="/" className="font-semibold text-lg">
          Trades
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-[var(--color-primary)]">
              {n.label}
            </Link>
          ))}

          {theme?.phone && (
            <a
              href={`tel:${theme.phone}`}
              className="text-sm text-neutral-700 hover:text-[var(--color-primary)]"
            >
              {theme.phone}
            </a>
          )}

          <Link
            href="/contact"
            className="inline-flex items-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-white hover:opacity-90"
          >
            Contact
          </Link>
        </nav>

        <button
          className="md:hidden rounded p-2 border"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-neutral-200">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
            {theme?.phone && (
              <a href={`tel:${theme.phone}`} onClick={() => setOpen(false)}>
                {theme.phone}
              </a>
            )}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="inline-flex w-fit items-center rounded-full bg-[var(--color-primary)] px-4 py-2 text-white hover:opacity-90"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
