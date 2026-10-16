import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "CrewOS App";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Logo / Brand */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 mx-auto flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-500/30">
            {APP_NAME.charAt(0)}
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="text-slate-400 text-lg">
            Powered by <span className="text-blue-400 font-semibold">CrewOS</span>
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-white transition-colors shadow-lg shadow-blue-600/30">
                Get Started
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-white transition-colors border border-white/20">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-semibold text-white transition-colors shadow-lg shadow-blue-600/30 inline-block"
            >
              Go to Dashboard →
            </Link>
          </SignedIn>
        </div>

        {/* Built by */}
        <p className="text-slate-600 text-sm">
          Built by{" "}
          <a
            href="https://made-technologies.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-400 transition-colors"
          >
            M.A.D.E Technologies
          </a>
        </p>
      </div>
    </main>
  );
}
