# Repository Guidelines

## Project Structure & Module Organization

- apps/web: Next.js App Router (`app/`, `public/`, `src/`). Frontend UI.
- apps/cms: Django + Wagtail CMS (`website/`, `core/`). Local infra via Docker.
- packages/: Shared libraries — `ui` (components), `utils` (helpers), `schemas` (Zod types), plus `eslint-config` and `typescript-config`.
- scripts/: Repo utilities; root config files: `turbo.json`, `pnpm-workspace.yaml`, `eslint.config.js`, `.prettierrc`.

## Build, Test, and Development Commands

- Install: `pnpm install` (Node >= 18).
- Dev (all): `pnpm dev` (Turbo runs app tasks in parallel).
- Dev (single app): `pnpm -F web dev` or run CMS with `uv run python manage.py runserver`.
- Build: `pnpm build` (respects Turbo task graph).
- Lint/Format: `pnpm lint`, `pnpm format`.
- Types: `pnpm check-types` (TypeScript across packages/apps).
- Tests (JS/TS): `pnpm test` or `pnpm -F web test`. CMS tests: `cd apps/cms && uv run pytest`.

## Coding Style & Naming Conventions

- Formatter: Prettier (single quotes, semicolons, width 100). Run `pnpm format`.
- Linting: Flat ESLint config at root + `@repo/eslint-config`; no warnings allowed in CI (`--max-warnings 0`).
- TypeScript + ESM modules. Prefer strict typing; avoid `any`.
- Naming: PascalCase React components, camelCase variables/functions, kebab-case file names in `src/` and `app/`.

## Testing Guidelines

- Frontend: Vitest; co-locate tests as `*.test.ts(x)` near source.
- CMS: Pytest; Django settings via `apps/cms/.env`.
- Coverage outputs to `coverage/` (Turbo caches unless disabled).

## Commit & Pull Request Guidelines

- Conventional Commits enforced by Commitlint/Husky (e.g., `feat(web): add gallery lightbox`).
- Pre-commit runs lint-staged (Prettier + ESLint). Keep diffs focused and formatted.
- PRs: include clear description, scope (web/cms/ui/schemas), linked issues, and screenshots for UI changes. Ensure `pnpm lint`, `pnpm test`, and CMS tests pass.

## Security & Configuration Tips

- Env files: root `.env.example`; use `apps/web/.env.local` and `apps/cms/.env`. Never commit secrets.
- CMS infra: `cd apps/cms && docker compose up -d` (Postgres + MinIO).
- For web dev, set `NEXT_PUBLIC_CMS_URL` (e.g., `http://localhost:8000`).
