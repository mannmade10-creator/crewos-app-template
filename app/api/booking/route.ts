/**
 * POST /api/booking
 *
 * Receives the booking form submission and:
 * 1. Creates a Google Calendar event with a Google Meet link
 * 2. Stores the lead in the CrewOS CRM
 *
 * Required env vars (set by Sam via app_build_env_set):
 *   CREWOS_GCAL_ACCESS_TOKEN   — OAuth2 access token
 *   CREWOS_GCAL_REFRESH_TOKEN  — OAuth2 refresh token
 *   CREWOS_GCAL_CALENDAR_ID    — calendar ID (default: "primary")
 *   CREWOS_GCAL_TIMEZONE       — IANA timezone (default: "America/Chicago")
 *   CREWOS_SUPABASE_URL        — for CRM lead
 *   CREWOS_SUPABASE_SERVICE_KEY
 *   CREWOS_WORKSPACE_ID
 *
 * Google Cloud project must have the Calendar API enabled and the tokens
 * issued with scope: https://www.googleapis.com/auth/calendar
 */

import { NextRequest, NextResponse } from "next/server";

interface BookingBody {
  name: string;
  email: string;
  phone?: string;
  date: string;   // YYYY-MM-DD
  time: string;   // "9:00 AM"
  notes?: string;
}

/** Convert "9:00 AM" + "YYYY-MM-DD" into an ISO datetime string */
function toISO(date: string, time: string, tz: string): string {
  // Parse "9:00 AM" / "10:30 AM" / "1:00 PM"
  const [rawTime, period] = time.split(" ");
  let [hours, minutes] = rawTime.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  // Build a local time string for the Intl API
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date}T${pad(hours)}:${pad(minutes)}:00`;
}

/** Refresh the Google Calendar access token */
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID     ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: refreshToken,
      grant_type:    "refresh_token",
    }),
  });
  if (!res.ok) throw new Error("Failed to refresh Google token.");
  const data = await res.json();
  return data.access_token as string;
}

export async function POST(req: NextRequest) {
  let body: BookingBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, phone, date, time, notes } = body;

  if (!name?.trim() || !email?.trim() || !date || !time) {
    return NextResponse.json({ error: "Name, email, date, and time are required." }, { status: 400 });
  }

  const accessToken  = process.env.CREWOS_GCAL_ACCESS_TOKEN;
  const refreshToken = process.env.CREWOS_GCAL_REFRESH_TOKEN;
  const calendarId   = process.env.CREWOS_GCAL_CALENDAR_ID  ?? "primary";
  const timezone     = process.env.CREWOS_GCAL_TIMEZONE      ?? "America/Chicago";

  if (!accessToken || !refreshToken) {
    // Booking not configured — fall through to contact-only
    return NextResponse.json({ error: "Booking is not configured for this site." }, { status: 503 });
  }

  const supabaseUrl = process.env.CREWOS_SUPABASE_URL;
  const supabaseKey = process.env.CREWOS_SUPABASE_SERVICE_KEY;
  const workspaceId = process.env.CREWOS_WORKSPACE_ID;

  const startLocal = toISO(date, time, timezone);
  // Default to 30-minute appointment
  const endDate   = new Date(`${startLocal}:00`);
  endDate.setMinutes(endDate.getMinutes() + 30);
  const endLocal = endDate.toISOString().slice(0, 16);

  const event = {
    summary: `Consultation: ${name.trim()}`,
    description: [
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      phone ? `Phone: ${phone.trim()}` : null,
      notes?.trim() ? `Notes: ${notes.trim()}` : null,
    ].filter(Boolean).join("\n"),
    start: { dateTime: `${startLocal}:00`, timeZone: timezone },
    end:   { dateTime: `${endLocal}:00`,   timeZone: timezone },
    attendees: [{ email: email.trim() }],
    conferenceData: {
      createRequest: {
        requestId: `crewos-${Date.now()}`,
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  try {
    // Try with current token first, refresh on 401
    let token = accessToken;
    let calRes = await createEvent(calendarId, event, token);

    if (calRes.status === 401 && refreshToken) {
      token = await refreshAccessToken(refreshToken);
      calRes = await createEvent(calendarId, event, token);
    }

    if (!calRes.ok) {
      const text = await calRes.text();
      console.error("[booking] Calendar API error:", calRes.status, text);
      return NextResponse.json({ error: "Failed to create calendar event." }, { status: 500 });
    }

    // Also save to CRM
    if (supabaseUrl && supabaseKey && workspaceId) {
      await fetch(`${supabaseUrl}/rest/v1/crm_leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Prefer": "return=minimal",
        },
        body: JSON.stringify({
          workspace_id: workspaceId,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone?.trim() ?? null,
          notes: notes?.trim() ?? null,
          source: "website_booking_form",
          status: "booked",
          appointment_at: `${startLocal}:00`,
          created_at: new Date().toISOString(),
        }),
      }).catch((e) => console.warn("[booking] CRM insert failed:", e));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[booking] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

async function createEvent(calendarId: string, event: object, token: string) {
  return fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1&sendNotifications=true`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(event),
    }
  );
}
