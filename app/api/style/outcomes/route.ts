import { NextResponse } from "next/server";

import { getActiveProfileId } from "@/lib/profile";
import { readStore, writeStore } from "@/lib/store";

const allowed = new Set(["saved", "tried", "worked", "not-for-me", "wrong-context"]);

export async function POST(request: Request) {
  const ownerId = await getActiveProfileId();
  const body = await request.json().catch(() => ({})) as { recommendationId?: string; status?: string };
  if (!body.recommendationId || !body.status || !allowed.has(body.status)) {
    return NextResponse.json({ message: "Invalid recommendation outcome." }, { status: 400 });
  }
  const store = readStore();
  const outcome = { ownerId, recommendationId: body.recommendationId, status: body.status as "saved" | "tried" | "worked" | "not-for-me" | "wrong-context", recordedAt: new Date().toISOString() };
  store.recommendationOutcomes = [outcome, ...store.recommendationOutcomes.filter((entry) => !(entry.ownerId === ownerId && entry.recommendationId === body.recommendationId))];
  writeStore(store);
  return NextResponse.json({ outcome });
}
