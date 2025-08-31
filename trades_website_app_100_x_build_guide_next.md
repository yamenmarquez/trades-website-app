# Trades Website App — 100× Build Guide (Next.js + Tailwind + Wagtail Headless)

This guide walks you end‑to‑end through building a production‑grade app that creates and powers websites for trades businesses (glazing, carpentry, cabinets, tile, drywall, framing, plumbing, HVAC, etc.). It assumes a **monorepo** with:

- **Frontend**: Next.js (App Router) + Tailwind CSS
- **CMS**: Wagtail (Django, Headless) on Postgres + S3‑compatible storage
- **Media**: Images via Next/Image; optional video via Mux/Cloudflare Stream
- **Infra**: Docker Compose locally; Vercel (web) + Fly.io/Render/DO (cms)
- **SaaS‑ready**: Single‑tenant MVP → Multi‑tenant evolution (domains per site)

> If you prefer a single‑stack JS approach, swap Wagtail for Payload CMS. The rest of the flow stays similar (API, theming, gallery). This guide focuses on Wagtail because of its excellent editor UX and image tooling.

---

## 0) Prerequisites

**Install once on your workstation:**

- **Node** ≥ 20.x (ship with corepack)  
- **PNPM** (`corepack enable && corepack prepare pnpm@latest --activate`)  
- **Python** 3.11+  
- **pipx** (`python -m pip install --user pipx && pipx ensurepath`)  
- **uv** (fast Python package manager) (`pipx install uv`)
- **Docker Desktop** (or colima/podman)  
- **Git** + GitHub account  
- **Make** (optional but handy on macOS/Linux; on Windows use PowerShell scripts)

**VS Code extensions (recommended):**

- ESLint, Prettier, Tailwind CSS IntelliSense  
- Python, ruff, Django, Docker  
- GitHub Copilot/Chat (optional)

---

## 1) Create the Monorepo (Turborepo)

```bash
mkdir trades-website-app && cd $_
pnpm dlx create-turbo@latest .
# Choose: Empty starter
pnpm -w add -D prettier eslint typescript @types/node turbo
```

**Workspace layout**
```
trades-website-app/
  apps/
    web/        # Next.js frontend
    cms/        # Django + Wagtail headless API
  packages/
    ui/         # Reusable React components (Tailwind)
    schemas/    # Shared TypeScript types (generated or hand-written)
    utils/      # Shared utilities (seo, fetch, parsing)
  .github/workflows/
  .env.example
  turbo.json
  package.json
  README.md
```

**Top-level `package.json` (essential bits)**
```json
{
  "name": "trades-website-app",
  "private": true,
  "packageManager": "pnpm@9",
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "format": "prettier -w ."
  }
}
```

**`turbo.json`**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "dev": { "cache": false, "persistent": true },
    "build": { "cache": true },
    "lint": { "cache": true },
    "test": { "cache": true }
  }
}
```

---

## 2) Bootstrap the CMS (`apps/cms`) — Wagtail Headless

> We use Docker for DB/storage locally so the same config works in prod.

**2.1 Create Django project**

```bash
cd apps && uv init --python 3.11 cms && cd cms
# Create virtualenv + add deps
uv add django==5.* wagtail==6.* djangorestframework django-cors-headers psycopg[binary] \
  django-storages boto3 whitenoise gunicorn python-dotenv pillow
uv add -d ruff pytest pytest-django model-bakery

# Start project
uv run django-admin startproject core .
uv run python manage.py startapp sitecontent
```

**2.2 Project settings** (`core/settings.py` key changes)

```python
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "corsheaders",
    "rest_framework",
    "storages",

    # Wagtail
    "wagtail",
    "wagtail.admin",
    "wagtail.users",
    "wagtail.images",
    "wagtail.documents",
    "wagtail.snippets",
    "wagtail.embeds",
    "wagtail.sites",
    "wagtail.contrib.settings",
    "wagtail.contrib.modeladmin",
    "wagtail.api.v2",

    # Local
    "sitecontent",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

WAGTAIL_SITE_NAME = "Trades CMS"

# DB (env-driven)
import os
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "trades"),
        "USER": os.getenv("POSTGRES_USER", "trades"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", "password"),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": int(os.getenv("POSTGRES_PORT", 5432)),
    }
}

# CORS (allow your web app origin)
CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# Static/media
STATIC_URL = "/static/"
MEDIA_URL = "/media/"
DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage" if os.getenv("USE_S3") == "1" else "django.core.files.storage.FileSystemStorage"

