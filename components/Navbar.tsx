"use client";

import { useState, useEffect } from "react";
import { config } from "@/lib/config";

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--bg)]/95 backdrop-blur border-b border-[var(--border)] shadow-sm"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo / business name */}
        <a
          href="#"
          className="font-heading font-bold text-lg text-brand-700 tracking-tight"
        >
          {config.name}
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--fg-muted)]">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="hover:text-brand-600 transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {config.hasPhone && (
            <a
              href={`tel:${config.phone.replace(/\D/g, "")}`}
              className="text-sm text-[var(--fg-muted)] hover:text-brand-600 transition-colors"
            >
              {config.phone}
            </a>
          )}
          <a
            href="#contact"
            className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            Get in Touch
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded text-[var(--fg-muted)] hover:text-[var(--fg)]"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          {menuOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[var(--bg)] border-b border-[var(--border)] px-4 pb-4">
          <ul className="flex flex-col gap-2 pt-2">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm font-medium text-[var(--fg-muted)] hover:text-brand-600"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="mt-2 block text-center px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold"
              >
                Get in Touch
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
