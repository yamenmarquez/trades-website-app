import { env } from '@trades/utils';
import { NextResponse } from 'next/server';

// POST /api/leads – forwards to CMS DRF endpoint
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL('/api/leads/', env.CMS_BASE_URL).toString();

    // Optional simple rate limit gate (feature flag)
    if (env.ENABLE_LEADS_RATE_LIMIT) {
      // Minimal in-memory gate per process; for real use, swap with upstash/redis
      // Here we just ensure body has an email or phone to reduce spam
      if (!body || (!body.email && !body.phone)) {
        return NextResponse.json({ error: 'Missing contact' }, { status: 400 });
      }
    }

    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (env.CMS_API_KEY) headers.set('Authorization', `Token ${env.CMS_API_KEY}`);

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      // Mark as internal to avoid noisy tracing
      next: { tags: ['internal', 'lead'] },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json({ error: 'CMS lead error', details: data }, { status: res.status });
    }
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
