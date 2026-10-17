import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { config } from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: config.name,
    template: `%s | ${config.name}`,
  },
  description: config.description || config.tagline,
  openGraph: {
    type: "website",
    siteName: config.name,
    title: config.name,
    description: config.description || config.tagline,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Inject brand CSS variables from env so Tailwind's var() references resolve
  const brandVars = `
    :root {
      --brand-50: ${config.brand[50]};
      --brand-100: ${config.brand[100]};
      --brand-500: ${config.brand[500]};
      --brand-600: ${config.brand[600]};
      --brand-700: ${config.brand[700]};
      --brand-900: ${config.brand[900]};
    }
  `.trim();

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: brandVars }} />
      </head>
      <body className="font-sans antialiased bg-[var(--bg)] text-[var(--fg)]">
        {children}
      </body>
    </html>
  );
}
