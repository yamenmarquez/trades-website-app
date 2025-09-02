import Link from 'next/link';
export function PrimaryCTA() {
  return (
    <section className="py-16 bg-sky-600 text-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h3 className="text-2xl md:text-3xl font-bold mb-2">Ready to Start Your Project?</h3>
        <p className="opacity-90">Contact us today for a free consultation and quote.</p>
        <Link
          href="/contact"
          className="inline-block mt-6 px-4 py-2 rounded bg-white text-slate-900"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}
