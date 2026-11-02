// components/onboarding/OnboardingWizard.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import MusicOnboarding, { MusicArtistProfile } from "@/components/onboarding/MusicOnboarding";
import {
  RealEstateOnboarding, RealEstateProfile,
  RestaurantOnboarding, RestaurantProfile,
  TradesOnboarding, TradesProfile,
  EcommerceOnboarding, EcommerceProfile,
  GeneralOnboarding, GeneralProfile,
} from "@/components/onboarding/VerticalOnboarding";

type EntityStep = "ask" | "setup" | "skip";
type StepType = 1 | 2 | 3 | 4 | "music" | "realestate" | "restaurant" | "trades" | "ecommerce" | "general";

interface Vertical {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  color: string;
}

const VERTICALS: Vertical[] = [
  { id: "music",      emoji: "🎵", label: "Music & Entertainment", desc: "Artists, labels, studios, event promoters",       color: "#A855F7" },
  { id: "realestate", emoji: "🏠", label: "Real Estate",           desc: "Agents, brokers, investors, property managers",  color: "#00D4FF" },
  { id: "ecommerce",  emoji: "🛍️", label: "E-Commerce",            desc: "Dropshipping, DTC brands, online stores",        color: "#F59E0B" },
  { id: "trades",     emoji: "🔧", label: "Trades & Services",     desc: "Contractors, electricians, plumbers, cleaners",  color: "#10B981" },
  { id: "restaurant", emoji: "🍽️", label: "Food & Restaurant",     desc: "Restaurants, food trucks, catering",             color: "#F97316" },
  { id: "general",    emoji: "🏢", label: "General Business",      desc: "Any business not listed above",                  color: "#6B7280" },
];

const INTAKE_STEP: Record<string, StepType> = {
  music:      "music",
  realestate: "realestate",
  restaurant: "restaurant",
  trades:     "trades",
  ecommerce:  "ecommerce",
  general:    "general",
};

const DASHBOARD_ROUTE: Record<string, string> = {
  realestate: "realestate",
  restaurant: "restaurant",
  music:      "music",
  trades:     "trades",
  ecommerce:  "ecommerce",
  general:    "",
};