if os.getenv("USE_S3") == "1":
    AWS_STORAGE_BUCKET_NAME = os.getenv("AWS_STORAGE_BUCKET_NAME")
    AWS_S3_ENDPOINT_URL = os.getenv("AWS_S3_ENDPOINT_URL")  # MinIO local
    AWS_S3_REGION_NAME = os.getenv("AWS_S3_REGION_NAME", "us-east-1")
    AWS_QUERYSTRING_AUTH = False

# Wagtail API v2
WAGTAILAPI_BASE_URL = os.getenv("WAGTAILAPI_BASE_URL", "http://localhost:8000")

# Security (prod recommended)
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 3600
```

**2.3 URLs** (`core/urls.py`)

```python
from django.urls import path, include
from wagtail.documents import urls as wagtaildocs_urls
from wagtail import urls as wagtail_urls

urlpatterns = [
    path("api/v2/", include("wagtail.api.v2.urls")),
    path("documents/", include(wagtaildocs_urls)),
    path("cms/", include(wagtail_urls)),  # Admin at /cms
]
```

**2.4 Content models** (`sitecontent/models.py`) — core entities

```python
from django.db import models
from wagtail.models import Page
from wagtail.fields import RichTextField, StreamField
from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
from wagtail.snippets.models import register_snippet
from wagtail.admin.panels import FieldPanel, MultiFieldPanel, FieldRowPanel

@register_snippet
class Theme(models.Model):
    name = models.CharField(max_length=64)
    brand_color = models.CharField(max_length=7, default="#0ea5e9")
    accent = models.CharField(max_length=7, default="#22c55e")
    neutral = models.CharField(max_length=7, default="#0f172a")
    font_heading = models.CharField(max_length=64, default="Inter")
    font_body = models.CharField(max_length=64, default="Inter")
    radius = models.CharField(max_length=8, default="1rem")
    layout_variant = models.CharField(max_length=32, default="bold-build")

    panels = [
        FieldPanel("name"),
        FieldRowPanel([FieldPanel("brand_color"), FieldPanel("accent"), FieldPanel("neutral")]),
        FieldRowPanel([FieldPanel("font_heading"), FieldPanel("font_body")]),
        FieldRowPanel([FieldPanel("radius"), FieldPanel("layout_variant")]),
    ]

    def __str__(self):
        return self.name

@register_snippet
class Service(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = RichTextField(blank=True)
    icon = models.CharField(max_length=40, blank=True)  # lucide icon name

    panels = [FieldPanel("name"), FieldPanel("slug"), FieldPanel("description"), FieldPanel("icon")]

    def __str__(self):
        return self.name

class MediaAsset(models.Model):
    image = models.ForeignKey(
        "wagtailimages.Image", on_delete=models.SET_NULL, null=True, blank=True, related_name="+"
    )
    alt = models.CharField(max_length=160, blank=True)
    tags = models.CharField(max_length=160, blank=True)  # comma separated
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.alt or f"Asset {self.pk}"

class ProjectIndexPage(Page):
    intro = RichTextField(blank=True)
    content_panels = Page.content_panels + [FieldPanel("intro")]

class ProjectPage(Page):
    services = models.ManyToManyField(Service, blank=True)
    city = models.CharField(max_length=120, blank=True)
    date = models.DateField(null=True, blank=True)

    gallery = StreamField([
        ("image", ImageChooserBlock()),
    ], use_json_field=True, blank=True)

    description = RichTextField(blank=True)

    content_panels = Page.content_panels + [
        FieldPanel("services"),
        FieldPanel("city"),
        FieldPanel("date"),
        FieldPanel("gallery"),
        FieldPanel("description"),
    ]

class Testimonial(models.Model):
    name = models.CharField(max_length=120)
    rating = models.PositiveSmallIntegerField(default=5)
    text = models.TextField()
    source = models.URLField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.rating}★)"
```

**2.5 Migrate & superuser**

```bash
uv run python manage.py makemigrations
uv run python manage.py migrate
uv run python manage.py createsuperuser
```

**2.6 Docker Compose for local DB + S3 (MinIO)** (`apps/cms/docker-compose.yml`)

```yaml
version: "3.9"
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: trades
      POSTGRES_PASSWORD: password
      POSTGRES_DB: trades
    ports: ["5432:5432"]
    volumes: [db:/var/lib/postgresql/data]

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    ports: ["9000:9000", "9001:9001"]
    volumes: [minio:/data]

