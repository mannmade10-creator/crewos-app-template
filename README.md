# CrewOS App Template

Universal Next.js + Tailwind starter cloned by CrewOS when building client apps and websites.

All business-specific values are injected via environment variables — no code changes needed to white-label for a new client.

## How it works

1. CrewOS's `app_build_generate` tool clones this repo via the GitHub template API
2. `app_build_env_set` injects the client's env vars into Vercel
3. `app_build_domain_add` wires up their custom domain

## Required env vars

See `.env.example` for the full list.

## Local dev

```bash
cp .env.example .env.local
# Fill in your values
npm install
npm run dev
```
