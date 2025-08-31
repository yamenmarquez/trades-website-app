export default function AreasPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Service Areas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Downtown</h2>
          <p className="opacity-80">Serving the heart of the city with all our services.</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">North Side</h2>
          <p className="opacity-80">Professional services available throughout the north side.</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">South Side</h2>
          <p className="opacity-80">Comprehensive coverage of the south side area.</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">East End</h2>
          <p className="opacity-80">Full-service coverage for the east end community.</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">West End</h2>
          <p className="opacity-80">Professional trades services in the west end.</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Suburbs</h2>
          <p className="opacity-80">Extended service area covering surrounding suburbs.</p>
        </div>
      </div>
    </main>
  );
}
