import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-indicator";
import { HeroVisual } from "./hero-visual";

export function Hero({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="relative overflow-hidden pt-28 pb-14 sm:pt-32 lg:pb-20" aria-labelledby="hero-title">
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-grid [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="container-m">
        <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          <div className="max-w-xl">
            <p className="mb-4 inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-[0.14em] text-ink-3 animate-rise">
              <StatusDot tone="healthy" pulse /> Remote operations platform
            </p>
            <h1
              id="hero-title"
              className="text-balance text-[2.25rem] font-semibold leading-[1.1] tracking-tight text-ink sm:text-[2.9rem] lg:text-[3.3rem] animate-rise"
              style={{ "--rise-delay": "80ms" } as React.CSSProperties}
            >
              Know what&rsquo;s happening across every site.
            </h1>
            <p className="mt-5 max-w-lg text-pretty text-md leading-relaxed text-ink-2 animate-rise" style={{ "--rise-delay": "160ms" } as React.CSSProperties}>
              SiteWatch gives operations teams one view of distributed sites and assets: monitor health, turn alerts into
              incidents, and coordinate field response without the spreadsheets and phone chains.
            </p>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center animate-rise" style={{ "--rise-delay": "240ms" } as React.CSSProperties}>
              <Button asChild size="lg" className="link-arrow sm:min-w-36">
                <Link href={signedIn ? "/dashboard" : "/signup"}>
                  {signedIn ? "Open console" : "Get started"} <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <a href="#platform">Explore the platform</a>
              </Button>
            </div>
            <dl className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-5 animate-rise" style={{ "--rise-delay": "320ms" } as React.CSSProperties}>
              {[
                ["Sites", "Solar, telecom, EV, warehouse, construction"],
                ["Tenancy", "Isolated workspace per organization"],
                ["Access", "Four operational roles"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-mono text-2xs uppercase tracking-wider text-ink-3">{k}</dt>
                  <dd className="mt-1 text-xs leading-snug text-ink-2">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroVisual className="min-w-0 lg:-mr-8 xl:-mr-16" />
        </div>
      </div>
    </section>
  );
}
