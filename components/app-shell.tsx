"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Archive, Images, Settings } from "lucide-react";
import { useTransition } from "react";

import type { WardrobeProfile } from "@/lib/types";

function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/" || pathname.startsWith("/wardrobe/");
  return pathname.startsWith(href);
}

export function AppShell({ children, profiles, activeProfile, demo }: { children: React.ReactNode; profiles: WardrobeProfile[]; activeProfile: WardrobeProfile; demo: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [switching, startTransition] = useTransition();

  function switchProfile(profileId: string) {
    if (profileId === activeProfile.id) return;
    startTransition(async () => {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileId }),
      });
      if (!response.ok) return;
      if (pathname.startsWith("/wardrobe/")) {
        router.replace("/");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label={`${activeProfile.name}'s wardrobe home`}>
          <span className="wordmark-mark" aria-hidden="true">{activeProfile.initials}</span>
          <span>{activeProfile.name}&apos;s wardrobe</span>
        </Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          <Link href="/" aria-current={isCurrent(pathname, "/") ? "page" : undefined}>Wardrobe</Link>
          <Link href="/outfits" aria-current={isCurrent(pathname, "/outfits") ? "page" : undefined}>Outfits</Link>
          <Link href="/style" aria-current={isCurrent(pathname, "/style") ? "page" : undefined}>Style</Link>
        </nav>
        <nav className="utility-nav" aria-label="Workspace">
          <label className="profile-switcher">
            <span className="sr-only">Current wardrobe</span>
            <span className="profile-switcher-avatar" aria-hidden="true">{activeProfile.initials}</span>
            <select aria-label="Current wardrobe" value={activeProfile.id} disabled={switching} onChange={(event) => switchProfile(event.target.value)}>
              {profiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.name}</option>)}
            </select>
          </label>
          <Link href="/imports" aria-current={isCurrent(pathname, "/imports") ? "page" : undefined} aria-label="Import photos"><Images size={18} /></Link>
          <Link href="/settings" aria-current={isCurrent(pathname, "/settings") ? "page" : undefined} aria-label="Settings"><Settings size={18} /></Link>
          <Link href="/archive" aria-current={isCurrent(pathname, "/archive") ? "page" : undefined} aria-label="Archived items"><Archive size={18} /></Link>
        </nav>
      </header>
      <main id="main-content" className="content">{demo ? <p className="demo-notice">Demo workspace · fictional garments and sample advice, with no personal photo evidence. See README.md to start your own empty wardrobe.</p> : null}{children}</main>
      <Link className="floating-import" href="/imports" aria-label="Import more photos"><span aria-hidden="true">+</span><span className="floating-import-label">Import photos</span></Link>
    </div>
  );
}
