import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!/^[a-z0-9-]+\.png$/i.test(filename)) return NextResponse.json({ message: "Invalid render path." }, { status: 400 });
  const directory = process.env.WARDROBE_DATA_DIR ? path.resolve(process.env.WARDROBE_DATA_DIR) : path.join(process.cwd(), ".runtime");
  try {
    const image = await readFile(path.join(directory, "renders", filename));
    return new NextResponse(image, { headers: { "content-type": "image/png", "cache-control": "private, max-age=31536000, immutable" } });
  } catch {
    return NextResponse.json({ message: "Render not found." }, { status: 404 });
  }
}
