import Link from 'next/link';
import MobileNav from '@/components/MobileNav';

export default function Header() {
  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold">
          Trades
        </Link>
        <MobileNav />
        <nav className="hidden md:flex gap-6 text-sm">
          <Link href="/services" className="hover:underline">
            Services
          </Link>
          <Link href="/portfolio" className="hover:underline">
            Portfolio
          </Link>
          <Link href="/reviews" className="hover:underline">
            Reviews
          </Link>
          <Link href="/areas" className="hover:underline">
            Areas
          </Link>
          <Link href="/contact" className="btn-primary btn-sm">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}
