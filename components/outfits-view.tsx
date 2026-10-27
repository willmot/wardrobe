"use client";

import { useMemo, useState } from "react";
import { ResponsiveWardrobeImage } from "@/components/responsive-wardrobe-image";
import type { WardrobeItem } from "@/lib/types";

export type OutfitItem = Pick<WardrobeItem, "id" | "name" | "image" | "category">;
const slots: Array<{ key: string; label: string; categories: WardrobeItem["category"][] }> = [
  { key: "outer", label: "Outer layer", categories: ["Outerwear"] },
  { key: "top", label: "Top", categories: ["Tops", "Knitwear", "Dresses"] },
  { key: "bottom", label: "Bottoms", categories: ["Bottoms"] },
  { key: "shoes", label: "Shoes", categories: ["Footwear"] },
];
export function OutfitsView({ items }: { items: OutfitItem[]; ownerId: string }) {
  const options = useMemo(() => Object.fromEntries(slots.map((slot) => [slot.key, items.filter((item) => slot.categories.includes(item.category))])), [items]);
  const [selection, setSelection] = useState<Record<string, string>>({});
  return <>
    <section className="collection-heading outfit-heading"><p className="collection-count">An editable outfit plan</p><h1>Build a look from what you own.</h1><p>Try one combination at a time. These are catalogue pieces, not a prediction of fit or a record of something you have worn.</p></section>
    <section className="outfit-builder" aria-labelledby="builder-heading"><div className="outfit-section-heading"><h2 id="builder-heading">Build a look</h2><span>Unsaved draft</span></div>
      <div className="outfit-builder-layout"><div className="outfit-plan" aria-live="polite">{slots.map((slot) => {
        const item = options[slot.key].find((candidate) => candidate.id === selection[slot.key]);
        return <figure className={`outfit-plan-piece outfit-plan-piece-${slot.key}`} key={slot.key}><div className="outfit-plan-piece-visual">{item ? <ResponsiveWardrobeImage src={item.image} alt="" /> : <span>Choose an item</span>}</div><figcaption><span>{slot.label}</span><strong>{item?.name ?? "None"}</strong></figcaption></figure>;
      })}</div><div className="outfit-slot-editor">{slots.map((slot) => <label className="outfit-slot" key={slot.key}><span>{slot.label}</span><select value={selection[slot.key] ?? ""} onChange={(event) => setSelection((current) => ({ ...current, [slot.key]: event.target.value }))}><option value="">None</option>{options[slot.key].map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>)}</div></div>
    </section>
  </>;
}