volumes:
  db:
  minio:
```

**2.7 `.env` for CMS** (`apps/cms/.env`)
```
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=trades
POSTGRES_USER=trades
POSTGRES_PASSWORD=password
CORS_ALLOWED_ORIGINS=http://localhost:3000
USE_S3=1
AWS_STORAGE_BUCKET_NAME=trades-bucket
AWS_S3_ENDPOINT_URL=http://localhost:9000
AWS_S3_REGION_NAME=us-east-1
WAGTAILAPI_BASE_URL=http://localhost:8000
```

**2.8 Run services**

```bash
cd apps/cms
docker compose up -d
uv run python manage.py runserver 0.0.0.0:8000
# Visit http://localhost:8000/cms to log in and create content
```

**2.9 Seed demo content (optional)** — create a `management/commands/seed.py` to create a site, homepage, sample services, and a few projects with images.

---

## 3) Expose Read API for Next.js

Wagtail API v2 provides endpoints for pages/snippets/images. We’ll structure:

- `/api/v2/pages/?type=sitecontent.ProjectPage&fields=services,city,date,gallery,description`
- `/api/v2/pages/<id>/` for detail
- `/api/v2/images/` for renditions
- Snippets via `/api/v2/snippets/` (Theme, Service, Testimonial)

> You can also create dedicated DRF viewsets if you need custom shapes or filters.

**Example DRF view (optional)** `sitecontent/api.py`

```python
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import ProjectPage, Service

class ServicesViewSet(ReadOnlyModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ...  # define serializer

class ProjectsViewSet(ReadOnlyModelViewSet):
    queryset = ProjectPage.objects.live().public()
    serializer_class = ...

    @action(detail=False, methods=["get"])
    def by_service(self, request):
        slug = request.query_params.get("slug")
        qs = self.get_queryset()
        if slug:
            qs = qs.filter(services__slug=slug)
        # serialize minimal card fields
        data = [
            {
                "title": p.title,
                "city": p.city,
                "id": p.id,
            }
            for p in qs[:50]
        ]
        return Response(data)
```

Wire into `urls.py` with DRF router if used.

---

## 4) Bootstrap the Frontend (`apps/web`) — Next.js + Tailwind

**4.1 Create app**

```bash
cd ../../apps
pnpm dlx create-next-app@latest web --ts --eslint --src-dir --app --tailwind --import-alias "@/*"
cd web
pnpm add zod swr @tanstack/react-query yet-another-react-lightbox react-hook-form
pnpm add -D @types/node @types/react @tailwindcss/typography @tailwindcss/forms
```

**4.2 Tailwind config** — tokens via CSS variables in `globals.css`

```css
:root{
  --color-primary: #0ea5e9;
  --color-accent: #22c55e;
  --color-neutral: #0f172a;
  --radius: 1rem;
}

@layer base{
  html { color-scheme: light; }
  body { @apply text-slate-800 bg-white; }
}

@layer utilities{
  .card { @apply rounded-2xl shadow-lg p-6 bg-white; border-radius: var(--radius); }
  .btn-primary { @apply inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-medium;
    background: var(--color-primary); color:white; }
}
```

**4.3 Read theme from CMS** — server action to fetch theme JSON by host

Create a tiny config endpoint in CMS (`/api/site-config`) or use Snippets API for `Theme`. In Next:

```ts
// apps/web/src/lib/cms.ts
export const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || "http://localhost:8000";

export async function fetchTheme() {
  const res = await fetch(`${CMS_URL}/api/v2/snippets/sitecontent_theme/`, { next: { revalidate: 60 } });
  const json = await res.json();
  const theme = json.items?.[0];
  return theme;
}
```

Apply the theme at the layout root:

```tsx
// apps/web/src/app/layout.tsx
import "./globals.css";
import { fetchTheme } from "@/lib/cms";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await fetchTheme();
  const style = {
    "--color-primary": theme?.brand_color ?? "#0ea5e9",
    "--color-accent": theme?.accent ?? "#22c55e",
    "--color-neutral": theme?.neutral ?? "#0f172a",
    "--radius": theme?.radius ?? "1rem",
  } as React.CSSProperties;

  return (
    <html lang="en">
      <body style={style}>{children}</body>
    </html>
  );
}
```

**4.4 Site structure (routes)**

```
/app
  /(marketing)
    page.tsx              # Home
    services/page.tsx
    services/[slug]/page.tsx
    portfolio/page.tsx
    portfolio/[id]/page.tsx
    reviews/page.tsx
    about/page.tsx
    areas/page.tsx
    pricing/page.tsx
    blog/page.tsx
    contact/page.tsx
  /api (route handlers if needed)
  /components
  /lib
  /styles
