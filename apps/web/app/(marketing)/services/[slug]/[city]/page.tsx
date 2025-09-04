import type { Metadata } from 'next';
import { fetchCoverage, fetchCoverageDetail, getSiteConfig } from '@/lib/cms';
import { notFound } from 'next/navigation';
import { absoluteUrl, ldBreadcrumb, ldService } from '@/lib/seo';
import LocalProof from '@/components/LocalProof';
import RelatedServices from '@/components/RelatedServices';
import NearbyAreas from '@/components/NearbyAreas';

type Params = { slug: string; city: string };

export async function generateStaticParams() {
  // generate only for ready coverages (best-effort; empty if CMS offline)
  try {
    const cov = await fetchCoverage({ ready: true });
    return cov.map((c) => ({ slug: c.service.slug, city: c.geo.slug }));
  } catch {
    return [] as { slug: string; city: string }[];
  }
}

export const revalidate = 86400; // 1d

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, city } = await params;
  const cov = await fetchCoverageDetail(slug, city);
  if (!cov) return { robots: { index: false, follow: true } };
  const title = `${cov.service.name} en ${cov.geo.name}`;
  const url = absoluteUrl(`/services/${cov.service.slug}/${cov.geo.slug}`);
  return {
    title,
    alternates: { canonical: url },
    openGraph: { title },
    twitter: { title },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug, city } = await params;
  const cfg = await getSiteConfig();
  // Temporarily disabled for testing:
  // if (!cfg.local_seo_enabled) {
  //   notFound();
  // }
  const cov = await fetchCoverageDetail(slug, city);
  if (!cov) notFound();

  const ld = [
    ldBreadcrumb([
      { name: 'Home', path: '/' },
      { name: 'Services', path: '/services' },
      { name: cov.service.name, path: `/services/${cov.service.slug}` },
      { name: cov.geo.name, path: `/services/${cov.service.slug}/${cov.geo.slug}` },
    ]),
    ldService({
      name: cov.service.name,
      area: { type: cov.geo.type as 'city' | 'neighborhood', name: cov.geo.name },
      images: cov.hero_image ? [cov.hero_image] : undefined,
      rating:
        cov.reviews_summary && cov.reviews_summary.count >= 3
          ? { value: cov.reviews_summary.avg ?? 5, count: cov.reviews_summary.count }
          : undefined,
    }),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">
          {cov.service.name} en {cov.geo.name}
        </h1>
        {/* TODO: render unique_intro, local modules, gallery filtered by service+city, testimonials, map, FAQs, CTA */}
        <p className="opacity-80">Local coverage page (ready: {String(cov.ready)}).</p>
        <LocalProof serviceSlug={slug} citySlug={city} />
        <RelatedServices citySlug={city} currentService={slug} />
        <NearbyAreas citySlug={city} serviceSlug={slug} />
      </main>
    </>
  );
}
