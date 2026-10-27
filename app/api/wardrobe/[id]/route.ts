import { NextResponse } from "next/server";

import { getActiveProfileId } from "@/lib/profile";
import { getWardrobeItem, updateWardrobeItem } from "@/lib/store";
import type { WardrobeItem } from "@/lib/types";

const editableFields = new Set(["name", "brand", "product", "category", "color", "material", "pattern", "notes", "confidence"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ message: "Invalid item update." }, { status: 400 });
  const ownerId = typeof body.ownerId === "string" ? body.ownerId : await getActiveProfileId();
  if (!getWardrobeItem(id, ownerId)) return NextResponse.json({ message: "Wardrobe item not found." }, { status: 404 });
  const changes: Partial<WardrobeItem> = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === "tags" && Array.isArray(value)) {
      changes.tags = [...new Set(value.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean))].slice(0, 24);
      continue;
    }
    if (!editableFields.has(key) || typeof value !== "string") continue;
    if (key === "category" && !["Outerwear", "Tops", "Knitwear", "Dresses", "Bottoms", "Footwear", "Accessories"].includes(value)) continue;
    if (key === "confidence" && !["exact", "probable", "possible", "unidentified"].includes(value)) continue;
    (changes as Record<string, string>)[key] = value;
  }
  if (typeof changes.color === "string" && changes.color.trim()) {
    const current = getWardrobeItem(id, ownerId)!;
    changes.colors = { ...current.colors, primary: { ...current.colors.primary, name: changes.color.trim() } };
  }
  const updated = updateWardrobeItem(id, changes, ownerId);
  return NextResponse.json(updated);
}
