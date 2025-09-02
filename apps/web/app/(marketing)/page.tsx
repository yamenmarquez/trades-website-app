import {
  getSiteConfig,
  fetchServices,
  fetchTestimonials,
  fetchGeoAreas,
  fetchProjects,
} from '@/lib/cms';
import type { Service, Testimonial } from '@trades/schemas';
import type { GeoArea } from '@/lib/cms';
import Link from 'next/link';
import { Prose } from '@/components';
import Image from 'next/image';
const IS_DEV = (() => {
  const g = globalThis as unknown as { process?: { env?: { NODE_ENV?: string } } };
  return g.process?.env?.NODE_ENV !== 'production';
})();

// Lightweight implementations for demo sections
function Hero({ phone }: { phone?: string }) {
  return (
    <section className="gradient-brand text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Professional Trades Services</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Quality craftsmanship, reliable service, and exceptional results for all your project
          needs.
        </p>
        <div className="space-x-4">
          <Link href="/contact" className="btn-contrast hover:bg-gray-100">
            Get Free Quote
          </Link>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="border-2 border-white text-white px-6 py-2 rounded-2xl font-medium hover:bg-white hover:text-primary transition-colors"
            >
              Call {phone}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div className="card">
          <h3 className="font-semibold mb-2">Skilled Pros</h3>
          <p>Experienced technicians you can trust.</p>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Fair Pricing</h3>
          <p>Transparent quotes with no surprises.</p>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Fast Turnaround</h3>
          <p>On-time and on-budget delivery.</p>
        </div>
      </div>
    </section>
  );
}

async function ServicesGrid() {
  const services = (await fetchServices()) as (Service & { description_html?: string })[];
  return (
    <section className="py-16" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.slice(0, 6).map((service) => (
            <div key={service.id} className="card">
              <h3 className="text-xl font-semibold mb-3">{service.name}</h3>
              <div className="text-neutral-600 line-clamp-3 mb-4">
                <Prose html={service.description_html || ''} />
              </div>
              <Link href={`/services/${service.slug}`} className="btn-primary">
                Learn More
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/services" className="btn-primary">
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}

async function ReviewsCarousel() {
  const testimonials = await fetchTestimonials();
  if (!testimonials.length) return null;
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.slice(0, 3).map((t: Testimonial) => (
            <div key={t.id} className="card">
              <div className="text-yellow-400 text-xl mb-2">
                {'\u2605'.repeat(t.rating)}
                {'\u2606'.repeat(5 - t.rating)}
              </div>
              <p className="text-neutral-700 mb-3">“{t.text}”</p>
              <p className="font-semibold">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function PortfolioStrip() {
  const projects = await fetchProjects();
  if (!projects.length) return null;
  const items = projects.slice(0, 6);
  return (
    <section className="py-16" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Recent Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((p) => (
            <Link key={p.slug} href={`/portfolio/${p.slug}`} className="block group">
              <div className="rounded-xl overflow-hidden border aspect-[4/3] bg-neutral-100">
                {p.images[0] && (
                  <Image
                    src={p.images[0].url}
                    alt={p.images[0].alt || p.title}
                    fill
                    sizes="(min-width:1280px) 33vw, (min-width:768px) 50vw, 100vw"
                    unoptimized={IS_DEV}
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                )}
              </div>
              <div className="mt-3 text-sm font-medium">{p.title}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

async function AreasStrip() {
  const cities = await fetchGeoAreas({ type: 'city' });
  if (!cities.length) return null;
  return (
    <section className="py-12 border-t">
      <div className="container mx-auto px-4">
        <h3 className="text-xl font-semibold mb-4">Serving These Areas</h3>
        <div className="flex flex-wrap gap-3">
          {cities.slice(0, 12).map((c: GeoArea) => (
            <Link key={c.slug} href={`/areas/${c.slug}`} className="chip">
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrimaryCTA() {
  return (
    <section className="bg-primary text-white py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
        <p className="text-xl mb-8">Contact us today for a free consultation and quote.</p>
        <Link href="/contact" className="btn-contrast hover:bg-gray-100">
          Get Started
        </Link>
      </div>
    </section>
  );
}

export default async function MarketingHome() {
  const cfg = await getSiteConfig();
  return (
    <main className="min-h-screen">
      <Hero phone={cfg.phone} />
      <WhyUs />
      {/* ServicesGrid renders description_html via Prose */}
      <ServicesGrid />
      <ReviewsCarousel />
      <PortfolioStrip />
      <AreasStrip />
      <PrimaryCTA />
    </main>
  );
}
