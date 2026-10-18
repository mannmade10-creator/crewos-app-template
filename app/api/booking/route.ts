import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL        = process.env.CREWOS_SUPABASE_URL        ?? "";
const SUPABASE_SERVICE_KEY = process.env.CREWOS_SUPABASE_SERVICE_KEY ?? "";
const WORKSPACE_ID        = process.env.CREWOS_WORKSPACE_ID        ?? "";
const RESEND_API_KEY      = process.env.RESEND_API_KEY              ?? "";
const OWNER_EMAIL         = process.env.BUSINESS_OWNER_EMAIL        ?? "";
const FROM_EMAIL          = process.env.BOOKING_FROM_EMAIL          ?? "noreply@notifications.crewwos.com";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, service, preferred_date, time, notes } = body;

    if (!name?.trim() || !email?.trim() || !service?.trim()) {
      return NextResponse.json({ error: "Name, email, and service are required." }, { status: 400 });
    }

    // ── Dev mode fallback ────────────────────────────────────────────────────
    const devMode = !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !WORKSPACE_ID;
    if (devMode) {
      console.log("[booking] Dev mode — skipping Supabase + Resend");
      return NextResponse.json({ ok: true, dev: true });
    }

    // ── Write to Supabase ────────────────────────────────────────────────────
    const preferredDateTime = preferred_date && time ? `${preferred_date} ${time}` : preferred_date ?? null;

    const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        workspace_id:   WORKSPACE_ID,
        name:           name.trim(),
        email:          email.trim().toLowerCase(),
        phone:          phone?.trim() ?? null,
        service:        service.trim(),
        preferred_date: preferredDateTime,
        notes:          notes?.trim() ?? null,
        status:         "pending",
        created_at:     new Date().toISOString(),
      }),
    });

    if (!sbRes.ok) {
      const text = await sbRes.text();
      console.error("[booking] Supabase insert failed:", sbRes.status, text);
      return NextResponse.json({ error: "Failed to save booking." }, { status: 500 });
    }

    // ── Send Resend notification email ───────────────────────────────────────
    if (RESEND_API_KEY && OWNER_EMAIL) {
      const dateLabel = preferredDateTime ?? "No date specified";
      const emailBody = {
        from: FROM_EMAIL,
        to:   OWNER_EMAIL,
        subject: `New Booking Request — ${service.trim()}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px">
            <h2 style="margin:0 0 16px;font-size:20px;color:#0f172a">📅 New Booking Request</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155">
              <tr><td style="padding:8px 0;font-weight:600;width:120px">Name</td><td>${name.trim()}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600">Email</td><td>${email.trim()}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600">Phone</td><td>${phone?.trim() || "—"}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600">Service</td><td>${service.trim()}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600">Date / Time</td><td>${dateLabel}</td></tr>
              <tr><td style="padding:8px 0;font-weight:600">Notes</td><td>${notes?.trim() || "—"}</td></tr>
            </table>
            <hr style="margin:20px 0;border:none;border-top:1px solid #e2e8f0"/>
            <p style="font-size:12px;color:#94a3b8;margin:0">Sent by CrewOS · Reply directly to ${email.trim()}</p>
          </div>
        `,
        reply_to: email.trim(),
      };

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify(emailBody),
      });

      if (!resendRes.ok) {
        const text = await resendRes.text();
        // Non-fatal — booking is saved, just log the email failure
        console.warn("[booking] Resend email failed:", resendRes.status, text);
      } else {
        console.log("[booking] Resend email sent to", OWNER_EMAIL);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[booking] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
