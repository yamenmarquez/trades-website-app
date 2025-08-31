export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article className="card">
          <h2 className="text-xl font-semibold mb-2">Latest Industry Trends</h2>
          <p className="opacity-80 mb-4">Discover the latest trends in the trades industry and how they might affect your projects.</p>
          <p className="text-sm opacity-60">Published: January 15, 2024</p>
        </article>
        <article className="card">
          <h2 className="text-xl font-semibold mb-2">Choosing the Right Materials</h2>
          <p className="opacity-80 mb-4">A comprehensive guide to selecting the best materials for your project needs and budget.</p>
          <p className="text-sm opacity-60">Published: January 10, 2024</p>
        </article>
        <article className="card">
          <h2 className="text-xl font-semibold mb-2">Project Planning Tips</h2>
          <p className="opacity-80 mb-4">Essential tips for planning your project timeline and ensuring everything runs smoothly.</p>
          <p className="text-sm opacity-60">Published: January 5, 2024</p>
        </article>
      </div>
    </main>
  );
}
