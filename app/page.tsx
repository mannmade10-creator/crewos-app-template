import { config } from "@/lib/config";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center bg-gradient-to-b from-gray-50 to-white">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          {config.business.name}
        </h1>
        {config.business.tagline && (
          <p className="mt-4 text-xl text-gray-500 max-w-2xl">
            {config.business.tagline}
          </p>
        )}
        <div className="mt-8 flex gap-4 flex-wrap justify-center">
          {config.business.phone && (
            <a
              href={`tel:${config.business.phone}`}
              className="rounded-lg px-6 py-3 bg-green-600 text-white font-medium hover:bg-green-700 transition"
            >
              Call Us
            </a>
          )}
          {config.business.email && (
            <a
              href={`mailto:${config.business.email}`}
              className="rounded-lg px-6 py-3 border border-gray-300 text-gray-700 font-medium hover:border-gray-400 transition"
            >
              Email Us
            </a>
          )}
        </div>
      </section>

      {/* Services */}
      {config.services.length > 0 && (
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Our Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.services.map((service, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 p-6 hover:shadow-md transition"
              >
                <p className="font-medium text-gray-800">{service}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          {config.business.address && (
            <p className="text-gray-500">{config.business.address}</p>
          )}
          {config.business.phone && (
            <p className="text-gray-500 mt-1">{config.business.phone}</p>
          )}
          {config.business.email && (
            <p className="text-gray-500 mt-1">{config.business.email}</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} {config.business.name}. Powered by{" "}
        <a href="https://crewwos.com" className="underline">
          CrewwOS
        </a>
        .
      </footer>
    </main>
  );
}
