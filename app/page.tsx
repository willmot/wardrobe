import { WardrobeView } from "@/components/wardrobe-view";
import { getActiveProfileId } from "@/lib/profile";
import { getWardrobe } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const ownerId = await getActiveProfileId();
  const items = getWardrobe(ownerId).map(({ id, name, brand, product, color, material, category, lastWorn, image, aiGenerated }) => ({
    id, name, brand, product, color, material, category, lastWorn, image, aiGenerated,
  }));
  return <WardrobeView initialItems={items} />;
}
