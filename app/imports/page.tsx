import { ImportsView } from "@/components/imports-view";
import { getActiveProfile } from "@/lib/profile";
import { getImports } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ImportsPage() {
  const profile = await getActiveProfile();
  return <ImportsView initialImports={getImports(profile.id)} profile={profile} />;
}
