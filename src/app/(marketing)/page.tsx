import type { Metadata } from "next";
import { getAuthContext } from "@/lib/auth/guards";
import { Hero } from "@/components/marketing/hero";
import { Complexity } from "@/components/marketing/complexity";
import { Capabilities } from "@/components/marketing/capabilities";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Industries } from "@/components/marketing/industries";
import { MapSection } from "@/components/marketing/map-section";
import { IncidentTimeline } from "@/components/marketing/incident-timeline";
import { Analytics } from "@/components/marketing/analytics";
import { AiSection } from "@/components/marketing/ai-section";
import { Security } from "@/components/marketing/security";
import { FinalCta } from "@/components/marketing/final-cta";

export const metadata: Metadata = {
  title: { absolute: "SiteWatch · Remote operations, under control" },
  description:
    "Monitor distributed sites and assets, turn alerts into incidents, and coordinate field response from one operational platform.",
};

export default async function LandingPage() {
  const signedIn = Boolean(await getAuthContext());
  return (
    <>
      <Hero signedIn={signedIn} />
      <Complexity />
      <Capabilities />
      <HowItWorks />
      <Industries />
      <MapSection />
      <IncidentTimeline />
      <Analytics />
      <AiSection />
      <Security />
      <FinalCta signedIn={signedIn} />
    </>
  );
}