const SUCCESS_COPY: Record<string, { msg: string; btn: string }> = {
  music:      { msg: "Your artist crew is ready — your EPK is on file and your agents are standing by to pitch, promote, and distribute.", btn: "🎤 Open Artist Dashboard" },
  realestate: { msg: "Your real estate crew is ready — Scout Agent is standing by to find off-market deals in your market.", btn: "🏠 Open Real Estate Dashboard" },
  restaurant: { msg: "Your restaurant crew is ready — your agents will handle reviews, social, promos, and more.", btn: "🍽️ Open Restaurant Dashboard" },
  trades:     { msg: "Your trades crew is ready — Lead Agent is standing by to bring in jobs and follow up on quotes.", btn: "🔧 Open Trades Dashboard" },
  ecommerce:  { msg: "Your e-commerce crew is ready — Product Agent is hunting for winners and your ads agent is on standby.", btn: "🛍️ Open E-Commerce Dashboard" },
  general:    { msg: "Your crew is seeded and ready. Connect a tool so agents can actually do things — or head straight to the office.", btn: "🏢 Go to the Office →" },
};

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<StepType>(1);
  const [name, setName] = useState("");
  const [vertical, setVertical] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [entityChoice, setEntityChoice] = useState<EntityStep | null>(null);

  const selectedVertical = VERTICALS.find(v => v.id === vertical);

  const create = async () => {
    if (!name.trim()) { setError("Give your workspace a name — usually your company's name."); return; }
    if (!vertical)    { setError("Select your industry to continue."); return; }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/workspaces/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), vertical }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't create workspace");
      setCreatedSlug(data.workspace.slug);
      setStep(INTAKE_STEP[vertical] ?? 3);
    } catch (err: any) {
      setError(err.message);
    }
    setCreating(false);
  };

  const handleIntakeComplete = () => setStep(3);

  const handleEntityChoice = (choice: EntityStep) => {
    setEntityChoice(choice);
    if (choice === "setup") {
      router.push(`/dashboard/${createdSlug}/business-setup`);
    } else {
      setStep(4);
    }
  };

  const goToDashboard = () => {
    const route = DASHBOARD_ROUTE[vertical ?? ""] ?? "";
    router.push(route ? `/dashboard/${createdSlug}/${route}` : `/dashboard/${createdSlug}`);
  };

  const numericSteps: StepType[] = [1, 2, 3, 4];
  const isIntakeStep = !numericSteps.includes(step);
  const stepLabel =
    step === 1 ? "STEP 1 OF 3" :
    step === 2 ? "STEP 2 OF 3" :
    step === 3 ? "STEP 2 OF 3" :
    isIntakeStep ? "" :
    "STEP 3 OF 3";

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: step === 2 ? 640 : isIntakeStep ? 560 : 480 }}>

        {!isIntakeStep && (
          <div style={{ color: "#00D4FF", fontSize: 12, letterSpacing: 3, marginBottom: 8, textAlign: "center" }} className="mono">
            CREWOS · {stepLabel}
          </div>
        )}

        {/* ── Step 1: Name workspace ─────────────────────────────── */}
        {step === 1 && (
          <div style={{ background: "#0d0d1a", border: "1px solid #ffffff18", borderRadius: 16, padding: 32 }}>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Name your workspace</div>
            <div style={{ color: "#ffffff66", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
              This is usually your company's name — it's what your crew of agents will work under.
              You can create more workspaces later for other businesses.
            </div>
            {error && <div style={{ color: "#ff9999", fontSize: 12, marginBottom: 12 }}>{error}</div>}
            <input
              value={name} onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && name.trim() && setStep(2)}
              placeholder="e.g. Made Estates"
              autoFocus
              style={{ width: "100%", background: "#060612", border: "1px solid #ffffff22", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 14, outline: "none", marginBottom: 20, boxSizing: "border-box" }}
            />
            <button
              onClick={() => { if (name.trim()) { setError(null); setStep(2); } else setError("Give your workspace a name."); }}
              style={{ width: "100%", background: "linear-gradient(135deg, #00D4FF, #A855F7)", border: "none", borderRadius: 10, padding: "12px", color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
            >
              Continue →
            </button>
            <div style={{ color: "#ffffff33", fontSize: 11, marginTop: 14, textAlign: "center" }}>
              Starts on the Starter plan — upgrade anytime from Settings.
            </div>
          </div>
        )}

        {/* ── Step 2: Pick vertical ──────────────────────────────── */}
        {step === 2 && (
          <div style={{ background: "#0d0d1a", border: "1px solid #ffffff18", borderRadius: 16, padding: 32 }}>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
              What industry is <span style={{ color: "#00D4FF" }}>{name}</span> in?
            </div>
            <div style={{ color: "#ffffff66", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              CrewwOS deploys a specialized crew built for your vertical — the right agents, workflows, and tools from day one.
            </div>
            {error && <div style={{ color: "#ff9999", fontSize: 12, marginBottom: 12 }}>{error}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {VERTICALS.map(v => (
                <button
                  key={v.id}
                  onClick={() => setVertical(v.id)}
                  style={{
                    background: vertical === v.id ? `${v.color}18` : "#060612",
                    border: `1px solid ${vertical === v.id ? v.color : "#ffffff18"}`,
                    borderRadius: 12, padding: "14px 16px", color: "#fff",
                    textAlign: "left", cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{v.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 3, color: vertical === v.id ? v.color : "#fff" }}>{v.label}</div>
                  <div style={{ color: "#ffffff55", fontSize: 11, lineHeight: 1.4 }}>{v.desc}</div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, background: "transparent", border: "1px solid #ffffff22", borderRadius: 10, padding: "12px", color: "#ffffff66", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                ← Back
              </button>
              <button onClick={create} disabled={creating || !vertical} style={{
                flex: 2,
                background: vertical ? "linear-gradient(135deg, #00D4FF, #A855F7)" : "#ffffff22",
                border: "none", borderRadius: 10, padding: "12px",
                color: vertical ? "#000" : "#ffffff44", fontWeight: 700, fontSize: 14,
                cursor: vertical ? "pointer" : "not-allowed", opacity: creating ? 0.6 : 1,
              }}>
                {creating ? "Setting up your crew..." : `Create ${name} →`}
              </button>
            </div>
          </div>
        )}

        {/* ── Vertical intake flows ──────────────────────────────── */}
        {step === "music" && createdSlug && (
          <MusicOnboarding workspaceId={createdSlug} onComplete={(_p: MusicArtistProfile) => handleIntakeComplete()} />
        )}
        {step === "realestate" && createdSlug && (
          <RealEstateOnboarding workspaceId={createdSlug} onComplete={(_p: RealEstateProfile) => handleIntakeComplete()} />
        )}
        {step === "restaurant" && createdSlug && (
          <RestaurantOnboarding workspaceId={createdSlug} onComplete={(_p: RestaurantProfile) => handleIntakeComplete()} />
        )}
        {step === "trades" && createdSlug && (
          <TradesOnboarding workspaceId={createdSlug} onComplete={(_p: TradesProfile) => handleIntakeComplete()} />
        )}
        {step === "ecommerce" && createdSlug && (
          <EcommerceOnboarding workspaceId={createdSlug} onComplete={(_p: EcommerceProfile) => handleIntakeComplete()} />
        )}
        {step === "general" && createdSlug && (
          <GeneralOnboarding workspaceId={createdSlug} onComplete={(_p: GeneralProfile) => handleIntakeComplete()} />
        )}

        {/* ── Step 3: Business entity question ──────────────────── */}
        {step === 3 && (
          <div style={{ background: "#0d0d1a", border: "1px solid #ffffff18", borderRadius: 16, padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 12, textAlign: "center" }}>🏢</div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
              Is your business officially registered?
            </div>
            <div style={{ color: "#ffffff66", fontSize: 13, marginBottom: 24, lineHeight: 1.6, textAlign: "center" }}>
              CrewwOS can help you form your LLC, get your EIN, and register with your state — all in one place.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button onClick={() => handleEntityChoice("skip")} style={{ background: "#060612", border: "1px solid #10B98155", borderRadius: 12, padding: "14px 16px", color: "#fff", textAlign: "left", cursor: "pointer" }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>✅ Yes, I'm already registered</div>
                <div style={{ color: "#ffffff55", fontSize: 12 }}>I have my LLC/Corp and EIN sorted</div>
              </button>
              <button onClick={() => handleEntityChoice("setup")} style={{ background: "linear-gradient(135deg, #00D4FF11, #A855F711)", border: "1px solid #00D4FF55", borderRadius: 12, padding: "14px 16px", color: "#fff", textAlign: "left", cursor: "pointer" }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>🚀 No — help me get set up</div>
                <div style={{ color: "#ffffff55", fontSize: 12 }}>Walk me through forming my entity, getting my EIN, and registering with my state</div>
              </button>
              <button onClick={() => handleEntityChoice("skip")} style={{ background: "transparent", border: "1px solid #ffffff15", borderRadius: 12, padding: "14px 16px", color: "#ffffff55", textAlign: "left", cursor: "pointer" }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3 }}>⏱ I'll do this later</div>
                <div style={{ color: "#ffffff33", fontSize: 12 }}>Find it anytime under Settings → Business & Legal</div>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Success ────────────────────────────────────── */}
        {step === 4 && (
          <div style={{ background: "#0d0d1a", border: "1px solid #10B98155", borderRadius: 16, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{selectedVertical?.emoji ?? "✅"}</div>
            <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{name} is live</div>
            <div style={{ color: "#ffffff66", fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
              {SUCCESS_COPY[vertical ?? "general"]?.msg ?? SUCCESS_COPY["general"].msg}
            </div>
            <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
              <button onClick={goToDashboard} style={{ background: "linear-gradient(135deg, #00D4FF, #A855F7)", border: "none", borderRadius: 10, padding: "12px", color: "#000", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                {SUCCESS_COPY[vertical ?? "general"]?.btn ?? SUCCESS_COPY["general"].btn}
              </button>
              <button onClick={() => router.push(`/dashboard/${createdSlug}/integrations`)} style={{ background: "transparent", border: "1px solid #ffffff22", borderRadius: 10, padding: "12px", color: "#ffffff88", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
                Connect your first tool
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
