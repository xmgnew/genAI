import "./globals.css";
import { NavBar } from "@/components/nav-bar";
import { InteractionEffects } from "@/components/interaction-effects";

export const metadata = {
  title: "NutriLens",
  description: "AI nutrition decision copilot for fast food analysis, meal comparisons, and daily summaries.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="relative min-h-screen overflow-hidden">
          <InteractionEffects />
          <div className="pointer-events-none absolute left-[-10%] top-[-6rem] h-80 w-80 rounded-full bg-mint/30 blur-3xl" />
          <div className="pointer-events-none absolute right-[-8%] top-20 h-72 w-72 rounded-full bg-ocean/25 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[-6rem] left-1/3 h-72 w-72 rounded-full bg-coral/15 blur-3xl" />
          <NavBar />
          <main className="mx-auto flex w-full max-w-7xl flex-col px-5 pb-20 pt-8 sm:px-8 lg:px-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
