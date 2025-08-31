# Trades Website App — Cursor/Windows-Friendly Build Guide (Next.js + Tailwind + Wagtail Headless)

This version rewrites the original 100× guide for **Cursor on Windows (PowerShell)** and **macOS/Linux (bash/zsh)** with **no chained commands** (`&&`, `\` continuations) and explicit, one-per-line steps. Use the shell blocks that match your OS.

> Tech stack: **Next.js (App Router) + Tailwind CSS** for the frontend, **Wagtail (Django) Headless** for content, **Postgres + S3/MinIO** for storage. Monorepo via Turborepo.

---

## 0) Prerequisites

### Windows (PowerShell)

1. Install **Node 20+** (includes Corepack).
2. Enable PNPM:
   ```powershell
   corepack enable
   corepack prepare pnpm@latest --activate
   ```
3. Install **Python 3.11+** (add to PATH).
4. Install **pipx**:
   ```powershell
   python -m pip install --user pipx
   pipx ensurepath
   # Close and reopen your terminal if 'pipx' is not recognized.
   ```
5. Install **uv** (optional, used below; you can also use venv+pip):
   ```powershell
   pipx install uv
   ```
6. Install **Docker Desktop**.
7. Install **Git** and **VS Code/Cursor**.

### macOS / Linux (bash/zsh)

```bash
# Node 20+ (use fnm/nvm/asdf), then:
corepack enable
corepack prepare pnpm@latest --activate

# Python 3.11+ and pipx
python3 -m pip install --user pipx
pipx ensurepath

# uv
pipx install uv

# Docker + Git + VS Code/Cursor as usual
```

> Recommended VS Code/Cursor extensions: ESLint, Prettier, Tailwind IntelliSense, Python, ruff, Docker.

---

## 1) Create the Monorepo (Turborepo)

### Windows (PowerShell)

```powershell
New-Item -ItemType Directory -Path C:\Repos\trades-website-app -Force | Out-Null
Set-Location C:\Repos\trades-website-app

pnpm dlx create-turbo@latest .
# When prompted, choose: Empty starter

pnpm add -w -D prettier eslint typescript @types/node turbo
```

### macOS / Linux (bash/zsh)

```bash
mkdir -p ~/Repos/trades-website-app
cd ~/Repos/trades-website-app

pnpm dlx create-turbo@latest .
# Choose: Empty starter

pnpm add -w -D prettier eslint typescript @types/node turbo
```

Create the folders we’ll use:

```powershell
# Windows PS
New-Item -ItemType Directory -Path .\apps\web -Force | Out-Null
New-Item -ItemType Directory -Path .\apps\cms -Force | Out-Null
New-Item -ItemType Directory -Path .\packages\ui -Force | Out-Null
New-Item -ItemType Directory -Path .\packages\schemas -Force | Out-Null
New-Item -ItemType Directory -Path .\packages\utils -Force | Out-Null
```

---

## 2) CMS Bootstrap (`apps/cms`) — Wagtail Headless

You can use **uv** (fast) or plain **venv + pip**. Pick ONE path.

### Option A — Using `uv` (PowerShell)

```powershell
Set-Location C:\Repos\trades-website-app\apps
uv init --python 3.11 cms
Set-Location .\cms

uv add django==5.*
uv add wagtail==6.*
uv add djangorestframework
uv add django-cors-headers
uv add "psycopg[binary]"
uv add django-storages
uv add boto3
uv add whitenoise
uv add gunicorn
uv add python-dotenv
uv add pillow

uv add --dev ruff
uv add --dev pytest
uv add --dev pytest-django
uv add --dev model-bakery
```

### Option B — Using `venv + pip` (PowerShell)

```powershell
Set-Location C:\Repos\trades-website-app\apps\cms
python -m venv .venv
.\.venv\Scripts\Activate.ps1

python -m pip install --upgrade pip
pip install "Django==5.*"
pip install "wagtail==6.*"
pip install djangorestframework
pip install django-cors-headers
pip install "psycopg[binary]"
pip install django-storages boto3 whitenoise gunicorn python-dotenv pillow
pip install -U ruff pytest pytest-django model-bakery
```

### Create the Django project/app

```powershell
# If using uv
uv run django-admin startproject core .
uv run python manage.py startapp sitecontent

# If using venv+pip, just call 'python' instead of 'uv run'
# python manage.py startapp sitecontent
```

### Configure `core/settings.py`

- Add apps/middleware for Wagtail, DRF, CORS, storages, Whitenoise.
- Configure Postgres via env vars.
- Configure media/static and optional S3/MinIO.
- Set `CORS_ALLOWED_ORIGINS` to your web origin.

### Configure URLs `core/urls.py`

- Include `wagtail.api.v2`, documents, and `wagtail_urls` at `/cms`.

### Models `sitecontent/models.py`

- Add `Theme` (snippet), `Service` (snippet), `ProjectIndexPage`, `ProjectPage`, `Testimonial`.

### Apply migrations and create a superuser

```powershell
# Using uv
uv run python manage.py makemigrations
uv run python manage.py migrate
uv run python manage.py createsuperuser
```

---

## 3) Local Infra: Postgres + MinIO (S3) via Docker

Create `apps/cms\docker-compose.yml`.

```yaml
version: '3.9'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: trades
      POSTGRES_PASSWORD: password
      POSTGRES_DB: trades
    ports: ['5432:5432']
    volumes: [db:/var/lib/postgresql/data]

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    ports: ['9000:9000', '9001:9001']
    volumes: [minio:/data]

volumes:
  db:
  minio:
```

### Create `.env` for the CMS (PowerShell)

```powershell
Set-Location C:\Repos\trades-website-app\apps\cms

# Ensure the file exists
New-Item -ItemType File -Path .env -Force | Out-Null

Set-Content -Path .env -Value "POSTGRES_HOST=localhost"
Add-Content -Path .env -Value "POSTGRES_PORT=5432"
Add-Content -Path .env -Value "POSTGRES_DB=trades"
Add-Content -Path .env -Value "POSTGRES_USER=trades"
Add-Content -Path .env -Value "POSTGRES_PASSWORD=password"
Add-Content -Path .env -Value "CORS_ALLOWED_ORIGINS=http://localhost:3000"
Add-Content -Path .env -Value "USE_S3=1"
Add-Content -Path .env -Value "AWS_STORAGE_BUCKET_NAME=trades-bucket"
Add-Content -Path .env -Value "AWS_S3_ENDPOINT_URL=http://localhost:9000"
Add-Content -Path .env -Value "AWS_S3_REGION_NAME=us-east-1"
Add-Content -Path .env -Value "WAGTAILAPI_BASE_URL=http://localhost:8000"
```

### Start services and run the CMS

```powershell
# From apps/cms
docker compose up -d

# Using uv
uv run python manage.py runserver 0.0.0.0:8000

# Visit http://localhost:8000/cms and log in
```

---

## 4) Expose Read API (Wagtail API v2)

- Pages: `/api/v2/pages/?type=sitecontent.ProjectPage&fields=services,city,date,gallery,description`
- Images: `/api/v2/images/`
- Snippets: `/api/v2/snippets/` (Theme, Service, Testimonial)

(Optional) Add DRF viewsets if you need custom filters; remember to wire with a DRF router.

---

## 5) Frontend Bootstrap (`apps/web`) — Next.js + Tailwind

### Create the Next.js app

```powershell
Set-Location C:\Repos\trades-website-app\apps

pnpm dlx create-next-app@latest web --ts --eslint --src-dir --app --tailwind --import-alias "@/*"
Set-Location .\web

pnpm add zod swr @tanstack/react-query yet-another-react-lightbox react-hook-form
pnpm add -D @types/node @types/react @tailwindcss/typography @tailwindcss/forms
```

### Theme tokens via CSS variables

Edit `apps/web/src/app/globals.css` and add:

```css
:root {
  --color-primary: #0ea5e9;
  --color-accent: #22c55e;
  --color-neutral: #0f172a;
  --radius: 1rem;
}

@layer base {
  html {
    color-scheme: light;
  }
  body {
    @apply text-slate-800 bg-white;
  }
}

@layer utilities {
  .card {
    @apply rounded-2xl shadow-lg p-6 bg-white;
    border-radius: var(--radius);
  }
  .btn-primary {
    @apply inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-medium;
    background: var(--color-primary);
    color: white;
  }
}
```

### CMS fetch helpers

Create `apps/web/src/lib/cms.ts`:

```ts
export const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:8000';

export async function fetchTheme() {
  const res = await fetch(`${CMS_URL}/api/v2/snippets/sitecontent_theme/`, {
    next: { revalidate: 60 },
  });
  const json = await res.json();
  const theme = json.items?.[0];
  return theme;
}
```

Apply in `apps/web/src/app/layout.tsx`:

```tsx
import './globals.css';
import { fetchTheme } from '@/lib/cms';
import type { ReactNode } from 'react';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const theme = await fetchTheme();
  const style = {
    '--color-primary': theme?.brand_color ?? '#0ea5e9',
    '--color-accent': theme?.accent ?? '#22c55e',
    '--color-neutral': theme?.neutral ?? '#0f172a',
    '--radius': theme?.radius ?? '1rem',
  } as React.CSSProperties;

  return (
    <html lang="en">
      <body style={style}>{children}</body>
    </html>
  );
}
```

### Routes skeleton

Create these files under `apps/web/src/app`:

```
(app)/(marketing)/page.tsx
(app)/(marketing)/services/page.tsx
(app)/(marketing)/services/[slug]/page.tsx
(app)/(marketing)/portfolio/page.tsx
(app)/(marketing)/portfolio/[id]/page.tsx
(app)/(marketing)/reviews/page.tsx
(app)/(marketing)/about/page.tsx
(app)/(marketing)/areas/page.tsx
(app)/(marketing)/pricing/page.tsx
(app)/(marketing)/blog/page.tsx
(app)/(marketing)/contact/page.tsx
```

### Portfolio data helper

Create `apps/web/src/lib/projects.ts`:

```ts
import { CMS_URL } from './cms';

