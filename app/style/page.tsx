import { StyleAssistantView, type StyleSection } from "@/components/style-assistant-view";
import { getActiveProfile } from "@/lib/profile";
import { getStyleAssistant } from "@/lib/style-assistant";

export const dynamic = "force-dynamic";
const validSections = new Set<StyleSection>(["briefing", "weekly", "your-style", "outfit-clinic", "wardrobe-edit", "gaps", "ask"]);
export default async function StylePage({ searchParams }: { searchParams: Promise<{ section?: string; outfit?: string }> }) {
  const profile = await getActiveProfile();
  const params = await searchParams;
  const assistant = getStyleAssistant(profile.id);
  if (!assistant) return <section className="page-heading"><div className="page-heading-copy"><p className="eyebrow">Your style</p><h1>A fresh start for your wardrobe.</h1><p>No personal style edition has been created yet. Add your own items and source evidence, then ask Codex to prepare a review using the workflow in AGENTS.md.</p></div></section>;
  const section = validSections.has(params.section as StyleSection) ? params.section as StyleSection : "briefing";
  return <StyleAssistantView ownerName={profile.name} section={section} requestedOutfit={params.outfit} {...assistant} />;
}
