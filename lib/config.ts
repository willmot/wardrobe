import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { WardrobeProfile } from "./types";

export type WardrobeConfig = { profiles: WardrobeProfile[]; seedDemo: boolean };
const demoConfig: WardrobeConfig = {
  profiles: [{ id: "default", name: "Demo", photosName: "", initials: "D" }],
  seedDemo: true,
};

export function getConfig(): WardrobeConfig {
  const filename = path.join(/* turbopackIgnore: true */ process.cwd(), "wardrobe.config.json");
  if (!existsSync(filename)) return structuredClone(demoConfig);
  const value = JSON.parse(readFileSync(filename, "utf8")) as WardrobeConfig;
  if (!Array.isArray(value.profiles) || value.profiles.length === 0 || typeof value.seedDemo !== "boolean") {
    throw new Error("wardrobe.config.json needs at least one profile and a seedDemo boolean.");
  }
  const seen = new Set<string>();
  for (const profile of value.profiles) {
    if (!/^[a-z0-9-]+$/.test(profile.id) || seen.has(profile.id) ||
      typeof profile.name !== "string" || !profile.name.trim() ||
      typeof profile.photosName !== "string" || typeof profile.initials !== "string") {
      throw new Error("Invalid wardrobe profile: use a unique lowercase ID, name, photosName and initials.");
    }
    seen.add(profile.id);
  }
  return value;
}

export function privateDataDirectory(): string {
  return path.resolve(/* turbopackIgnore: true */ process.env.WARDROBE_DATA_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), ".runtime"));
}
