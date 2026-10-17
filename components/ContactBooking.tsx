"use client";

import { useState } from "react";
import { config } from "@/lib/config";

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Tab = "contact" | "booking";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  notes: string;
}

type FormStatus = "idle" | "loading" | "success" | "error";

/* ─── Time slots ─────────────────────────────────────────────────────────── */
const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "1:00 PM", "1:30 PM",
  "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM",
  "4:00 PM", "4:30 PM",
];

/* ─── Shared input styles ────────────────────────────────────────────────── */
const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-[var(--fg)] text-sm placeholder:text-[var(--fg-muted)] focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition";

const labelCls = "block text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wide mb-1.5";

/* ─── Contact Form ───────────────────────────────────────────────────────── */
function ContactForm() {
  const [form, setForm] = useState<ContactFormData>({
    name: "", email: "", phone: "", message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (k: keyof ContactFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Something went wrong.");
      }
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-heading text-xl font-bold text-[var(--fg)] mb-2">Message Received!</h3>
        <p className="text-[var(--fg-muted)] text-sm max-w-xs mx-auto">
          We'll get back to you within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Full Name *</label>
          <input
            required
            type="text"
            placeholder="Jane Smith"
            value={form.name}
            onChange={set("name")}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input
            required
            type="email"
            placeholder="jane@example.com"
            value={form.email}
            onChange={set("email")}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Phone (optional)</label>
        <input
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={form.phone}
          onChange={set("phone")}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Message *</label>
        <textarea
          required
          rows={4}
          placeholder="Tell us how we can help..."
          value={form.message}
          onChange={set("message")}
          className={`${inputCls} resize-none`}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 active:scale-[.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

/* ─── Booking Form ───────────────────────────────────────────────────────── */
function BookingForm() {
  const [form, setForm] = useState<BookingFormData>({
    name: "", email: "", phone: "", date: "", time: "", notes: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (k: keyof BookingFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // Min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Something went wrong.");
      }
      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="py-16 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-100 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="font-heading text-xl font-bold text-[var(--fg)] mb-2">
          Appointment Confirmed!
        </h3>
        <p className="text-[var(--fg-muted)] text-sm max-w-xs mx-auto">
          Check your email for a calendar invite with the meeting link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Full Name *</label>
          <input
            required
            type="text"
            placeholder="Jane Smith"
            value={form.name}
            onChange={set("name")}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input
            required
            type="email"
            placeholder="jane@example.com"
            value={form.email}
            onChange={set("email")}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Phone (optional)</label>
        <input
          type="tel"
          placeholder="+1 (555) 000-0000"
          value={form.phone}
          onChange={set("phone")}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Preferred Date *</label>
          <input
            required
            type="date"
            min={minDate}
            value={form.date}
            onChange={set("date")}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Preferred Time *</label>
          <select
            required
            value={form.time}
            onChange={set("time")}
            className={inputCls}
          >
            <option value="">Select a time…</option>
            {TIME_SLOTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls}>Notes (optional)</label>
        <textarea
          rows={3}
          placeholder="Anything you'd like us to know before the call…"
          value={form.notes}
          onChange={set("notes")}
          className={`${inputCls} resize-none`}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 active:scale-[.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? "Booking…" : "Book Appointment"}
      </button>
    </form>
  );
}

/* ─── Main export ────────────────────────────────────────────────────────── */
export default function ContactBooking() {
  const [activeTab, setActiveTab] = useState<Tab>("contact");
  const showBoth = config.hasBooking;

  return (
    <section id="contact" className="py-24 bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Left info column */}
          <div className="lg:col-span-2">
            <p className="text-brand-600 text-sm font-semibold tracking-widest uppercase mb-3">
              Get in Touch
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--fg)] text-balance mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-[var(--fg-muted)] mb-8">
              We'd love to hear from you. Fill out the form and we'll be in touch shortly.
            </p>

            <ul className="space-y-4">
              {config.hasPhone && (
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 text-brand-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--fg-muted)] font-semibold uppercase tracking-wide">Phone</p>
                    <a href={`tel:${config.phone.replace(/\D/g, "")}`} className="text-sm text-[var(--fg)] hover:text-brand-600 transition-colors">
                      {config.phone}
                    </a>
                  </div>
                </li>
              )}
              {config.email && (
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 text-brand-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--fg-muted)] font-semibold uppercase tracking-wide">Email</p>
                    <a href={`mailto:${config.email}`} className="text-sm text-[var(--fg)] hover:text-brand-600 transition-colors">
                      {config.email}
                    </a>
                  </div>
                </li>
              )}
              {config.hasAddress && (
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 text-brand-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--fg-muted)] font-semibold uppercase tracking-wide">Location</p>
                    <p className="text-sm text-[var(--fg)]">{config.address}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Right form column */}
          <div className="lg:col-span-3">
            <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-2xl p-6 sm:p-8">
              {/* Tabs — only show if booking is configured */}
              {showBoth && (
                <div className="flex gap-1 p-1 rounded-lg bg-[var(--bg)] border border-[var(--border)] mb-6">
                  {(["contact", "booking"] as Tab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all ${
                        activeTab === tab
                          ? "bg-brand-600 text-white shadow-sm"
                          : "text-[var(--fg-muted)] hover:text-[var(--fg)]"
                      }`}
                    >
                      {tab === "contact" ? "Send a Message" : "Book an Appointment"}
                    </button>
                  ))}
                </div>
              )}

              {/* Form content */}
              {activeTab === "contact" || !showBoth ? (
                <ContactForm />
              ) : (
                <BookingForm />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
