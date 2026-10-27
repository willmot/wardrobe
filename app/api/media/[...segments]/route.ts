import { readFile, realpath } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { privateDataDirectory } from "@/lib/config";
export const runtime = "nodejs";
const mime: Record<string, string> = { ".jpeg": "image/jpeg", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };
export async function GET(_request: Request, { params }: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await params;
  if (segments.length < 2 || !["photos", "renders"].includes(segments[0]) || segments.some((part) => !/^[a-z0-9][a-z0-9._-]*$/i.test(part))) return new NextResponse(null, { status: 400 });
  const contentType = mime[path.extname(segments.at(-1)!).toLowerCase()];
  if (!contentType) return new NextResponse(null, { status: 400 });
  try {
    const root = await realpath(privateDataDirectory());
    const filename = await realpath(path.join(root, ...segments));
    if (!filename.startsWith(`${root}${path.sep}`)) return new NextResponse(null, { status: 403 });
    return new NextResponse(await readFile(filename), { headers: { "content-type": contentType, "cache-control": "private, no-store", "x-content-type-options": "nosniff" } });
  } catch { return new NextResponse(null, { status: 404 }); }
}
