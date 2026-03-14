import "./globals.css";
import { NavBar } from "@/components/nav-bar";

export const metadata = {
  title: "NutriLens",
  description: "AI nutrition decision copilot for fast food analysis, meal comparisons, and daily summaries.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="relative min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(16,24,38,0.08),transparent_55%)]" />
          <NavBar />
          <main className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-16 pt-6 sm:px-8 lg:px-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
