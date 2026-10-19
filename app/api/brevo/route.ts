/**
 * /api/brevo — CrewwOS Brevo Integration
 *
 * Used by AI agents (Alex, Maya, Jordan, Riley, Morgan, etc.) to:
 *   - Add / update contacts
 *   - Add contacts to lists (triggers automations)
 *   - Send transactional emails
 *   - Create deals in the CRM pipeline
 *   - Fire email campaigns
 *
 * All actions require action= in the request body.
 */

import { NextRequest, NextResponse } from "next/server";

const BREVO_API = "https://api.brevo.com/v3";
const API_KEY = process.env.BREVO_API_KEY!;
const SENDER_NAME = process.env.BREVO_SENDER_NAME ?? "Kenneth from CrewwOS";
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL ?? "support@crewwos.com";

function brevoHeaders() {
  return {
    "api-key": API_KEY,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function brevoFetch(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  body?: object
) {
  const res = await fetch(`${BREVO_API}${path}`, {
    method,
    headers: brevoHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(
      `Brevo ${method} ${path} → ${res.status}: ${JSON.stringify(data)}`
    );
  }

  return data;
}

// ─── Action handlers ──────────────────────────────────────────────────────────

/** Add or update a contact, then optionally add them to a list */
async function addContact(body: {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  listIds?: number[];
  attributes?: Record<string, unknown>;
}) {
  return brevoFetch("/contacts", "POST", {
    email: body.email,
    attributes: {
      FIRSTNAME: body.firstName ?? "",
      LASTNAME: body.lastName ?? "",
      COMPANY: body.company ?? "",
      SMS: body.phone ?? "",
      ...body.attributes,
    },
    listIds: body.listIds ?? [],
    updateEnabled: true, // upsert — won't throw if contact already exists
  });
}

/** Add an existing contact to a list (triggers Brevo automation) */
async function addToList(body: { email: string; listId: number }) {
  return brevoFetch(`/contacts/lists/${body.listId}/contacts/add`, "POST", {
    emails: [body.email],
  });
}

/** Remove a contact from a list */
async function removeFromList(body: { email: string; listId: number }) {
  return brevoFetch(`/contacts/lists/${body.listId}/contacts/remove`, "POST", {
    emails: [body.email],
  });
}

/** Send a transactional email (1-on-1, agent-to-lead) */
async function sendEmail(body: {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: { email: string; name?: string };
  tags?: string[];
}) {
  return brevoFetch("/smtp/email", "POST", {
    sender: { name: SENDER_NAME, email: SENDER_EMAIL },
    to: body.to,
    subject: body.subject,
    htmlContent: body.htmlContent,
    textContent: body.textContent,
    replyTo: body.replyTo ?? { email: SENDER_EMAIL, name: SENDER_NAME },
    tags: body.tags ?? ["crewwos-agent"],
  });
}

/** Get all lists (so agents can look up list IDs) */
async function getLists() {
  return brevoFetch("/contacts/lists?limit=50&offset=0", "GET");
}

/** Get contact info by email */
async function getContact(email: string) {
  return brevoFetch(
    `/contacts/${encodeURIComponent(email)}`,
    "GET"
  );
}

/** Create a deal in Brevo CRM pipeline */
async function createDeal(body: {
  name: string;
  pipelineId?: string;
  stageId?: string;
  amount?: number;
  contactEmail?: string;
  attributes?: Record<string, unknown>;
}) {
  const deal = await brevoFetch("/crm/deals", "POST", {
    name: body.name,
    attributes: {
      amount: body.amount,
      ...body.attributes,
    },
  });

  // If a contact email is provided, link the deal to them
  if (body.contactEmail && (deal as { id?: string }).id) {
    const contact = (await getContact(body.contactEmail).catch(() => null)) as { id?: string } | null;
    if (contact?.id) {
      await brevoFetch(`/crm/deals/link-unlink/${(deal as { id: string }).id}`, "PATCH", {
        linkContactIds: [Number(contact.id)],
      });
    }
  }

  return deal;
}

/** Tag a contact (add attribute) — used by Nia to mark warm leads */
async function tagContact(body: {
  email: string;
  tag: string; // e.g. "warm-lead" | "hot" | "not-now" | "do-not-contact"
}) {
  return brevoFetch(`/contacts/${encodeURIComponent(body.email)}`, "PUT", {
    attributes: {
      CREWWOS_TAG: body.tag,
      CREWWOS_TAGGED_AT: new Date().toISOString(),
    },
  });
}

/** Get email campaign stats */
async function getCampaignStats(campaignId: number) {
  return brevoFetch(`/emailCampaigns/${campaignId}`, "GET");
}

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "BREVO_API_KEY not configured" },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, ...params } = body as { action: string } & Record<string, unknown>;

  try {
    let result: unknown;

    switch (action) {
      case "add_contact":
        result = await addContact(params as Parameters<typeof addContact>[0]);
        break;

      case "add_to_list":
        result = await addToList(params as Parameters<typeof addToList>[0]);
        break;

      case "remove_from_list":
        result = await removeFromList(params as Parameters<typeof removeFromList>[0]);
        break;

      case "send_email":
        result = await sendEmail(params as Parameters<typeof sendEmail>[0]);
        break;

      case "get_lists":
        result = await getLists();
        break;

      case "get_contact":
        result = await getContact(params.email as string);
        break;

      case "create_deal":
        result = await createDeal(params as Parameters<typeof createDeal>[0]);
        break;

      case "tag_contact":
        result = await tagContact(params as Parameters<typeof tagContact>[0]);
        break;

      case "get_campaign_stats":
        result = await getCampaignStats(params.campaignId as number);
        break;

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}`,
            available: [
              "add_contact",
              "add_to_list",
              "remove_from_list",
              "send_email",
              "get_lists",
              "get_contact",
              "create_deal",
              "tag_contact",
              "get_campaign_stats",
            ],
          },
          { status: 400 }
        );
    }

    return NextResponse.json({ ok: true, action, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[brevo] ${action} failed:`, message);
    return NextResponse.json({ ok: false, action, error: message }, { status: 502 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "get_lists") {
    try {
      const result = await getLists();
      return NextResponse.json({ ok: true, result });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ ok: false, error: message }, { status: 502 });
    }
  }

  return NextResponse.json({
    service: "CrewwOS Brevo Integration",
    version: "1.0.0",
    actions: [
      "add_contact",
      "add_to_list",
      "remove_from_list",
      "send_email",
      "get_lists",
      "get_contact",
      "create_deal",
      "tag_contact",
      "get_campaign_stats",
    ],
  });
}