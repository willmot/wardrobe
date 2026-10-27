import "server-only";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getConfig, privateDataDirectory } from "./config";
import { readStore } from "./store";
import { demoStyle } from "./style-demo";
import type { StyleProfileEdition, StyleRecommendation, WeeklyStyleEdition } from "./style-assistant-types";

type ProfileFile = {
  activeEditionByOwner: Record<string, string>;
  editions: StyleProfileEdition[];
  legacyEditions: Array<{ id: string; label: string; date: string; href: string }>;
};
function readJson<T>(filename: string): T | undefined {
  const file = path.join(privateDataDirectory(), "style", filename);
  if (!existsSync(file)) return undefined;
  return JSON.parse(readFileSync(file, "utf8")) as T;
}
export function getStyleAssistant(ownerId: string) {
  const store = readStore();
  const profiles = readJson<ProfileFile>("profiles.json");
  const personalEdition = profiles?.editions.find((candidate) => candidate.id === profiles.activeEditionByOwner[ownerId] && candidate.ownerId === ownerId);
  const demo = getConfig().seedDemo && store.wardrobe.some((item) => item.ownerId === ownerId && item.id.startsWith("demo-")) ? demoStyle(ownerId) : undefined;
  const edition = personalEdition ?? demo?.edition;
  if (!edition) return null;
  const recommendations = personalEdition
    ? readJson<{ recommendations: StyleRecommendation[] }>("recommendations.json")?.recommendations ?? []
    : demo?.recommendations ?? [];
  const weekly = readJson<{ activeEdition: string; editions: WeeklyStyleEdition[] }>("weekly.json");
  return {
    edition, recommendations: recommendations.filter((entry) => entry.ownerId === ownerId && entry.editionId === edition.id),
    observations: store.outfitObservations.filter((entry) => entry.ownerId === ownerId),
    wardrobe: store.wardrobe.filter((item) => item.ownerId === ownerId), allWardrobe: store.wardrobe,
    outcomes: store.recommendationOutcomes.filter((entry) => entry.ownerId === ownerId),
    legacyEditions: profiles?.legacyEditions ?? [],
    weeklyEdition: weekly?.editions.find((entry) => entry.id === weekly.activeEdition && entry.weeklyReview[ownerId]),
  };
}
