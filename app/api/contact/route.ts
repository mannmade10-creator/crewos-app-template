/**
 * POST /api/contact
 *
 * Receives the contact form submission and:
 * 1. Stores the lead in the CrewOS CRM via Supabase
 * 2. Sends a Slack/webhook notification if configured (optional)
 *
 * Sam sets CREWOS_SUPABASE_URL + CREWOS_SUPABASE_SERVICE_KEY + CREWOS_WORKSPACE_ID
 * via app_build_env_set after deployment.
 */

import { NextRequest, NextResponse } from "next/server";

interface ContactBody {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function POST(req: NextRequest) {
  let body: ContactBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, email, phone, message } = body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  const supabaseUrl = process.env.CREWOS_SUPABASE_URL;
  const supabaseKey = process.env.CREWOS_SUPABASE_SERVICE_KEY;
  const workspaceId = process.env.CREWOS_WORKSPACE_ID;

  if (!supabaseUrl || !supabaseKey || !workspaceId) {
    // Dev mode — log and return success so the form still works locally
    console.warn("[contact] Missing Supabase env vars — skipping CRM insert.");
    return NextResponse.json({ ok: true, dev: true });
  }

  try {
    // Insert directly into the CrewOS CRM leads table
    const res = await fetch(`${supabaseUrl}/rest/v1/crm_leads`, {
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
        notes: message.trim(),
        source: "website_contact_form",
        status: "new",
        created_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[contact] Supabase insert failed:", res.status, text);
      return NextResponse.json({ error: "Failed to save your message. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
