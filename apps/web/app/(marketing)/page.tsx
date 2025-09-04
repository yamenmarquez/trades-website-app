import Link from 'next/link';
import { fetchServices, fetchProjects, fetchServiceAreas, fetchCoverage } from '@/lib/cms';
import { fetchTestimonials } from '@/lib/cms';
import Prose from '@/components/Prose';
import MasonryWithLightbox from '@/components/MasonryWithLightbox';
import type { Service, Project } from '@trades/schemas';
import type { ServiceArea, Coverage, CompatTestimonial } from '@/lib/cms';

export const dynamic = 'force-static';

export default async function HomePage() {
  const [services, projects, serviceAreas, reviews, coverage] = await Promise.all([
    fetchServices?.() ?? [],
    fetchProjects?.() ?? [],
    fetchServiceAreas?.() ?? [],
    fetchTestimonials(6),
    fetchCoverage({ ready: true }),
  ]);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="rounded-3xl gradient-brand py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Professional Trades Services
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl opacity-90">
            Quality craftsmanship, reliable service, and exceptional results for all your project
            needs.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="btn btn-contrast shadow-lg hover:shadow-xl transition-shadow"
            >
              Get Free Quote
            </Link>
            <Link
              href="/portfolio"
              className="rounded-xl border-2 border-white/80 px-6 py-3 hover:bg-white/10 transition-colors font-semibold"
            >
              View Our Work
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-semibold">Our Services</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(services as Service[]).map((s) => (
            <article key={s.id} className="card">
              <h3 className="font-semibold">{s.name}</h3>
              {s.description && (
                <Prose html={s.description} className="line-clamp-3 mt-2 text-sm" />
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
          <Link href="/services" className="btn btn-outline-primary">
            View All Services
          </Link>
        </div>
      </section>

      {/* Local Service Coverage */}
      {coverage.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl font-semibold">Local Service Coverage</h2>
          <p className="text-neutral-600">
            Discover our specialized services available in different areas.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coverage.slice(0, 12).map((cov: Coverage) => (
              <Link
                key={cov.id}
                href={`/services/${cov.service.slug}/${cov.geo.slug}`}
                className="card hover:shadow-md transition-all duration-200 border-l-4 border-l-primary"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 mb-1">{cov.service.name}</h3>
                    <p className="text-sm text-neutral-600">in {cov.geo.name}</p>
                    {cov.reviews_summary && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-amber-600">
                        <span>★ {cov.reviews_summary.avg}</span>
                        <span className="text-neutral-500">
                          ({cov.reviews_summary.count} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                  {cov.hero_image && (
                    <div className="ml-3 w-12 h-12 rounded-lg overflow-hidden bg-neutral-100">
                      <img
                        src={cov.hero_image.url}
                        alt={cov.hero_image.alt || cov.service.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-3 text-sm text-primary font-medium">View Local Details →</div>
              </Link>
            ))}
          </div>
          {coverage.length > 12 && (
            <div className="text-center">
              <Link href="/areas" className="btn btn-outline-primary">
                View All Areas & Services
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-semibold">What Our Customers Say</h2>
        {reviews.length === 0 ? (
          <p className="text-slate-500">No reviews yet.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((t: CompatTestimonial, index: number) => (
              <li
                key={`testimonial-${t.id}-${index}`}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <p className="font-medium">{t.name}</p>
                <p className="mt-2 text-slate-700">{t.quote}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Portfolio */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-semibold">Our Work</h2>
        <MasonryWithLightbox
          items={
            Array.isArray(projects)
              ? projects.flatMap((p: Project) =>
                  (p.images || []).map((img) => ({
                    url: img.url,
                    alt: img.alt || p.title,
                  })),
                )
              : []
          }
        />
      </section>

      {/* Service Areas */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-semibold">Service Areas</h2>
        <div className="flex flex-wrap gap-3">
          {Array.isArray(serviceAreas) && serviceAreas.length > 0 ? (
            serviceAreas.map((area: ServiceArea) => (
              <Link
                key={area.slug}
                href={`/areas/${area.slug}`}
                className="rounded-full border border-slate-200 px-4 py-2 shadow-sm hover:bg-slate-50 hover:border-primary transition-colors"
              >
                {area.name}
              </Link>
            ))
          ) : (
            <div className="text-center py-8 w-full">
              <p className="text-slate-500 mb-4">We're expanding our service areas.</p>
              <Link href="/contact" className="btn btn-primary">
                Contact us to check availability
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-3xl bg-primary py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold">Ready to Start Your Project?</h2>
          <p className="mt-2 opacity-90">Contact us today for a free consultation and quote.</p>
          <Link href="/contact" className="btn btn-contrast mt-6 shadow">
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