```

**4.5 Fetch portfolio list** (cards)

```ts
// apps/web/src/lib/projects.ts
export async function fetchProjects() {
  const url = `${CMS_URL}/api/v2/pages/?type=sitecontent.ProjectPage&fields=city,date,gallery,services&order=-first_published_at`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  return data.items as any[];
}
```

**4.6 Gallery (Next.js Conf Pics style)**

Install lightbox already above. Create a responsive Masonry grid using CSS columns (simple, fast):

```tsx
// apps/web/src/components/Gallery.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export default function Gallery({ images }: { images: { src: string; width: number; height: number; alt?: string }[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]"></div>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
        {images.map((img, i) => (
          <button key={i} className="mb-4 w-full" onClick={() => { setIndex(i); setOpen(true); }}>
            <Image src={img.src} alt={img.alt || ""} width={img.width} height={img.height} className="w-full h-auto rounded-xl shadow" placeholder="blur" blurDataURL={img.src+"?w=20&q=10"} />
          </button>
        ))}
      </div>
      <Lightbox open={open} close={() => setOpen(false)} index={index} slides={images.map(i => ({ src: i.src }))} />
    </>
  );
}
```

**4.7 Portfolio page**

```tsx
// apps/web/src/app/portfolio/page.tsx
import { fetchProjects } from "@/lib/projects";
import Gallery from "@/components/Gallery";
import { CMS_URL } from "@/lib/cms";

export default async function PortfolioPage() {
  const projects = await fetchProjects();

  const images = projects.flatMap((p) => (p.gallery || []).map((img: any) => ({
    src: `${CMS_URL}${img.value.meta.download_url}`.replace("/original_images/", "/fills/1200x0/"),
    width: img.value.width || 1200,
    height: img.value.height || 800,
    alt: p.title,
  })));

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Our Work</h1>
      <Gallery images={images} />
    </main>
  );
}
```

> Note: Wagtail Image renditions endpoints vary; you can also build a custom API that returns precomputed rendition URLs and dimensions.

**4.8 Services list & detail** — fetch `Service` snippet and `ProjectPage` filtered by service. Server components for SEO.

**4.9 Contact form & lead capture** — create a Next.js route action that posts to a DRF endpoint `/api/leads/` in CMS (model `Lead`). Add hCaptcha/Turnstile for spam.

---

## 5) Theming & Template Selector

**5.1 Theme tokens (already in CSS variables)** — expose Theme from CMS and apply in `layout.tsx`.

**5.2 Template variants** — in CMS `Theme.layout_variant` can be one of: `craft-clean`, `bold-build`, `modern-pro`. In Next, switch hero/header/card patterns based on variant props.

```tsx
// apps/web/src/components/Hero.tsx
export function Hero({ variant = "bold-build", heading, sub, cta }: any){
  if(variant === "craft-clean"){
    return (<section className="py-20"><div className="container mx-auto px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">{heading}</h1>
      <p className="text-lg mb-6">{sub}</p>
      {cta}
    </div></section>);
  }
  // bold-build default
  return (<section className="py-24 bg-[var(--color-neutral)] text-white">
    <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center">
      <div>
        <h1 className="text-5xl font-extrabold mb-4">{heading}</h1>
        <p className="text-lg opacity-90 mb-6">{sub}</p>
        {cta}
      </div>
      <div className="card bg-white/10">Your image/video here</div>
    </div>
  </section>);
}
```

**5.3 Admin UX** — in Wagtail, editors pick a Theme at site level (Snippet) and it propagates to all pages. You can add a `SiteConfig` model that holds contact info + `theme = ForeignKey(Theme)`.

---

## 6) SEO, Accessibility, and Structured Data

- Use Next’s metadata API in server components.  
- Generate `sitemap.xml` and `robots.txt` routes.  
- Include **JSON‑LD** for `LocalBusiness`, `Service`, `Review`, and `Project` pages.  
- Always require `alt` text in CMS for images; enforce minimum contrast via Tailwind classes and `aria-*` where relevant.  
- Prefetch important routes; lazy‑load below‑the‑fold images.

**Example JSON-LD** in a page:

```tsx
export function LocalBusinessJsonLd({ name, phone, address }: any){
  const json = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name, telephone: phone,
    address: { "@type": "PostalAddress", ...address }
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
}
```

---

## 7) Testing Strategy (Backend + Frontend)

**Backend (pytest):**
- Model tests (constraints, signals)
- API tests (list/detail, filters, pagination, CORS)
- Image rendition URLs exist

**Frontend:**
- Unit tests (Vitest/RTL) for components (Gallery, Hero variants)
- Integration (React Testing Library)
- E2E (Playwright): critical paths (home loads, services render, gallery lightbox opens, contact form submits)

**Example GitHub Actions matrix** (snippet):

```yaml
name: CI
on: [push, pull_request]
jobs:
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - name: Install
        run: pnpm i --frozen-lockfile
      - name: Lint + Build
        run: pnpm -w run lint && pnpm -w run build
  cms:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: trades
          POSTGRES_PASSWORD: password
          POSTGRES_DB: trades
        ports: ["5432:5432"]
        options: >-
          --health-cmd="pg_isready -U trades" --health-interval=10s --health-timeout=5s --health-retries=5
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with: { python-version: "3.11" }
      - name: Install uv
        run: pipx install uv
      - name: Install deps
        working-directory: apps/cms
        run: uv sync
      - name: Run tests
        working-directory: apps/cms
        env:
          POSTGRES_HOST: localhost
          POSTGRES_DB: trades
          POSTGRES_USER: trades
          POSTGRES_PASSWORD: password
        run: uv run pytest -q
