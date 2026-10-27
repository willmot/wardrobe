import { notFound } from "next/navigation";

import { ItemDetailView } from "@/components/item-detail-view";
import { getActiveProfileId } from "@/lib/profile";
import { findWardrobeItem, getWardrobe } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function WardrobeItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activeOwnerId = await getActiveProfileId();
  const item = findWardrobeItem(id);
  if (!item) notFound();
  return <ItemDetailView initialItem={item} wardrobe={getWardrobe(item.ownerId)} activeOwnerId={activeOwnerId} />;
}
