import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/analyze-food", label: "Analyze Food" },
  { href: "/compare-meals", label: "Compare Meals" },
  { href: "/daily-nutrition", label: "Daily Nutrition" },
];

export function NavBar() {
  return (
    <header className="mx-auto w-full max-w-7xl px-5 pt-5 sm:px-8 lg:px-10">
      <div className="glass-panel flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-lg font-bold text-mint">
            N
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-ink/55">Hackathon MVP</p>
            <p className="text-lg font-semibold text-ink">NutriLens</p>
          </div>
        </Link>
        <nav className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-ink/72 transition hover:bg-slate-100 hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
