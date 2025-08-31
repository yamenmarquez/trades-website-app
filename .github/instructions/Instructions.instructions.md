# Trades Website App – Project Guide

## 🎯 Goal

Build a **SaaS / plug-and-play repo** to create & maintain websites for trades (glass, carpentry, cabinets, tile, drywall, HVAC, plumbing, etc.) with:

- **Simple onboarding wizard** (logo, colors, services, area, contact, photos).
- **Non-technical editing** (drag/drop blocks, gallery, testimonials).
- **Theme selector** (layouts & tokens).
- **Strong local SEO** (LocalBusiness schema, reviews, service areas, fast load).

---

## ⚙️ Recommended Stack

**Option A — Next.js (App Router) + Tailwind + Wagtail Headless (Django)** ✅
Best combo: Wagtail for editing, Next.js for delivery. Postgres + S3 for storage.
**Option B — Next.js + Payload CMS (Node)** → simpler infra, less mature editor.
**Option C — Django+Wagtail monolith** → simpler infra, but no Next ecosystem.
👉 Use **A** for balance of UX + scalability.

---

## 🏗️ Architecture

**MVP (single tenant)**:

- Monorepo (Turborepo): `apps/web` (Next) + `apps/cms` (Wagtail) + `packages/ui`.
- Deploy: Next on Vercel; Wagtail on Render/Fly; DB = Postgres managed; S3/Supabase for media.

**Multi-tenant SaaS**:

- Wagtail multi-site + `django-tenants`.
- Domain mapping: `site.tuapp.com` or client’s own.
- Onboarding wizard + Stripe billing.

---

## 📑 Pages & Menus

**Top Nav**: Home, Services, Portfolio, Reviews, About, Areas, Pricing, Blog, Contact.
Optional: Guarantee, Financing, Careers.

**Key Sections**:

- **Home**: Hero CTA, why choose us, services, reviews slider, gallery, service areas, CTA.
- **Services**: List + individual pages (photos, FAQs, CTA).
- **Portfolio**: Masonry gallery, filters, video support.
- **Reviews**: Google import, schema.
- **About**: Story, team, licenses.
- **Areas**: Map + neighborhoods.
- **Pricing**: Packages, estimator form.
- **Blog**: SEO guides.
- **Contact**: Form, WhatsApp, Calendly, map.

---

## 🖼️ Gallery (Next.js Conf style)

- Responsive grid (masonry), optimized images, blur placeholders.
- Lightbox with zoom/swipe.
- Filters by service/city, supports video (Mux/Cloudflare).
- `/portfolio` (listing) + `/portfolio/[slug]` (detail).

**CMS Models**:

- `Project`: title, services, city, gallery, before/after.
- `MediaAsset`: image/video, tags, alt, metadata.

---

## 🎨 Themes / Templates

- **Theme object** in CMS: colors, fonts, radius, shadow, layoutVariant.
- Apply via CSS variables (`:root { --primary: … }`).
- **Base templates**:
  1. Craft Clean (minimal)
  2. Bold Build (big blocks, strong CTA)
  3. Modern Pro (cards, subtle accents)

---

## 🗂️ CMS Data Models

- **SiteConfig**: logo, colors, phones, socials, CTAs.
- **Service**: name, slug, desc, FAQs, photos.
- **Project**: title, slug, service(s), city, gallery.
- **MediaAsset**: image/video w/ metadata.
- **Testimonial**: name, rating, source.
- **ServiceArea**: city/zip, map.
- **Post**: blog article.
- **Lead**: form submissions.
- **Page**: generic blocks (hero, services, gallery, reviews, CTA).

---

## ✏️ Editing UX

- Pre-built **blocks** (services, testimonials, before/after, map).
- **Validations**: alt text required, crop presets, file size caps.
- **Mass upload**: drag & drop photos, auto-tag.
- Preview → publish workflow.

---

## 📂 Repo Structure (Turborepo)

```
/apps
  /web     # Next.js
  /cms     # Django + Wagtail
/packages
  /ui      # Tailwind components
  /schemas # Shared types
  /utils   # helpers (SEO, schema.org)
```

- Local: Docker Compose (Postgres, MinIO, Redis opt).
- CI/CD: lint, typecheck, tests, preview deploys, auto migrations.

---

## 🛠️ Setup Checklist

1. CMS (Wagtail + Postgres + S3) w/ models.
2. API (JSON/GraphQL via wagtail-api).
3. Web (Next.js + ISR, multi-site routing).
4. Media: remote loader, video via Mux/CF.
5. SEO: sitemap, robots, OpenGraph, JSON-LD.
6. Analytics + errors: Plausible/Posthog + Sentry.
7. Auth: admin-only CMS.
8. Backups: DB snapshots, file retention.
9. Domains: wildcard `*.tuapp.com` + custom client mapping.
