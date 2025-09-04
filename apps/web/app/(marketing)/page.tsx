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
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Our Service Areas</h2>
          <p className="mt-2 text-neutral-600">
            Professional trades services across multiple locations
          </p>
        </div>

        {Array.isArray(serviceAreas) && serviceAreas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceAreas.map((area: ServiceArea) => {
              // Get service count for this area from coverage data
              const areaServices = coverage.filter((cov) => cov.geo.slug === area.geo_slug);
              const serviceCount = areaServices.length;
              const hasReviews = areaServices.some((cov) => cov.reviews_summary);
              const avgRating = hasReviews
                ? areaServices
                    .filter((cov) => cov.reviews_summary)
                    .reduce((sum, cov) => sum + (cov.reviews_summary?.avg || 0), 0) /
                  areaServices.filter((cov) => cov.reviews_summary).length
                : null;

              return (
                <Link
                  key={area.slug}
                  href={`/areas/${area.slug}`}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-neutral-50 border border-neutral-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-primary/20"
                >
                  {/* Location Icon */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          fillRule="evenodd"
                          d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>

                    {/* State Badge */}
                    {area.state && (
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {area.state}
                      </span>
                    )}
                  </div>

                  {/* Area Info */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary transition-colors">
                      {area.city || area.name}
                    </h3>
                    {area.city && area.city !== area.name && (
                      <p className="text-sm text-neutral-500 mt-1">{area.name}</p>
                    )}
                  </div>

                  {/* Services Stats */}
                  <div className="space-y-3">
                    {serviceCount > 0 && (
                      <div className="flex items-center text-sm text-neutral-600">
                        <svg
                          className="w-4 h-4 mr-2 text-neutral-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1"
                          />
                        </svg>
                        <span>
                          {serviceCount} service{serviceCount !== 1 ? 's' : ''} available
                        </span>
                      </div>
                    )}

                    {avgRating && (
                      <div className="flex items-center text-sm">
                        <svg
                          className="w-4 h-4 mr-1 text-amber-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-amber-600 font-medium">{avgRating.toFixed(1)}</span>
                        <span className="text-neutral-500 ml-1">rating</span>
                      </div>
                    )}
                  </div>

                  {/* Neighbors hint */}
                  {Array.isArray(area.neighbors) && area.neighbors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-neutral-100">
                      <p className="text-xs text-neutral-500">
                        Also serving{' '}
                        {area.neighbors
                          .slice(0, 2)
                          .map((n) => n.replace(/-/g, ' '))
                          .join(', ')}
                        {area.neighbors.length > 2 && ` +${area.neighbors.length - 2} more`}
                      </p>
                    </div>
                  )}

                  {/* Hover Arrow */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-2xl border border-neutral-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">Expanding Our Reach</h3>
            <p className="text-neutral-600 mb-6 max-w-md mx-auto">
              We're constantly growing to serve new areas. Contact us to check availability in your
              location.
            </p>
            <Link href="/contact" className="btn btn-primary">
              Check Availability
            </Link>
          </div>
        )}
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
