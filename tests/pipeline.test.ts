import { describe, expect, it } from "vitest";

import { demoWardrobe } from "../lib/seed";
import { canonicalPairKey, observedPairings, uniqueWardrobeItems } from "../lib/pipeline";

describe("wardrobe pipeline invariants", () => {
  it("keeps the first-run wardrobe de-duplicated and referentially safe", () => {
    expect(uniqueWardrobeItems(demoWardrobe)).toHaveLength(demoWardrobe.length);
    const ids = new Set(demoWardrobe.map((item) => item.id));
    for (const item of demoWardrobe) {
      for (const pairing of item.pairings) {
        expect(ids.has(pairing.itemId)).toBe(true);
        expect(pairing.itemId).not.toBe(item.id);
      }
    }
  });

  it("canonicalizes a pairing regardless of direction", () => {
    expect(canonicalPairKey("z", "a")).toBe("a::z");
    expect(canonicalPairKey("a", "z")).toBe("a::z");
  });

  it("does not double-count reciprocal observed pairings", () => {
    const first = { ...demoWardrobe[0], pairings: [{ itemId: demoWardrobe[1].id, type: "worn" as const, count: 1, rationale: "Synthetic test" }] };
    const second = { ...demoWardrobe[1], pairings: [{ itemId: first.id, type: "worn" as const, count: 1, rationale: "Synthetic test" }] };
    const observed = observedPairings([first, second]);
    const keys = observed.map(({ left, right }) => canonicalPairKey(left.id, right.id));
    expect(new Set(keys).size).toBe(keys.length);
    expect(observed.length).toBeGreaterThan(0);
  });
});
