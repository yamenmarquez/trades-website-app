import Link from 'next/link';
import { fetchServices, fetchTestimonials } from '@/lib/cms';
import type { Service, Testimonial } from '@trades/schemas';
import Prose from '@/components/Prose';

export default async function Home() {
  const services = await fetchServices();
  const testimonials = await fetchTestimonials();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
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
            <Link
              href="/portfolio"
              className="border-2 border-white text-white px-6 py-2 rounded-2xl font-medium hover:bg-white hover:text-primary transition-colors"
            >
              View Our Work
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service: Service & { description_html?: string }) => (
              <div key={service.id} className="card text-center">
                <h3 className="text-xl font-semibold mb-3">{service.name}</h3>
                <div className="mb-4" style={{ color: '#64748b' }}>
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

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((testimonial: Testimonial) => (
              <div key={testimonial.id} className="card">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 text-xl">
                    {'★'.repeat(testimonial.rating)}
                    {'☆'.repeat(5 - testimonial.rating)}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.text}"</p>
                <p className="font-semibold">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-xl mb-8">Contact us today for a free consultation and quote.</p>
          <Link href="/contact" className="btn-contrast hover:bg-gray-100">
            Get Started
          </Link>
        </div>
      </section>

      {/* Demo quick links */}
      <section className="mt-12 container mx-auto px-4">
        <div className="rounded-xl border p-6">
          <h2 className="text-lg font-semibold mb-2">Demo rápida</h2>
          <p className="text-sm text-neutral-700 mb-4">Explora las nuevas vistas y filtros:</p>
          <div className="flex flex-wrap gap-3">
            <Link className="btn-secondary" href="/portfolio">
              Ver Portafolio
            </Link>
            <Link className="btn-secondary" href="/portfolio?service=glass-installation&city=miami">
              Portafolio: Glass en Miami
            </Link>
            <Link className="btn-secondary" href="/services/glass-installation/miami">
              Servicio en Miami
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
