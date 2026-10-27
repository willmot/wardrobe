import type { Pairing, WardrobeItem } from "./types";

export function canonicalPairKey(left: string, right: string): string {
  return [left, right].sort().join("::");
}

export function uniqueWardrobeItems(items: WardrobeItem[]): WardrobeItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function observedPairings(items: WardrobeItem[]): Array<{ left: WardrobeItem; right: WardrobeItem; pairing: Pairing }> {
  const byId = new Map(items.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const result: Array<{ left: WardrobeItem; right: WardrobeItem; pairing: Pairing }> = [];
  for (const left of items) {
    for (const pairing of left.pairings) {
      if (pairing.type !== "worn") continue;
      const right = byId.get(pairing.itemId);
      if (!right) continue;
      const key = canonicalPairKey(left.id, right.id);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ left, right, pairing });
    }
  }
  return result;
}
