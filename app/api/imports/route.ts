import { NextResponse } from "next/server";

import { addImport, getDataDirectory, getImports } from "@/lib/store";
import type { ImportRun } from "@/lib/types";
import { getActiveProfile } from "@/lib/profile";
import { queryPhotos } from "@/lib/photos";
import { hasInventory, materializePhotos, queryInventory } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const profile = await getActiveProfile();
  const body = (await request.json().catch(() => null) ?? {}) as { days?: number };
  const days = Number.isFinite(body.days) ? Math.max(1, Math.min(366, Math.round(body.days!))) : 30;
  const now = new Date();
  const end = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const start = startDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  let importRun: ImportRun = {
    ownerId: profile.id,
    id: `import-${now.getTime()}`,
    startedAt: `${end}, ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    windowLabel: `${start} to ${end}`,
    status: "permission_needed",
    found: 0,
    newPhotos: 0,
    observations: 0,
    reviewCount: 0,
    message: "Photos discovery is not configured. Set an inventory path or enable the macOS helper in .env.local, restart, then retry.",
  };
  if (!profile.photosName.trim()) {
    return NextResponse.json({ message: "Set a Photos search name in Settings first." }, { status: 400 });
  }
  try {
    if (hasInventory()) {
      const matches = queryInventory({ person: profile.photosName, days, now });
      const existingPhotoIds = new Set(getImports(profile.id).flatMap((run) => run.photoIds ?? []));
      const newMatches = matches.filter((match) => !existingPhotoIds.has(match.uuid));
      const withDerivatives = matches.filter((match) => match.derivativePath).length;
      const exported = materializePhotos(newMatches, `${getDataDirectory()}/photos/${profile.id}`);
      importRun = {
        ...importRun,
        status: "ready_for_review",
        found: matches.length,
        newPhotos: newMatches.length,
        observations: 0,
        photoIds: matches.map((match) => match.uuid),
        skipped: matches.length - newMatches.length,
        exported,
        message: `Local Photos inventory found ${matches.length} recent photos for ${profile.photosName}; ${newMatches.length} new and ${matches.length - newMatches.length} already imported${withDerivatives ? ` (${withDerivatives} local derivatives available)` : ""}. ${exported} working copies are in the private data directory; vision review can continue locally.`,
      };
    } else if (process.platform === "darwin" && process.env.WARDROBE_ENABLE_PHOTOS === "1") {
      try {
        const matches = await queryPhotos(profile.photosName, days);
        const knownIds = new Set(getImports(profile.id).flatMap((run) => run.photoIds ?? []));
        const ids = [...new Set(matches.map((match) => match.photosIdentifier))];
        const fresh = ids.filter((id) => !knownIds.has(id));
        importRun = { ...importRun, status: "ready_for_review", found: ids.length, newPhotos: fresh.length, skipped: ids.length - fresh.length, photoIds: ids, message: `Found ${ids.length} local Photos search results, ${fresh.length} new. Review the subject matches before exporting or identifying clothes with Codex.` };
      } catch (error) {
        console.error("Photos query failed", error);
        importRun = { ...importRun, status: "permission_needed", message: "Photos could not be queried. Open Photos and allow the local app to control it, then retry." };
      }
    }
  } catch {
    return NextResponse.json({ message: "Could not read the configured Photos inventory. Check its JSON format and local file permissions." }, { status: 400 });
  }
  return NextResponse.json({ import: addImport(importRun, profile.id) });
}
