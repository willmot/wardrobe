import "server-only";

import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";

import { createInitialStore } from "./seed";
import { getConfig, privateDataDirectory } from "./config";
import type { StoreShape, WardrobeItem, WardrobeProfile } from "./types";

const config = getConfig();
export const DEFAULT_PROFILE_ID = config.profiles[0].id;
export const defaultProfiles = config.profiles;
const dataDirectory = privateDataDirectory();
const storePath = path.join(dataDirectory, "wardrobe.json");

function writeJsonAtomically(filePath: string, value: unknown): void {
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  renameSync(temporaryPath, filePath);
}

function cloneDemoStore(): StoreShape {
  return createInitialStore(defaultProfiles, config.seedDemo);
}

function normalizeStore(value: Partial<StoreShape>): StoreShape {
  const profiles = Array.isArray(value.profiles) && value.profiles.length ? value.profiles : defaultProfiles;
  const knownProfiles = new Map(profiles.map((profile) => [profile.id, profile]));
  for (const profile of profiles) knownProfiles.set(profile.id, profile);
  return {
    profiles: [...knownProfiles.values()],
    wardrobe: (value.wardrobe ?? []).map((item) => ({ ...item, ownerId: item.ownerId ?? DEFAULT_PROFILE_ID })),
    imports: (value.imports ?? []).map((run) => ({ ...run, ownerId: run.ownerId ?? DEFAULT_PROFILE_ID })),
    outfitObservations: (value.outfitObservations ?? []).filter((observation) =>
      observation && typeof observation.ownerId === "string" && Array.isArray(observation.observedItems)
    ),
    recommendationOutcomes: (value.recommendationOutcomes ?? []).filter((outcome) =>
      outcome && typeof outcome.ownerId === "string" && typeof outcome.recommendationId === "string"
    ),
  };
}

function ensureStore(): void {
  mkdirSync(dataDirectory, { recursive: true, mode: 0o700 });
  try {
    readFileSync(storePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    writeJsonAtomically(storePath, cloneDemoStore());
  }
}

export function readStore(): StoreShape {
  ensureStore();
  const raw = JSON.parse(readFileSync(storePath, "utf8")) as Partial<StoreShape>;
  const normalized = normalizeStore(raw);
  if (!raw.profiles || !raw.outfitObservations || !raw.recommendationOutcomes || raw.wardrobe?.some((item) => !item.ownerId) || raw.imports?.some((run) => !run.ownerId)) {
    writeJsonAtomically(storePath, normalized);
  }
  return normalized;
}

export function writeStore(store: StoreShape): StoreShape {
  ensureStore();
  const normalized = normalizeStore(store);
  writeJsonAtomically(storePath, normalized);
  return normalized;
}

export function getProfiles(): WardrobeProfile[] {
  return readStore().profiles;
}

export function getProfile(id: string): WardrobeProfile | undefined {
  return getProfiles().find((profile) => profile.id === id);
}

export function getWardrobe(ownerId = DEFAULT_PROFILE_ID): WardrobeItem[] {
  return readStore().wardrobe.filter((item) => item.ownerId === ownerId);
}

export function getWardrobeItem(id: string, ownerId = DEFAULT_PROFILE_ID): WardrobeItem | undefined {
  return getWardrobe(ownerId).find((item) => item.id === id);
}

/** Resolve a stable item URL independently of the viewer's active profile. */
export function findWardrobeItem(id: string): WardrobeItem | undefined {
  return readStore().wardrobe.find((item) => item.id === id);
}

export function updateWardrobeItem(id: string, changes: Partial<WardrobeItem>, ownerId = DEFAULT_PROFILE_ID): WardrobeItem | undefined {
  const store = readStore();
  const index = store.wardrobe.findIndex((item) => item.id === id && item.ownerId === ownerId);
  if (index === -1) return undefined;
  store.wardrobe[index] = { ...store.wardrobe[index], ...changes, ownerId };
  writeStore(store);
  return store.wardrobe[index];
}

export function getImports(ownerId = DEFAULT_PROFILE_ID) {
  return readStore().imports.filter((run) => run.ownerId === ownerId);
}

export function getOutfitObservations(ownerId = DEFAULT_PROFILE_ID) {
  return readStore().outfitObservations.filter((observation) => observation.ownerId === ownerId);
}

export function addImport(importRun: StoreShape["imports"][number], ownerId = DEFAULT_PROFILE_ID) {
  const store = readStore();
  const scopedRun = { ...importRun, ownerId };
  store.imports = [scopedRun, ...store.imports];
  writeStore(store);
  return scopedRun;
}

export function getDataDirectory(): string {
  ensureStore();
  return dataDirectory;
}
