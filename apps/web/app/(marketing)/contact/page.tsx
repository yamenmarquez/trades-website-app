'use client';

import { useState, useEffect } from 'react';

const CMS = process.env.NEXT_PUBLIC_CMS_URL || 'http://127.0.0.1:8000';

function getUtms() {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get('utm_source') || '',
    utm_medium: p.get('utm_medium') || '',
    utm_campaign: p.get('utm_campaign') || '',
    utm_term: p.get('utm_term') || '',
    utm_content: p.get('utm_content') || '',
    page_path: window.location.pathname,
  };
}

export default function ContactPage() {
  const [data, setData] = useState({ name: '', email: '', message: '' });
  const [utms, setUtms] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setUtms(getUtms());
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);

    if (!data.name || !data.email || !data.message) {
      setErr('Please complete all fields.');
      setBusy(false);
      return;
    }

    try {
      const res = await fetch(`${CMS}/api/leads/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ...utms }),
      });
      if (!res.ok) throw new Error(`Lead failed: ${res.status}`);
      setOk(true);
      setData({ name: '', email: '', message: '' });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong.';
      setErr(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-semibold mb-8">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-semibold mb-2">Get in Touch</h2>
          <p className="text-sm text-neutral-600">
            Ready to start your project? Contact us today for a free consultation and quote.
          </p>
        </div>

        <form onSubmit={submit} className="card">
          <label className="block text-sm mb-1">Name</label>
          <input
            className="w-full border rounded px-3 py-2 mb-3"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />

          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2 mb-3"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />

          <label className="block text-sm mb-1">Message</label>
          <textarea
            className="w-full border rounded px-3 py-2 mb-4 h-32"
            value={data.message}
            onChange={(e) => setData({ ...data, message: e.target.value })}
          />

          {err && <p className="text-red-600 text-sm mb-3">{err}</p>}
          {ok && (
            <p className="text-green-600 text-sm mb-3">Thanks! We'll get back to you shortly.</p>
          )}

          <button disabled={busy} className="btn-primary">
            {busy ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  );
}
