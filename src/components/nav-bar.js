"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home", shortLabel: "Overview" },
  { href: "/analyze-food", label: "Analyze Food", shortLabel: "Vision" },
  { href: "/compare-meals", label: "Compare Meals", shortLabel: "Decision" },
  { href: "/daily-nutrition", label: "Daily Monitoring", shortLabel: "Timeline" },
];

export function NavBar() {
  const pathname = usePathname();
  const currentRoute = links.find((link) => link.href === pathname) ?? links[0];

  return (
    <header className="sticky top-0 z-40 mx-auto w-full max-w-7xl px-5 pt-5 sm:px-8 lg:px-10">
      <div className="glass-panel nav-shell px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="fx-surface flex items-center gap-3" data-click-fx>
              <div className="module-orbit flex h-12 w-12 items-center justify-center rounded-[20px] bg-ink text-lg font-bold text-mint shadow-[0_18px_40px_rgba(13,27,42,0.24)]">
                N
              </div>
              <div>
                <p className="story-kicker">Preventive Nutrition OS</p>
                <p className="text-xl font-semibold text-ink">NutriLens</p>
              </div>
            </Link>
            <div className="hidden rounded-full border border-ink/10 bg-white/45 px-3 py-1.5 text-right lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-ink/40">Current module</p>
              <p className="text-sm font-semibold text-ink">{currentRoute.shortLabel}</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <nav className="flex flex-wrap gap-2">
              {links.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link fx-surface ${isActive ? "nav-link-active" : ""}`}
                    data-click-fx
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <Link href="/analyze-food" className="primary-button hidden lg:inline-flex" data-click-fx>
              Run live workflow
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