```

---

## 8) Local Dev Workflow (the exact order)

1. `docker compose up -d` in `apps/cms` (DB + MinIO)
2. `uv run python manage.py migrate && createsuperuser`
3. `uv run python manage.py runserver 0.0.0.0:8000`
4. In another terminal: `cd apps/web && pnpm dev`
5. Open CMS, create Services, Theme, a ProjectIndexPage + ProjectPages with images.
6. Visit `http://localhost:3000/portfolio` — confirm gallery renders.
7. Adjust theme in CMS → hard refresh site — confirm colors/rounded corners change.
8. Add a Service detail page and verify filtering by service (implement on `/services/[slug]`).
9. Submit contact form → see the Lead in CMS.

---

## 9) Production Deployment

**Web (Next.js) on Vercel**
- Set `NEXT_PUBLIC_CMS_URL=https://cms.yourdomain.com`
- Build command: `pnpm build`, output Next default
- Add custom domains per tenant later (wildcard subdomain supported on Pro/Enterprise)

**CMS on Fly.io (example)**
- Dockerfile for Wagtail (gunicorn + whitenoise)  
- Attach managed Postgres (Fly Postgres)  
- S3 storage: AWS or Cloudflare R2  
- `CORS_ALLOWED_ORIGINS` to Vercel domain(s)

**Secrets**: store DB creds, S3 keys in platform secret stores.

**Migrations**: run on each deploy (`python manage.py migrate`).

**Media**: don’t use local disk in prod; only S3/R2.

**Domains**:
- CMS: `cms.yourdomain.com`
- Tenants: `site1.yourdomain.com`, later CNAME custom domains

---

## 10) Multi‑Tenant Evolution (SaaS)

**Option A: Wagtail Sites (simple)**
- Each client = a Wagtail Site bound to a hostname  
- Content trees isolated per Site; Theme per Site  
- Pro: easiest; Con: permissions and quotas are manual

**Option B: `django-tenants`**
- True schema‑per‑tenant
- Requires splitting shared vs tenant apps  
- Pro: hard isolation, per‑tenant backups; Con: more ops

**Routing in Next**
- Use `headers().get('host')` to map host → Site ID via an API  
- Cache site config with ISR (60–300s)  
- Per‑site sitemap and robots

**Billing**
- Add Stripe later; lock publish if past-due, keep read-only site for a grace period

---

## 11) Forms, Reviews, and Integrations

- **Leads**: DRF endpoint + email to business owner (SendGrid/SES).  
- **Google Reviews import**: CRON worker to cache top reviews by Place ID (render statically).  
- **Calendly/Cal.com**: inline booking on Contact page.  
- **Analytics**: Plausible/PostHog; record CTA clicks, gallery opens.  
- **Error Monitoring**: Sentry (web + cms).

---

## 12) Security & Compliance Checklist

- CORS allow‑list, not `*`  
- CSP headers (at least `img-src` for S3/CMS)  
- Admin behind VPN or IP allow‑list (optional)  
- CSRF on forms; hCaptcha/Turnstile  
- Regular DB backups; object storage lifecycle (infrequent access)  
- PII: store only what’s required (leads); add GDPR/CCPA privacy page

