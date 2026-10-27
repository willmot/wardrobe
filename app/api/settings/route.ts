import { NextResponse } from "next/server";
import { getActiveProfileId } from "@/lib/profile";
import { readStore, writeStore } from "@/lib/store";
export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim() || body.name.length > 80 || typeof body.photosName !== "string" || body.photosName.length > 120) {
    return NextResponse.json({ message: "Provide a display name and Photos search name." }, { status: 400 });
  }
  const id = await getActiveProfileId();
  const store = readStore();
  const profile = store.profiles.find((entry) => entry.id === id)!;
  profile.name = body.name.trim(); profile.photosName = body.photosName.trim();
  profile.initials = profile.name.split(/\s+/).map((part) => Array.from(part)[0]).slice(0, 2).join("").toUpperCase();
  writeStore(store);
  return NextResponse.json({ profile });
}
