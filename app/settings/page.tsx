import { SettingsView } from "@/components/settings-view";
import { getActiveProfile } from "@/lib/profile";

export default async function SettingsPage() {
  const profile = await getActiveProfile();
  return <SettingsView profile={profile} />;
}
