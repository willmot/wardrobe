import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { materializePhotos, queryInventory } from "../lib/inventory";
let directory: string;
beforeEach(() => {
  directory = mkdtempSync(path.join(os.tmpdir(), "wardrobe-inventory-test-"));
  vi.stubEnv("WARDROBE_PHOTOS_INVENTORY", path.join(directory, "inventory.json"));
  vi.stubEnv("WARDROBE_PHOTOS_LIBRARY", "");
});
afterEach(() => { vi.unstubAllEnvs(); rmSync(directory, { recursive: true, force: true }); });
describe("explicit local inventory", () => {
  it("filters by person, still media and time; drops duplicates and unsafe IDs", () => {
    const photo = { uuid: "sample-one", filename: "one.jpg", capturedAt: "2026-01-15T12:00:00Z", mediaType: "photo", people: ["Sample person"], labels: [] };
    writeFileSync(process.env.WARDROBE_PHOTOS_INVENTORY!, JSON.stringify({ assets: [photo, photo,
      { ...photo, uuid: "other", people: ["Someone else"] }, { ...photo, uuid: "video", mediaType: "video" },
      { ...photo, uuid: "old", capturedAt: "2020-01-01" }, { ...photo, uuid: "future", capturedAt: "2030-01-01" },
      { ...photo, uuid: "../escape" }, { ...photo, uuid: "broken", capturedAt: "invalid" },
    ] }));
    expect(queryInventory({ person: " sample PERSON ", days: 30, now: new Date("2026-01-20T12:00:00Z") }).map((entry) => entry.uuid)).toEqual(["sample-one"]);
  });
  it("copies into private storage, preserving format and skipping existing copies", () => {
    const source = path.join(directory, "source.png"); writeFileSync(source, "synthetic test bytes");
    const photo = { uuid: "sample-one", filename: "one.png", capturedAt: "2026-01-15", mediaType: "photo", people: [], labels: [], derivativePath: source };
    const destination = path.join(directory, "private");
    expect(materializePhotos([photo, { ...photo, uuid: "../escape" }], destination)).toBe(1);
    expect(readdirSync(destination)).toEqual(["sample-one.png"]);
    expect(readFileSync(path.join(destination, "sample-one.png"), "utf8")).toBe("synthetic test bytes");
    expect(materializePhotos([photo], destination)).toBe(0);
  });
  it("does not search any default library or inventory", () => {
    vi.stubEnv("WARDROBE_PHOTOS_INVENTORY", "");
    expect(queryInventory({ person: "Sample" })).toEqual([]);
  });
});
