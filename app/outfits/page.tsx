import { OutfitsView } from "@/components/outfits-view";
import { getActiveProfileId } from "@/lib/profile";
import { getWardrobe } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function OutfitsPage() {
  const ownerId = await getActiveProfileId();
  const items = getWardrobe(ownerId).map(({ id, name, image, category }) => ({ id, name, image, category }));
  return <OutfitsView key={ownerId} items={items} ownerId={ownerId} />;
}
