import type { Metadata } from "next";

import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { getActiveProfile } from "@/lib/profile";
import { getConfig } from "@/lib/config";
import { getProfiles } from "@/lib/store";

export const metadata: Metadata = {
  title: "Wardrobe | Personal catalogue",
  description: "A private, multi-person wardrobe catalogue built from Apple Photos evidence.",
};

export default async function RootLayout({ children, modal }: Readonly<{ children: React.ReactNode; modal?: React.ReactNode }>) {
  const activeProfile = await getActiveProfile();
  return (
    <html lang="en-GB">
      <body>
        <AppShell profiles={getProfiles()} activeProfile={activeProfile} demo={getConfig().seedDemo}>{children}</AppShell>
        {modal}
      </body>
    </html>
  );
}
