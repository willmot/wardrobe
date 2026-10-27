"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { WardrobeItem } from "@/lib/types";
import { ResponsiveWardrobeImage } from "@/components/responsive-wardrobe-image";

const categories = ["All", "Tops", "Knitwear", "Dresses", "Outerwear", "Bottoms", "Footwear", "Accessories"] as const;
type Category = (typeof categories)[number];
export type WardrobeCardItem = Pick<WardrobeItem, "id" | "name" | "brand" | "product" | "color" | "material" | "category" | "lastWorn" | "image" | "aiGenerated">;

export function WardrobeView({ initialItems }: { initialItems: WardrobeCardItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");

  const availableCategories = useMemo(() => {
    const represented = new Set(initialItems.map((item) => item.category));
    return categories.filter((entry) => entry === "All" || represented.has(entry));
  }, [initialItems]);

  useEffect(() => {
    if (!availableCategories.includes(category)) setCategory("All");
  }, [availableCategories, category]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return initialItems
      .filter((item) => {
        const matchesQuery = !normalized || [item.name, item.brand, item.product, item.color, item.material].join(" ").toLowerCase().includes(normalized);
        return matchesQuery && (category === "All" || item.category === category);
      })
      .sort((a, b) => new Date(b.lastWorn).getTime() - new Date(a.lastWorn).getTime());
  }, [category, initialItems, query]);

  return (
    <>
      <section className="collection-heading">
        <p className="collection-count">{initialItems.length} pieces</p>
        <h1>Your wardrobe, in one place.</h1>
        <p>Your clothes, source evidence, and ideas for what to wear next.</p>
      </section>

      <div className="collection-controls">
        <div className="category-tabs" role="group" aria-label="Filter wardrobe by category">
          {availableCategories.map((entry) => (
            <button key={entry} type="button" aria-pressed={category === entry} onClick={() => setCategory(entry)}>{entry}</button>
          ))}
        </div>
        <label className="collection-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Search wardrobe</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" />
        </label>
      </div>

      {filteredItems.length ? (
        <div className="garment-grid" aria-live="polite">
          {filteredItems.map((item) => (
            <Link className="garment-tile" href={`/wardrobe/${item.id}`} key={item.id} aria-label={`Open ${item.name}`} onClick={() => sessionStorage.setItem("wardrobe:last-opened", item.id)}>
              <span className={`garment-image${item.aiGenerated ? "" : " source-evidence"}`}>
                <ResponsiveWardrobeImage src={item.image} alt="" />
              </span>
              <span className="garment-meta">
                <strong>{item.name}</strong>
                <span>{item.brand}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h2>No pieces found</h2>
          <p>Try another name, brand, colour, or category.</p>
          <button className="button button-secondary" type="button" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button>
        </div>
      )}
    </>
  );
}
