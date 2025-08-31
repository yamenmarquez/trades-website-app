export default function ContactPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Get in Touch</h2>
          <p className="opacity-90 mb-6">
            Ready to start your project? Contact us today for a free consultation and quote.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Phone</h3>
              <p className="opacity-80">(555) 123-4567</p>
            </div>
            <div>
              <h3 className="font-semibold">Email</h3>
              <p className="opacity-80">info@tradescompany.com</p>
            </div>
            <div>
              <h3 className="font-semibold">Address</h3>
              <p className="opacity-80">
                123 Main Street
                <br />
                City, State 12345
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Send us a Message</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                required
              ></textarea>
            </div>
            <button type="submit" className="btn-primary w-full">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