export async function fetchProjects() {
  const url = `${CMS_URL}/api/v2/pages/?type=sitecontent.ProjectPage&fields=city,date,gallery,services&order=-first_published_at`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();
  return data.items as any[];
}
```

### Gallery component

Create `apps/web/src/components/Gallery.tsx`:

```tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

export default function Gallery({
  images,
}: {
  images: { src: string; width: number; height: number; alt?: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]"></div>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]">
        {images.map((img, i) => (
          <button
            key={i}
            className="mb-4 w-full"
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
          >
            <Image
              src={img.src}
              alt={img.alt || ''}
              width={img.width}
              height={img.height}
              className="w-full h-auto rounded-xl shadow"
              placeholder="blur"
              blurDataURL={img.src + '?w=20&q=10'}
            />
          </button>
        ))}
      </div>
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={index}
        slides={images.map((i) => ({ src: i.src }))}
      />
    </>
  );
}
```

### Portfolio page

Create `apps/web/src/app/(marketing)/portfolio/page.tsx`:

```tsx
import { fetchProjects } from '@/lib/projects';
import Gallery from '@/components/Gallery';
import { CMS_URL } from '@/lib/cms';

export default async function PortfolioPage() {
  const projects = await fetchProjects();
  const images = projects.flatMap((p: any) =>
    (p.gallery || []).map((img: any) => ({
      src: `${CMS_URL}${img.value.meta.download_url}`.replace(
        '/original_images/',
        '/fills/1200x0/',
      ),
      width: img.value.width || 1200,
      height: img.value.height || 800,
      alt: p.title,
    })),
  );
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Our Work</h1>
      <Gallery images={images} />
    </main>
  );
}
```

---

## 6) Run Everything Locally (exact order)

### Start DB + MinIO

```powershell
Set-Location C:\Repos\trades-website-app\apps\cms
docker compose up -d
```

### Run CMS

```powershell
# Using uv
uv run python manage.py runserver 0.0.0.0:8000
# Visit http://localhost:8000/cms and log in (use your superuser)
```

### Run Web

Open a new terminal:

```powershell
Set-Location C:\Repos\trades-website-app\apps\web
$env:NEXT_PUBLIC_CMS_URL = "http://localhost:8000"
pnpm dev
# Visit http://localhost:3000/portfolio
```

Add Services/Themes/Projects in Wagtail and verify the gallery renders. Change Theme colors and confirm the site updates after a refresh (ISR revalidate).

---

## 7) Contact Form and Leads (later)

- Add a `Lead` model + DRF endpoint in CMS.
- In Next, create a server action/route that POSTs to `/api/leads/`.
- Add basic spam protection (Cloudflare Turnstile/hCaptcha).

---

## 8) Production Notes (no chains)

- Vercel for `apps/web` (set `NEXT_PUBLIC_CMS_URL`).
- Fly.io/Render/DO for `apps/cms` (Postgres managed + S3/R2).
- Use secrets managers; run `python manage.py migrate` on deploy.

---

## 9) PowerShell Tips for Cursor

- Do **not** use `&&` or `\` continuations.
- Use `Set-Content` to create files and `Add-Content` to append.
- Use **absolute** `Set-Location` paths if Cursor opens new shells per task.
- If `pipx` isn’t recognized, reopen the terminal after `pipx ensurepath`.
- If ports are busy, stop old containers: `docker compose down` then `up -d`.

---

## 10) Definition of Done (per feature)

- Code typed (TS), lint-clean, unit tests.
- Mobile-first; accessible; alt text on images.
- SEO metadata + JSON-LD in place.
- Core Web Vitals: LCP < 2.5s, CLS < 0.1.
- E2E smoke passes; README/docs updated.
