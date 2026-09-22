import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function FinalCta({ signedIn }: { signedIn: boolean }) {
  return (
    <section data-theme="dark" className="relative overflow-hidden bg-canvas py-20 text-ink lg:py-28" aria-labelledby="cta-title">
      <div aria-hidden className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <Reveal className="container-m relative text-center">
        <p className="mb-4 font-mono text-2xs uppercase tracking-[0.14em] text-ink-3">Get started</p>
        <h2 id="cta-title" className="mx-auto max-w-2xl text-balance text-2xl font-semibold tracking-tight sm:text-[2.2rem] sm:leading-[2.7rem]">
          Bring every site into view.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-md text-ink-2">
          Build a clearer operational picture across your distributed sites, assets and field teams.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto sm:min-w-36">
            <Link href={signedIn ? "/dashboard" : "/signup"}>
              {signedIn ? "Open console" : "Get started"} <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
          {!signedIn ? (
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <Link href="/login">Sign in</Link>
            </Button>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}
