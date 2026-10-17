import { config } from "@/lib/config";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--bg-subtle)]">
      {/* Gradient blob */}
      <div
        aria-hidden
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, var(--brand-500), transparent 70%)` }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl"
          style={{ background: `radial-gradient(circle, var(--brand-700), transparent 70%)` }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-32 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold tracking-wide uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          Now Accepting New Clients
        </div>

        {/* Headline */}
        <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-[var(--fg)] leading-tight tracking-tight text-balance mb-6">
          {config.tagline}
        </h1>

        {/* Description */}
        {config.description && (
          <p className="max-w-2xl mx-auto text-lg text-[var(--fg-muted)] leading-relaxed mb-10">
            {config.description}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-base hover:bg-brand-700 active:scale-95 transition-all shadow-lg shadow-brand-500/25"
          >
            {config.hasBooking ? "Book a Free Consultation" : "Contact Us Today"}
          </a>
          <a
            href="#services"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-[var(--border)] text-[var(--fg)] font-semibold text-base hover:bg-[var(--bg-subtle)] active:scale-95 transition-all"
          >
            See Our Services
          </a>
        </div>

        {/* Trust indicators */}
        {config.hasPhone && (
          <p className="mt-8 text-sm text-[var(--fg-muted)]">
            Questions? Call us at{" "}
            <a
              href={`tel:${config.phone.replace(/\D/g, "")}`}
              className="text-brand-600 font-medium hover:underline"
            >
              {config.phone}
            </a>
          </p>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-[var(--fg-muted)]">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  );
}
