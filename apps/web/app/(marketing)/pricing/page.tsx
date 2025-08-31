export default function PricingPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Pricing</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <h2 className="text-xl font-semibold mb-4">Basic</h2>
          <p className="text-3xl font-bold mb-4">
            $99<span className="text-lg opacity-60">/hour</span>
          </p>
          <ul className="text-left space-y-2 mb-6">
            <li>• Standard consultation</li>
            <li>• Basic project planning</li>
            <li>• Quality materials</li>
            <li>• 1-year warranty</li>
          </ul>
          <button className="btn-primary w-full">Get Started</button>
        </div>
        <div className="card text-center border-2 border-primary">
          <h2 className="text-xl font-semibold mb-4">Professional</h2>
          <p className="text-3xl font-bold mb-4">
            $149<span className="text-lg opacity-60">/hour</span>
          </p>
          <ul className="text-left space-y-2 mb-6">
            <li>• Detailed consultation</li>
            <li>• Advanced project planning</li>
            <li>• Premium materials</li>
            <li>• 3-year warranty</li>
            <li>• Priority scheduling</li>
          </ul>
          <button className="btn-secondary w-full">Get Started</button>
        </div>
        <div className="card text-center">
          <h2 className="text-xl font-semibold mb-4">Premium</h2>
          <p className="text-3xl font-bold mb-4">
            $199<span className="text-lg opacity-60">/hour</span>
          </p>
          <ul className="text-left space-y-2 mb-6">
            <li>• Comprehensive consultation</li>
            <li>• Custom project design</li>
            <li>• Luxury materials</li>
            <li>• 5-year warranty</li>
            <li>• VIP scheduling</li>
            <li>• Ongoing support</li>
          </ul>
          <button className="btn-primary w-full">Get Started</button>
        </div>
      </div>
    </main>
  );
}
