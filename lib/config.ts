/**
 * lib/config.ts
 * Central config helper — reads env vars set by Sam via app_build_env_set.
 * All NEXT_PUBLIC_* vars are available client + server; private vars are server-only.
 */

export interface ServiceItem {
  title: string;
  description: string;
}

function parseService(raw: string | undefined): ServiceItem | null {
  if (!raw) return null;
  const [title, description] = raw.split("|");
  if (!title?.trim()) return null;
  return { title: title.trim(), description: (description ?? "").trim() };
}

export const config = {
  // ── Business identity ────────────────────────────────────────────────────
  name:        process.env.NEXT_PUBLIC_BUSINESS_NAME        ?? "Your Business",
  tagline:     process.env.NEXT_PUBLIC_BUSINESS_TAGLINE     ?? "We're here to help.",
  description: process.env.NEXT_PUBLIC_BUSINESS_DESCRIPTION ?? "",
  phone:       process.env.NEXT_PUBLIC_BUSINESS_PHONE       ?? "",
  email:       process.env.NEXT_PUBLIC_BUSINESS_EMAIL       ?? "",
  address:     process.env.NEXT_PUBLIC_BUSINESS_ADDRESS     ?? "",
  type:        (process.env.NEXT_PUBLIC_BUSINESS_TYPE       ?? "service") as "service" | "ecommerce" | "saas",

  // ── Brand colors ─────────────────────────────────────────────────────────
  brand: {
    50:  process.env.NEXT_PUBLIC_BRAND_50  ?? "#f0f9ff",
    100: process.env.NEXT_PUBLIC_BRAND_100 ?? "#e0f2fe",
    500: process.env.NEXT_PUBLIC_BRAND_500 ?? "#0ea5e9",
    600: process.env.NEXT_PUBLIC_BRAND_600 ?? "#0284c7",
    700: process.env.NEXT_PUBLIC_BRAND_700 ?? "#0369a1",
    900: process.env.NEXT_PUBLIC_BRAND_900 ?? "#0c4a6e",
  },

  // ── Services list (up to 6) ───────────────────────────────────────────────
  services: [
    parseService(process.env.NEXT_PUBLIC_SERVICE_1),
    parseService(process.env.NEXT_PUBLIC_SERVICE_2),
    parseService(process.env.NEXT_PUBLIC_SERVICE_3),
    parseService(process.env.NEXT_PUBLIC_SERVICE_4),
    parseService(process.env.NEXT_PUBLIC_SERVICE_5),
    parseService(process.env.NEXT_PUBLIC_SERVICE_6),
  ].filter(Boolean) as ServiceItem[],

  // ── Social links ─────────────────────────────────────────────────────────
  social: {
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? "",
    facebook:  process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK  ?? "",
    tiktok:    process.env.NEXT_PUBLIC_SOCIAL_TIKTOK    ?? "",
    twitter:   process.env.NEXT_PUBLIC_SOCIAL_TWITTER   ?? "",
  },

  // ── Server-side CrewOS backend (never expose to client) ──────────────────
  crewos: {
    supabaseUrl:       process.env.CREWOS_SUPABASE_URL        ?? "",
    supabaseServiceKey: process.env.CREWOS_SUPABASE_SERVICE_KEY ?? "",
    workspaceId:       process.env.CREWOS_WORKSPACE_ID        ?? "",
  },

  // ── Google Calendar (server-side, optional) ───────────────────────────────
  gcal: {
    accessToken:  process.env.CREWOS_GCAL_ACCESS_TOKEN  ?? "",
    refreshToken: process.env.CREWOS_GCAL_REFRESH_TOKEN ?? "",
    calendarId:   process.env.CREWOS_GCAL_CALENDAR_ID   ?? "primary",
    timezone:     process.env.CREWOS_GCAL_TIMEZONE       ?? "America/Chicago",
  },

  // ── Feature flags derived from config ─────────────────────────────────────
  get hasBooking() {
    return Boolean(this.gcal.accessToken && this.gcal.refreshToken);
  },
  get hasPhone() { return Boolean(this.phone); },
  get hasAddress() { return Boolean(this.address); },
} as const;
