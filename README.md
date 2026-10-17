# CrewOS App Template

Universal Next.js 14 landing page template. Cloned and deployed by Sam (DevOps agent) via `app_build_generate`, then configured with `app_build_env_set`.

## What's included

- **Hero** — tagline, CTA buttons, scroll indicator
- **Services grid** — up to 6 services from env vars (defaults to generic cards)
- **About section** — business overview with stats
- **Contact / Booking tabs**
  - Contact form → saves lead to CrewOS CRM (Supabase `crm_leads`)
  - Booking form → creates Google Calendar event with Meet link (when GCal tokens are set)
  - Tabs only show if GCal is configured; otherwise only the contact form appears
- **Navbar** — sticky with mobile hamburger menu
- **Footer** — links, contact info, social icons

## Sam's deployment checklist

1. `app_scaffold` — creates the Vercel project
2. `app_build_generate` — clones this template into a new repo via GitHub template API
3. `app_build_env_set` — sets all env vars below
4. `app_build_domain_add` — attaches the client's domain

## Required env vars

Copy `.env.example` and fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BUSINESS_NAME` | Business display name |
| `NEXT_PUBLIC_BUSINESS_TAGLINE` | Hero headline |
| `NEXT_PUBLIC_BUSINESS_DESCRIPTION` | Hero sub-copy |
| `NEXT_PUBLIC_BUSINESS_PHONE` | Phone (shown in navbar, footer, hero) |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | Email (shown in footer, contact section) |
| `NEXT_PUBLIC_BUSINESS_ADDRESS` | Street address |
| `NEXT_PUBLIC_BRAND_500` | Primary brand color (hex) |
| `NEXT_PUBLIC_BRAND_600` | Darker brand color for hover states |
| `NEXT_PUBLIC_SERVICE_1` … `_6` | `"Title\|Description"` — pipe-separated |
| `CREWOS_SUPABASE_URL` | Workspace Supabase URL |
| `CREWOS_SUPABASE_SERVICE_KEY` | Service role key (server-side only) |
| `CREWOS_WORKSPACE_ID` | Workspace UUID |

### Optional — Google Calendar booking form

| Variable | Description |
|---|---|
| `CREWOS_GCAL_ACCESS_TOKEN` | OAuth2 access token |
| `CREWOS_GCAL_REFRESH_TOKEN` | OAuth2 refresh token |
| `CREWOS_GCAL_CALENDAR_ID` | Calendar ID (default: `primary`) |
| `CREWOS_GCAL_TIMEZONE` | IANA timezone (default: `America/Chicago`) |

If these are blank, the "Book an Appointment" tab is hidden and only the contact form shows.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your values
npm run dev
```

## Tech stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS 3
- TypeScript

---

*Part of the CrewOS platform. Template repo: `mannmade10-creator/crewos-app-template`*
