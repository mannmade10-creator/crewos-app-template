// lib/config.ts
// All business-specific values come from environment variables injected by
// CrewOS's app_build_env_set executor at deploy time. Nothing here is
// hard-coded — swap the env vars to white-label this app for any client.

export const config = {
  business: {
    name: process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "My Business",
    tagline: process.env.NEXT_PUBLIC_BUSINESS_TAGLINE ?? "",
    phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? "",
    email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL ?? "",
    address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "",
    website: process.env.NEXT_PUBLIC_BUSINESS_WEBSITE ?? "",
  },
  brand: {
    color50:  process.env.NEXT_PUBLIC_BRAND_50  ?? "#f0fdf4",
    color100: process.env.NEXT_PUBLIC_BRAND_100 ?? "#dcfce7",
    color500: process.env.NEXT_PUBLIC_BRAND_500 ?? "#22c55e",
    color600: process.env.NEXT_PUBLIC_BRAND_600 ?? "#16a34a",
    color700: process.env.NEXT_PUBLIC_BRAND_700 ?? "#15803d",
    color900: process.env.NEXT_PUBLIC_BRAND_900 ?? "#14532d",
  },
  social: {
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? "",
    facebook:  process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK  ?? "",
    twitter:   process.env.NEXT_PUBLIC_SOCIAL_TWITTER   ?? "",
    tiktok:    process.env.NEXT_PUBLIC_SOCIAL_TIKTOK    ?? "",
    youtube:   process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE   ?? "",
  },
  services: [
    process.env.NEXT_PUBLIC_SERVICE_1 ?? "",
    process.env.NEXT_PUBLIC_SERVICE_2 ?? "",
    process.env.NEXT_PUBLIC_SERVICE_3 ?? "",
    process.env.NEXT_PUBLIC_SERVICE_4 ?? "",
    process.env.NEXT_PUBLIC_SERVICE_5 ?? "",
    process.env.NEXT_PUBLIC_SERVICE_6 ?? "",
  ].filter(Boolean),
  crewos: {
    supabaseUrl:  process.env.CREWOS_SUPABASE_URL  ?? "",
    supabaseKey:  process.env.CREWOS_SUPABASE_ANON_KEY ?? "",
    workspaceId:  process.env.CREWOS_WORKSPACE_ID  ?? "",
  },
};