---

## 13) Performance Budget & Core Web Vitals

- First load JS < 150KB for marketing pages  
- Optimize images (width‑aware; use modern formats)  
- Lazy‑load lightbox & non‑critical components  
- Use Next’s `revalidate` for ISR; set CDN cache headers  
- Preconnect to CMS origin; HTTP/2/3 enabled

---

## 14) Makefile (quality of life)

```makefile
.PHONY: dev cms web seed

dev: ## run web+cms
	(cd apps/cms && uv run python manage.py runserver 0.0.0.0:8000) & \
	 (cd apps/web && pnpm dev)

cms:
	cd apps/cms && uv run python manage.py runserver 0.0.0.0:8000

web:
	cd apps/web && pnpm dev

seed:
	cd apps/cms && uv run python manage.py seed
```

---

## 15) What to Build First (the exact feature order)

1) **CMS data model** (Theme, Service, Project, Testimonial) + seed content  
2) **API** (Wagtail v2 endpoints)  
3) **Web skeleton** (layout, nav, footer, 404)  
4) **Home** with hero variants + service cards + testimonials  
5) **Portfolio** list with gallery + detail page  
6) **Service** list + detail (filtering projects by service)  
7) **Contact** with Lead POST + validation + email  
8) **Theme selector** wired from CMS (visual proof: colors/border radius change)  
9) **SEO** (metadata, sitemap, robots, JSON‑LD)  
10) **Playwright E2E** (smoke)  
11) **Deploy** (Vercel/Fly)  
12) **Docs** (editor guide: add a project, change theme, publish)  

---

## 16) Editor Guide (non‑technical users)

- Login at `/cms` → Add/Update Services  
- Go to Projects → “Add Project” → upload 10–20 photos → add city, service tags  
- Reorder images by drag‑and‑drop (Wagtail)  
- Publish → Site updates in ≤ 1 minute (ISR)  
- Change Theme colors → Save → Verify site branding updates  
- Use Contact page form to test email delivery (check spam)

---

## 17) Future Enhancements

- Before/After slider block (React Compare Image)  
- Video support via Mux uploads in CMS  
- Pricing calculator block (material x labor x complexity)  
- Multi‑tenant onboarding wizard in Next (site name, logo, colors, services)  
- Stripe billing + plan‑gated features  
- Theme marketplace (export/import JSON)  
- Content versioning with preview links (Wagtail has this built‑in)

---

## 18) Troubleshooting

- **Gallery images not loading** → Check CORS from CMS to web; ensure S3 bucket public read or signed URLs used.  
- **Theme not applying** → Confirm snippet API returns 200; inspect CSS variables at `<html>`/`<body>`.  
- **Slow TTFB** → Enable ISR revalidate and CDN caching; avoid client components on heavy pages.  
- **Broken images after deploy** → Use absolute CMS URL in production; don’t rely on relative paths.  
- **CSP blocking lightbox** → Add lightbox’s inline styles/script allowances or host assets locally.

---

## 19) Minimal Dockerfile (CMS)

```dockerfile
FROM python:3.11-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
RUN pip install --no-cache-dir uv
WORKDIR /app
COPY ./pyproject.toml ./uv.lock* ./
RUN uv sync --frozen --no-install-project
COPY . .
RUN uv pip install -e .
CMD ["uv", "run", "gunicorn", "core.wsgi:application", "-b", "0.0.0.0:8000", "-w", "3"]
```

---

## 20) Environment Variables (top-level `.env.example`)

```
# Web
NEXT_PUBLIC_CMS_URL=http://localhost:8000

# CMS
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=trades
POSTGRES_USER=trades
POSTGRES_PASSWORD=password
CORS_ALLOWED_ORIGINS=http://localhost:3000
USE_S3=0
AWS_STORAGE_BUCKET_NAME=
AWS_S3_ENDPOINT_URL=
AWS_S3_REGION_NAME=us-east-1
WAGTAILAPI_BASE_URL=http://localhost:8000
```

---

## 21) Definition of Done (per feature)

- **Code**: typed (TS), lint‑clean, unit tests  
- **UX**: mobile‑first, keyboard accessible, alt text set  
- **Perf**: LCP < 2.5s, CLS < 0.1  
- **SEO**: title/desc set, JSON‑LD present  
- **Docs**: README section updated  
- **E2E**: smoke test passes in CI
