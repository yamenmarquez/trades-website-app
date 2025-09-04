import Link from 'next/link';
import { fetchServiceAreas, fetchCoverage, type ServiceArea, type Coverage } from '@/lib/cms';

export const metadata = {
  title: 'Service Areas - Professional Trades Services',
  description: 'Discover all the areas we serve with our professional trades services.',
};

export default async function AreasPage() {
  const [areas, coverage] = await Promise.all([
    fetchServiceAreas(),
    fetchCoverage({ ready: true }),
  ]);

  return (
    <main className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-neutral-900">Our Service Areas</h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
          We proudly serve multiple areas with our comprehensive trades services. Discover
          professional craftsmanship in your location.
        </p>
      </div>

      {areas.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-3xl border border-neutral-200">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-primary"
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
          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">Expanding Our Reach</h2>
          <p className="text-neutral-600 mb-8 max-w-lg mx-auto text-lg">
            We're constantly growing to serve new areas. Contact us to check availability in your
            location.
          </p>
          <Link href="/contact" className="btn btn-primary btn-lg">
            Check Availability
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-2">{areas.length}</div>
              <div className="text-neutral-600">Service Areas</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl border border-accent/20">
              <div className="text-3xl font-bold text-accent mb-2">{coverage.length}</div>
              <div className="text-neutral-600">Service Locations</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {areas.reduce((total, area) => {
                  const neighbors = Array.isArray(area.neighbors) ? area.neighbors.length : 0;
                  return total + neighbors;
                }, 0)}
              </div>
              <div className="text-neutral-600">Connected Areas</div>
            </div>
          </div>

          {/* Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {areas.map((area: ServiceArea) => {
              // Get service count for this area from coverage data
              const areaServices = coverage.filter(
                (cov: Coverage) => cov.geo.slug === area.geo_slug,
              );
              const serviceCount = areaServices.length;
              const hasReviews = areaServices.some((cov: Coverage) => cov.reviews_summary);
              const avgRating = hasReviews
                ? areaServices
                    .filter((cov: Coverage) => cov.reviews_summary)
                    .reduce((sum, cov: Coverage) => sum + (cov.reviews_summary?.avg || 0), 0) /
                  areaServices.filter((cov: Coverage) => cov.reviews_summary).length
                : null;

              return (
                <Link
                  key={area.slug}
                  href={`/areas/${area.slug}`}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-neutral-50 border border-neutral-200 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:border-primary/30 hover:-translate-y-1"
                >
                  {/* Location Icon */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300 shadow-sm">
                      <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path
                          fillRule="evenodd"
                          d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>

                    {/* State Badge */}
                    {area.state && (
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 shadow-sm">
                        {area.state}
                      </span>
                    )}
                  </div>

                  {/* Area Info */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-neutral-900 group-hover:text-primary transition-colors duration-300 mb-2">
                      {area.city || area.name}
                    </h2>
                    {area.city && area.city !== area.name && (
                      <p className="text-neutral-500 mb-2 font-medium">{area.name}</p>
                    )}
                    <p className="text-neutral-600 leading-relaxed">
                      Professional trades services available with comprehensive coverage in this
                      area.
                    </p>
                  </div>

                  {/* Services Stats */}
                  <div className="space-y-4 mb-6">
                    {serviceCount > 0 && (
                      <div className="flex items-center text-neutral-700">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-neutral-100 group-hover:bg-primary/10 transition-colors flex items-center justify-center mr-3">
                          <svg
                            className="w-5 h-5 text-neutral-500 group-hover:text-primary transition-colors"
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
                        </div>
                        <div>
                          <div className="font-semibold text-neutral-900">
                            {serviceCount} Service{serviceCount !== 1 ? 's' : ''}
                          </div>
                          <div className="text-sm text-neutral-500">Available in this area</div>
                        </div>
                      </div>
                    )}

                    {avgRating && (
                      <div className="flex items-center text-neutral-700">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 group-hover:bg-amber-100 transition-colors flex items-center justify-center mr-3">
                          <svg
                            className="w-5 h-5 text-amber-500"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-amber-600">
                            {avgRating.toFixed(1)} Stars
                          </div>
                          <div className="text-sm text-neutral-500">Customer rating</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Neighbors hint */}
                  {Array.isArray(area.neighbors) && area.neighbors.length > 0 && (
                    <div className="pt-6 border-t border-neutral-100 group-hover:border-primary/20 transition-colors">
                      <div className="flex items-start">
                        <svg
                          className="w-4 h-4 text-neutral-400 mr-2 mt-0.5 flex-shrink-0"
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
                        <div>
                          <div className="text-sm font-medium text-neutral-700 mb-1">
                            Extended Coverage
                          </div>
                          <p className="text-xs text-neutral-500 leading-relaxed">
                            Also serving{' '}
                            {area.neighbors
                              .slice(0, 2)
                              .map((n) =>
                                n
                                  .split('-')
                                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(' '),
                              )
                              .join(', ')}
                            {area.neighbors.length > 2 &&
                              ` and ${area.neighbors.length - 2} more area${area.neighbors.length > 3 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hover Arrow */}
                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center">
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
                  </div>

                  {/* Subtle background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-3xl transform translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500"></div>
                </Link>
              );
            })}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 mb-6">
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-3">Don't See Your Area?</h2>
            <p className="text-neutral-600 mb-6 max-w-lg mx-auto">
              We're always expanding! Contact us to check if we can serve your location.
            </p>
            <Link href="/contact" className="btn btn-primary btn-lg">
              Get In Touch
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
