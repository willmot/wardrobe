import { NextResponse } from "next/server";
import OpenAI from "openai";

import { getActiveProfileId } from "@/lib/profile";
import { getDataDirectory, getWardrobeItem, updateWardrobeItem } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requestedOwnerId = new URL(request.url).searchParams.get("ownerId");
  const ownerId = requestedOwnerId ?? await getActiveProfileId();
  const item = getWardrobeItem(id, ownerId);
  if (!item) return NextResponse.json({ message: "Wardrobe item not found." }, { status: 404 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ message: "Image generation is optional. Set OPENAI_API_KEY in .env.local to enable it." }, { status: 503 });

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  try {
    const result = await client.images.generate({
      model: "gpt-image-2",
      prompt: `Create a clean product catalogue render of this clothing item: ${item.name}. Preserve the approved details: ${item.color} ${item.material}, ${item.pattern}, ${item.product}. Show one isolated garment, no person, no mannequin, no hanger, no hands, transparent background, subtle contact shadow only, consistent 4:5 portrait framing, faithful colours and construction, no invented logos or details.`,
      size: "1024x1536",
      background: "transparent",
      output_format: "png",
    });
    const base64 = result.data?.[0]?.b64_json;
    if (!base64) return NextResponse.json({ message: "The image service returned no image data." }, { status: 502 });
    const { mkdirSync, writeFileSync } = await import("node:fs");
    const renderDirectory = `${getDataDirectory()}/renders`;
    mkdirSync(renderDirectory, { recursive: true, mode: 0o700 });
    const filename = `${crypto.randomUUID()}.png`;
    writeFileSync(`${renderDirectory}/${filename}`, Buffer.from(base64, "base64"), { mode: 0o600 });
    const updated = updateWardrobeItem(id, { image: `/api/renders/${filename}`, aiGenerated: true, renderState: "ready" }, ownerId);
    return NextResponse.json({ item: updated });
  } catch (error) {
    console.error("catalogue render failed", error);
    return NextResponse.json({ message: "The image service could not create this render. Try again later." }, { status: 502 });
  }
}
