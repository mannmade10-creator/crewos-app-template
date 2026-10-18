"use client";
import { useState } from "react";
interface FormData {
  businessName: string; businessTagline: string; businessDescription: string;
  businessPhone: string; businessEmail: string; businessAddress: string;
  businessType: "service" | "ecommerce" | "saas";
  ownerName: string; ownerEmail: string;
  service1: string; service2: string; service3: string;
  service4: string; service5: string; service6: string;
  brandColor: string;
  instagram: string; facebook: string; tiktok: string; twitter: string;
}
const EMPTY: FormData = {
  businessName: "", businessTagline: "", businessDescription: "",
  businessPhone: "", businessEmail: "", businessAddress: "",
  businessType: "service",
  ownerName: "", ownerEmail: "",
  service1: "", service2: "", service3: "",
  service4: "", service5: "", service6: "",
  brandColor: "#0ea5e9",
  instagram: "", facebook: "", tiktok: "", twitter: "",
};
type Step = 1 | 2 | 3 | 4 | 5;
const STEPS = ["Business Info", "Owner", "Services", "Brand", "Review & Launch"];
function inputCls(err?: boolean) {
  return [
    "w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900",
    "placeholder:text-gray-400 focus:outline-none focus:ring-2",
    err ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-sky-300",
  ].join(" ");
}
const labelCls = "block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1";
export default function OnboardPage() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ url: string } | null>(null);
  const [serverError, setServerError] = useState("");
  const set = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };
  function validate(): boolean {
    const errs: typeof errors = {};
    if (step === 1) { if (!form.businessName.trim()) errs.businessName = "Required"; }
    if (step === 2) {
      if (!form.ownerName.trim()) errs.ownerName = "Required";
      if (!form.ownerEmail.trim()) errs.ownerEmail = "Required";
      else if (!/^\S+@\S+\.\S+$/.test(form.ownerEmail)) errs.ownerEmail = "Enter a valid email";
    }
    if (step === 3) { if (!form.service1.trim()) errs.service1 = "Add at least one service"; }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }
  function next() { if (!validate()) return; setStep((s) => Math.min(5, s + 1) as Step); }
  function back() { setStep((s) => Math.max(1, s - 1) as Step); }
  async function submit() {
    if (!validate()) return;
    setSubmitting(true); setServerError("");
    try {
      const res = await fetch("/api/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Provisioning failed.");
      setDone({ url: json.url ?? "https://crewwos-platform.vercel.app" });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : String(err));
    } finally { setSubmitting(false); }
  }
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-slate-100 p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center">
          <div className="text-5xl mb-4">&#127881;</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your site is live!</h1>
          <p className="text-gray-500 text-sm mb-6">Your CrewOS workspace has been provisioned. Check your email for next steps.</p>
          <a href={done.url} target="_blank" rel="noopener noreferrer"
            className="inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg px-6 py-3 text-sm transition">
            Visit Your Site
          </a>
        </div>
      </div>
    );
  }
  const progress = ((step - 1) / 4) * 100;
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between">
        <div>
          <span className="text-xl font-black tracking-tight text-sky-600">CrewOS</span>
          <span className="ml-2 text-xs text-gray-400 font-medium">New Workspace Setup</span>
        </div>
        <span className="text-xs text-gray-400">Step {step} of {STEPS.length}</span>
      </div>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-sky-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="px-8 pt-8 pb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{STEPS[step - 1]}</h2>
          <p className="text-sm text-gray-400 mb-6">
            {step === 1 && "Tell us about the business."}
            {step === 2 && "Who owns this workspace?"}
            {step === 3 && "What services do you offer? (Add up to 6)"}
            {step === 4 && "Pick your brand color -- we will generate the palette."}
            {step === 5 && "Review everything before we launch your site."}
          </p>
          {step === 1 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Business Name *</label>
                <input className={inputCls(!!errors.businessName)} placeholder="Acme Studio" value={form.businessName} onChange={set("businessName")} />
                {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Tagline</label>
                <input className={inputCls()} placeholder="We build things that last." value={form.businessTagline} onChange={set("businessTagline")} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Short Description</label>
                <textarea className={inputCls()} rows={3} placeholder="A brief paragraph about what you do..." value={form.businessDescription} onChange={set("businessDescription")} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls()} placeholder="(405) 555-0100" value={form.businessPhone} onChange={set("businessPhone")} />
              </div>
              <div>
                <label className={labelCls}>Business Email</label>
                <input className={inputCls()} placeholder="hello@yourbiz.com" value={form.businessEmail} onChange={set("businessEmail")} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Address</label>
                <input className={inputCls()} placeholder="123 Main St, Oklahoma City, OK 73102" value={form.businessAddress} onChange={set("businessAddress")} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Business Type *</label>
                <select className={inputCls()} value={form.businessType} onChange={set("businessType")}>
                  <option value="service">Service Business</option>
                  <option value="ecommerce">E-commerce / Retail</option>
                  <option value="saas">SaaS / Tech Product</option>
                </select>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Your Full Name *</label>
                <input className={inputCls(!!errors.ownerName)} placeholder="Jane Smith" value={form.ownerName} onChange={set("ownerName")} />
                {errors.ownerName && <p className="text-red-500 text-xs mt-1">{errors.ownerName}</p>}
              </div>
              <div>
                <label className={labelCls}>Your Email *</label>
                <input className={inputCls(!!errors.ownerEmail)} type="email" placeholder="jane@yourbiz.com" value={form.ownerEmail} onChange={set("ownerEmail")} />
                {errors.ownerEmail && <p className="text-red-500 text-xs mt-1">{errors.ownerEmail}</p>}
              </div>
              <div className="sm:col-span-2 bg-sky-50 rounded-lg p-4 text-sm text-sky-700">
                <strong>Heads up:</strong> We will send your login link and workspace details to this email address.
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="grid grid-cols-1 gap-3">
              {([1,2,3,4,5,6] as const).map((n) => {
                const key = `service${n}` as keyof FormData;
                return (
                  <div key={n}>
                    <label className={labelCls}>Service {n}{n === 1 ? " *" : " (optional)"}</label>
                    <input
                      className={inputCls(n === 1 && !!errors.service1)}
                      placeholder={n === 1 ? "e.g. Consultation | One-on-one strategy session" : "Title | Short description"}
                      value={form[key] as string}
                      onChange={set(key)}
                    />
                    {n === 1 && errors.service1 && <p className="text-red-500 text-xs mt-1">{errors.service1}</p>}
                  </div>
                );
              })}
              <p className="text-xs text-gray-400 mt-1">Format: Title | Short description (description is optional)</p>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <label className={labelCls}>Primary Brand Color</label>
                <div className="flex items-center gap-4 mt-2">
                  <input type="color" value={form.brandColor} onChange={set("brandColor")} className="h-14 w-14 cursor-pointer rounded-lg border border-gray-200 p-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">{form.brandColor.toUpperCase()}</p>
                    <p className="text-xs text-gray-400">We generate a full palette from this color.</p>
                  </div>
                </div>
              </div>
              <div>
                <p className={labelCls + " mb-3"}>Social Links (optional)</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(["instagram","facebook","tiktok","twitter"] as const).map((key) => (
                    <div key={key}>
                      <label className={labelCls}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                      <input className={inputCls()} placeholder={`https://${key}.com/yourbiz`} value={form[key]} onChange={set(key)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4 text-sm">
              {([
                ["Business", form.businessName],
                ["Type", form.businessType],
                ["Owner", `${form.ownerName} - ${form.ownerEmail}`],
                ["Services", [form.service1,form.service2,form.service3].filter(Boolean).map(s=>s.split("|")[0].trim()).join(", ")],
                ["Brand Color", form.brandColor],
              ] as [string,string][]).map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="w-28 shrink-0 font-semibold text-gray-500">{label}</span>
                  <span className="text-gray-800 break-all">{value || "--"}</span>
                </div>
              ))}
              {serverError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">{serverError}</div>
              )}
              <div className="bg-sky-50 border border-sky-100 rounded-lg p-4 text-sky-700 text-sm">
                <strong>Ready to launch!</strong> Clicking below will create your workspace and deploy your site in about 30-60 seconds.
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-8 py-6 border-t border-gray-100">
          <button onClick={back} disabled={step === 1} className="text-sm text-gray-500 hover:text-gray-800 disabled:opacity-30 transition">Back</button>
          {step < 5 ? (
            <button onClick={next} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg px-6 py-2.5 text-sm transition">Continue</button>
          ) : (
            <button onClick={submit} disabled={submitting} className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-semibold rounded-lg px-8 py-2.5 text-sm transition">
              {submitting ? "Launching..." : "Launch My Site"}
            </button>
          )}
        </div>
      </div>
      <p className="mt-6 text-xs text-gray-400 text-center">
        Powered by <span className="font-semibold text-sky-500">CrewOS</span>
      </p>
    </div>
  );
}