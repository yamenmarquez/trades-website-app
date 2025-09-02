'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        aria-label="Open menu"
        aria-expanded={open}
        className="md:hidden btn-ghost"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            className="ml-auto w-80 h-full bg-white p-6 shadow-xl flex flex-col gap-4"
          >
            <button className="self-end" aria-label="Close" onClick={() => setOpen(false)}>
              ✕
            </button>
            <Link href="/services" className="py-2" onClick={() => setOpen(false)}>
              Services
            </Link>
            <Link href="/portfolio" className="py-2" onClick={() => setOpen(false)}>
              Portfolio
            </Link>
            <Link href="/reviews" className="py-2" onClick={() => setOpen(false)}>
              Reviews
            </Link>
            <Link href="/areas" className="py-2" onClick={() => setOpen(false)}>
              Areas
            </Link>
            <Link href="/contact" className="btn-primary" onClick={() => setOpen(false)}>
              Contact
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
