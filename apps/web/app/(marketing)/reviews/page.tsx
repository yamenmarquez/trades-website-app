import { fetchTestimonials } from "@/lib/cms";

export default async function ReviewsPage() {
  const testimonials = await fetchTestimonials();
  
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Customer Reviews</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial: any) => (
          <div key={testimonial.id} className="card">
            <div className="flex items-center mb-4">
              <div className="text-yellow-400 text-xl">
                {"★".repeat(testimonial.rating)}
                {"☆".repeat(5 - testimonial.rating)}
              </div>
            </div>
            <p className="opacity-90 mb-4">"{testimonial.text}"</p>
            <p className="font-semibold">{testimonial.name}</p>
            {testimonial.source && (
              <a href={testimonial.source} className="link-brand text-sm">
                View Source
              </a>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
