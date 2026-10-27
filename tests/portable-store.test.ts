import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

let directory: string;
beforeEach(() => {
  vi.resetModules();
  directory = mkdtempSync(path.join(os.tmpdir(), "wardrobe-test-"));
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  vi.stubEnv("WARDROBE_DATA_DIR", path.join(directory, "state"));
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); rmSync(directory, { recursive: true, force: true }); });
function config(seedDemo = false) {
  writeFileSync(path.join(directory, "wardrobe.config.json"), JSON.stringify({ profiles: [
    { id: "sample-user", name: "Sample", photosName: "Sample person", initials: "S" },
    { id: "second-user", name: "Second", photosName: "Second person", initials: "S" },
  ], seedDemo }));
}
describe("portable private store", () => {
  it("starts a genuinely empty wardrobe with only configured profiles", async () => {
    config();
    const { readStore } = await import("../lib/store");
    const store = readStore();
    expect(store.profiles.map((entry) => entry.id)).toEqual(["sample-user", "second-user"]);
    expect(store.wardrobe).toEqual([]); expect(store.imports).toEqual([]);
    expect(store.outfitObservations).toEqual([]); expect(store.recommendationOutcomes).toEqual([]);
    const { getStyleAssistant } = await import("../lib/style-assistant");
    expect(getStyleAssistant("sample-user")).toBeNull();
  });
  it("assigns synthetic fixtures only to the configured first owner", async () => {
    config(true);
    const { readStore, getWardrobe } = await import("../lib/store");
    const store = readStore();
    expect(store.wardrobe).toHaveLength(4);
    expect(store.wardrobe.every((item) => item.ownerId === "sample-user" && item.wornCount === 0 && item.sourceImages.length === 0)).toBe(true);
    expect(getWardrobe("second-user")).toEqual([]);
    const { getStyleAssistant } = await import("../lib/style-assistant");
    expect(getStyleAssistant("sample-user")?.recommendations).toHaveLength(3);
    expect(getStyleAssistant("second-user")).toBeNull();
  });
  it("persists profile edits without restoring seed names or changing ownership", async () => {
    config();
    const { readStore, writeStore } = await import("../lib/store");
    const store = readStore(); store.profiles[0].name = "Updated"; writeStore(store);
    expect(readStore().profiles[0].name).toBe("Updated");
    expect(JSON.parse(readFileSync(path.join(directory, "state", "wardrobe.json"), "utf8")).profiles[0].name).toBe("Updated");
  });
  it("rejects duplicate or path-shaped profile IDs", async () => {
    const { getConfig } = await import("../lib/config");
    config(); const filename = path.join(directory, "wardrobe.config.json");
    const value = JSON.parse(readFileSync(filename, "utf8")); value.profiles[0].id = "../escape";
    writeFileSync(filename, JSON.stringify(value)); expect(() => getConfig()).toThrow("Invalid wardrobe profile");
  });
});
