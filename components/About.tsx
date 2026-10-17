import { config } from "@/lib/config";

const stats = [
  { value: "5★", label: "Average Rating" },
  { value: "100%", label: "Client Satisfaction" },
  { value: "Fast", label: "Response Time" },
];

export default function About() {
  return (
    <section id="about" className="py-24 bg-[var(--bg-subtle)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text column */}
          <div>
            <p className="text-brand-600 text-sm font-semibold tracking-widest uppercase mb-3">
              About Us
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[var(--fg)] text-balance mb-6">
              Why Choose {config.name}
            </h2>
            <div className="space-y-4 text-[var(--fg-muted)] leading-relaxed">
              <p>
                We are dedicated to delivering exceptional results for every client.
                Our team brings deep expertise, a client-first mindset, and the
                tools to get things done right — the first time.
              </p>
              <p>
                Whether you're just starting out or looking to scale, we tailor
                every engagement to your unique situation and goals.
              </p>
            </div>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-heading text-2xl font-bold text-brand-600">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[var(--fg-muted)] mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 mt-8 text-brand-600 font-semibold text-sm hover:underline"
            >
              Get started today
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Visual column */}
          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 border border-[var(--border)] overflow-hidden">
              {/* Decorative grid */}
              <div className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40V0h1v40H0zm39 0V0h1v40h-1zM0 0h40v1H0V0zm0 39h40v1H0v-1z' fill='%230ea5e9' fill-opacity='.2'/%3E%3C/svg%3E")`,
                }}
              />
              {/* Center emblem */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-brand-600/10 border-2 border-brand-600/20 flex items-center justify-center">
                  <span className="font-heading text-3xl font-bold text-brand-600">
                    {config.name.charAt(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-4 -left-4 bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-lg">
              <p className="text-xs text-[var(--fg-muted)]">Trusted by clients in</p>
              <p className="text-sm font-semibold text-[var(--fg)] mt-0.5">
                {config.hasAddress
                  ? config.address.split(",").slice(-2).join(",").trim()
                  : "Your Local Area"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
