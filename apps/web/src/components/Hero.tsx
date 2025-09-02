import Link from 'next/link';
export function Hero() {
  return (
    <section className="bg-hero-glass text-white">
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Professional Trades Services</h1>
        <p className="max-w-2xl mx-auto text-white/90">
          Quality craftsmanship, reliable service, and exceptional results for all your project
          needs.
        </p>
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/contact" className="px-4 py-2 rounded bg-white text-slate-900">
            Get Free Quote
          </Link>
          <Link href="/portfolio" className="px-4 py-2 rounded border border-white/70">
            View Our Work
          </Link>
        </div>
      </div>
    </section>
  );
}
