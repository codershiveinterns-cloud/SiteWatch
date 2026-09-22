import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { requirePermission } from "@/lib/auth/guards";
import { MILESTONE_META, MODULES } from "@/lib/modules";
import { NAV_ICONS } from "@/components/shell/nav-icons";
import { PageHeader } from "@/components/shell/page-header";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

/**
 * Roadmap page for modules that ship in later milestones. Access is still
 * permission-checked so the page only exists for roles that will use it.
 */
function findPlanned(key: string) {
  return MODULES.find((m) => m.key === key && m.status === "planned");
}

export async function generateMetadata({ params }: PageProps<"/[module]">): Promise<Metadata> {
  const { module } = await params;
  const def = findPlanned(module);
  return { title: def ? def.title : "Not found" };
}

export default async function PlannedModulePage({ params }: PageProps<"/[module]">) {
  const { module } = await params;
  const def = findPlanned(module);
  if (!def || !def.milestone) notFound();

  await requirePermission(def.permission, def.href);
  const Icon = NAV_ICONS[def.key];
  const milestone = MILESTONE_META[def.milestone];

  return (
    <>
      <PageHeader
        eyebrow={def.section}
        title={def.title}
        description={def.summary}
        actions={
          <Badge tone="atrisk" className="h-6 px-2">
            Planned · Milestone {def.milestone}
          </Badge>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Panel>
          <PanelBody className="py-6">
            <EmptyState
              icon={<Icon className="size-4" aria-hidden />}
              title={`${def.title} is not available yet`}
              description={`This module is scheduled for Milestone ${def.milestone} (${milestone.title}, ${milestone.window}). The navigation entry, permissions and tenant scoping for it are already in place.`}
              action={
                <Button asChild variant="secondary" size="sm">
                  <Link href="/dashboard">
                    <ArrowLeft className="size-3.5" aria-hidden /> Back to dashboard
                  </Link>
                </Button>
              }
            />
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader title="Scope" description={`Delivered in Milestone ${def.milestone}`} />
          <PanelBody>
            <ul className="space-y-2.5">
              {def.capabilities.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-ink-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </PanelBody>
        </Panel>
      </div>
    </>
  );
}
