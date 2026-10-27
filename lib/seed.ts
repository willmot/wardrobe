import type { StoreShape, WardrobeItem, WardrobeProfile } from "./types";

/** Entirely fictional fixtures, with original SVG illustrations. No source photos. */
function garment(id: string, name: string, category: WardrobeItem["category"], color: string, hex: string): WardrobeItem {
  return {
    ownerId: "default", id, name, brand: "Demo", product: "Fictional sample garment", category,
    layer: category === "Outerwear" ? "Outer layer" : category === "Footwear" ? "Footwear" : "Base layer",
    color, colors: { primary: { name: color, hex } }, material: "Sample cotton fabric",
    pattern: "Plain", tags: ["demo"],
    style: { seasons: ["spring", "autumn"], textures: ["smooth"], formality: "casual", silhouettes: ["relaxed"], weight: "midweight" },
    lastWorn: "Not recorded", wornCount: 0, confidence: "unidentified", status: "approved",
    image: `/demo/${id}.svg`, sourceImages: [], sourceDates: [], pairings: [], research: [],
    notes: "Synthetic demonstration item. This is not a real person's clothing or wear history.",
    aiGenerated: false, renderState: "ready",
  };
}

export const demoWardrobe: WardrobeItem[] = [
  garment("demo-jacket", "Cobalt chore jacket", "Outerwear", "Cobalt", "#315fc4"),
  garment("demo-shirt", "Cream cotton shirt", "Tops", "Cream", "#e9dfc8"),
  garment("demo-trousers", "Forest straight trousers", "Bottoms", "Forest", "#456451"),
  garment("demo-shoes", "Rust canvas shoes", "Footwear", "Rust", "#a44e35"),
];
demoWardrobe[0].pairings = [{ itemId: "demo-shirt", type: "suggested", rationale: "A fictional example of a contrasting light base layer." }];

export function createInitialStore(profiles: WardrobeProfile[], seedDemo: boolean): StoreShape {
  return {
    profiles: structuredClone(profiles),
    wardrobe: seedDemo ? structuredClone(demoWardrobe).map((item) => ({ ...item, ownerId: profiles[0].id })) : [],
    imports: [], outfitObservations: [], recommendationOutcomes: [],
  };
}
export const demoStore = createInitialStore([{ id: "default", name: "Demo", photosName: "", initials: "D" }], true);
