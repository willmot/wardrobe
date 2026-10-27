import { NextResponse } from "next/server";

import { PROFILE_COOKIE } from "@/lib/profile";
import { getProfile } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { profileId?: string };
  if (!body.profileId || !getProfile(body.profileId)) {
    return NextResponse.json({ message: "Wardrobe profile not found." }, { status: 404 });
  }
  const response = NextResponse.json({ profile: getProfile(body.profileId) });
  response.cookies.set(PROFILE_COOKIE, body.profileId, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.url.startsWith("https:"),
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
