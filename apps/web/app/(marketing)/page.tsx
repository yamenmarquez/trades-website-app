import { Hero } from '@/components/Hero';
import { ServicesGrid } from '@/components/ServicesGrid';
import { ReviewsCarousel } from '@/components/ReviewsCarousel';
import { PortfolioStrip } from '@/components/PortfolioStrip';
import { AreasStrip } from '@/components/AreasStrip';
import { PrimaryCTA } from '@/components/PrimaryCTA';
import { fetchServices, fetchTestimonials, fetchGeoAreas, getSiteConfig } from '@/lib/cms';
import { fetchProjects } from '@/lib/projects';
import type { Service, Testimonial, Project } from '@trades/schemas';
import type { GeoArea } from '@/lib/cms';

export const dynamic = 'force-static';

export default async function HomePage() {
  const [, services, testimonials, areas, projects] = await Promise.all([
    getSiteConfig().catch(() => null),
    fetchServices().catch(() => [] as Service[]),
    fetchTestimonials().catch(() => [] as Testimonial[]),
    fetchGeoAreas({ type: 'city' }).catch(() => [] as GeoArea[]),
    fetchProjects().catch(() => [] as Project[]),
  ]);

  return (
    <>
      <Hero />
      <section className="container py-10">
        <ServicesGrid services={services} />
      </section>

      <section className="container py-10">
        <ReviewsCarousel items={testimonials} />
      </section>

      <section className="container py-10">
        <PortfolioStrip items={projects} />
      </section>

      <section className="container py-10">
        <AreasStrip areas={areas} />
      </section>

      <section className="py-14 bg-brand-cta">
        <PrimaryCTA />
      </section>
    </>
  );
}
