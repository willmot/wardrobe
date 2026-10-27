import { NextResponse } from "next/server";

import { getActiveProfileId } from "@/lib/profile";
import { getWardrobe } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getWardrobe(await getActiveProfileId()));
}
