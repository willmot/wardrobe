import "server-only";

import { cookies } from "next/headers";

import { DEFAULT_PROFILE_ID, getProfile } from "./store";

export const PROFILE_COOKIE = "wardrobe-profile";

export async function getActiveProfileId(): Promise<string> {
  const requested = (await cookies()).get(PROFILE_COOKIE)?.value;
  return requested && getProfile(requested) ? requested : DEFAULT_PROFILE_ID;
}

export async function getActiveProfile() {
  const id = await getActiveProfileId();
  return getProfile(id)!;
}
