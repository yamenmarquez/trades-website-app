import Link from 'next/link';
import { fetchServices, fetchProjects, fetchGeoAreas } from '@/lib/cms';
import { fetchTestimonials } from '@/lib/cms';
import Prose from '@/components/Prose';
import MasonryWithLightbox from '@/components/MasonryWithLightbox';
import type { Service, Project } from '@trades/schemas';
import type { GeoArea, Testimonial } from '@/lib/cms';

export const dynamic = 'force-static';

export default async function HomePage() {
  const [services, projects, areas, reviews] = await Promise.all([
    fetchServices?.() ?? [],
    fetchProjects?.() ?? [],
    fetchGeoAreas?.({ type: 'city' }) ?? [],
    fetchTestimonials(6),
  ]);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="rounded-3xl bg-gradient-to-r from-sky-500 to-emerald-500 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Professional Trades Services
          </h1>
          <p className="mt-3 max-w-2xl text-lg opacity-90">
            Quality craftsmanship, reliable service, and exceptional results for all your project
            needs.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/contact" className="rounded-xl bg-white px-4 py-2 text-sky-700 shadow">
              Get Free Quote
            </Link>
            <Link href="/portfolio" className="rounded-xl border border-white/80 px-4 py-2">
              View Our Work
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Our Services</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(services as Service[]).map((s) => (
            <article key={s.id} className="card">
              <h3 className="font-semibold">{s.name}</h3>
              {s.description_html && (
                <Prose html={s.description_html} className="line-clamp-3 mt-2 text-sm" />
              )}
              <div className="mt-4">
                <Link href={`/services/${s.slug}`} className="btn btn-primary">
                  Learn More
                </Link>
              </div>
            </article>
          ))}
        </div>
        <div>
          <Link href="/services" className="btn btn-outline">
            View All Services
          </Link>
        </div>
      </section>

      {/* Reviews */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">What Our Customers Say</h2>
        {reviews.length === 0 ? (
          <p className="text-slate-500">No reviews yet.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((t: Testimonial) => (
              <li key={t.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="font-medium">{t.name}</p>
                <p className="mt-2 text-slate-700">{t.quote}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Portfolio */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Our Work</h2>
        <MasonryWithLightbox
          items={Array.isArray(projects) ? projects.flatMap((p: Project) =>
            (p.images || []).map((img) => ({
              url: img.url,
              alt: img.alt || p.title,
            })),
          ) : []}
        />
      </section>

      {/* Areas */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Service Areas</h2>
        <div className="flex flex-wrap gap-3">
          {Array.isArray(areas) && areas.length > 0 ? areas.map((a: GeoArea) => (
            <Link
              key={a.slug || a.id}
              href={`/areas/${a.slug || ''}`}
              className="rounded-full border border-slate-200 px-4 py-2 shadow-sm hover:bg-slate-50"
            >
              {a.name || a.slug}
            </Link>
          )) : (
            <p className="text-slate-500">No service areas available.</p>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-3xl bg-sky-600 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold">Ready to Start Your Project?</h2>
          <p className="mt-2 opacity-90">Contact us today for a free consultation and quote.</p>
          <Link href="/contact" className="mt-6 inline-block rounded-xl bg-white px-4 py-2 text-sky-700 shadow">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
