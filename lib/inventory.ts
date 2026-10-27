import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type InventoryPhoto = {
  uuid: string; filename: string; capturedAt: string; mediaType: string;
  people: string[]; labels: string[]; derivativePath?: string;
};
export function inventoryPath(): string | undefined {
  return process.env.WARDROBE_PHOTOS_INVENTORY ? path.resolve(process.env.WARDROBE_PHOTOS_INVENTORY) : undefined;
}
export function hasInventory(): boolean {
  const filename = inventoryPath();
  return Boolean(filename && existsSync(filename));
}
export function queryInventory({ person, days = 30, now = new Date() }: { person: string; days?: number; now?: Date }): InventoryPhoto[] {
  const filename = inventoryPath();
  if (!filename || !existsSync(filename) || !person.trim()) return [];
  const parsed = JSON.parse(readFileSync(filename, "utf8")) as { assets?: InventoryPhoto[] };
  if (!Array.isArray(parsed.assets)) throw new Error("Photos inventory needs an assets array.");
  const seen = new Set<string>();
  return parsed.assets.filter((photo) => {
    if (!photo || typeof photo.uuid !== "string" || !/^[a-z0-9-]+$/i.test(photo.uuid) || seen.has(photo.uuid) || photo.mediaType !== "photo" || !Array.isArray(photo.people)) return false;
    const timestamp = new Date(photo.capturedAt).getTime();
    const matches = photo.people.some((name) => typeof name === "string" && name.trim().toLocaleLowerCase() === person.trim().toLocaleLowerCase());
    if (!matches || !Number.isFinite(timestamp) || timestamp > now.getTime() || timestamp < now.getTime() - days * 86400000) return false;
    seen.add(photo.uuid); return true;
  }).map((photo) => ({ ...photo, labels: Array.isArray(photo.labels) ? photo.labels : [], derivativePath: typeof photo.derivativePath === "string" ? photo.derivativePath : undefined }))
    .map((photo) => {
      if (photo.derivativePath || !process.env.WARDROBE_PHOTOS_LIBRARY) return photo;
      const candidate = path.join(process.env.WARDROBE_PHOTOS_LIBRARY, "resources/derivatives/masters", photo.uuid.slice(0, 1), `${photo.uuid}_4_5005_c.jpeg`);
      return existsSync(candidate) ? { ...photo, derivativePath: candidate } : photo;
    }).sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
}
export function materializePhotos(photos: InventoryPhoto[], destination: string): number {
  mkdirSync(destination, { recursive: true, mode: 0o700 });
  let copied = 0;
  for (const photo of photos) {
    if (!/^[a-z0-9-]+$/i.test(photo.uuid) || !photo.derivativePath || !existsSync(photo.derivativePath)) continue;
    const extension = path.extname(photo.derivativePath).toLowerCase();
    if (![".jpeg", ".jpg", ".png", ".webp"].includes(extension)) continue;
    const target = path.join(destination, `${photo.uuid}${extension}`);
    if (!existsSync(target)) { copyFileSync(photo.derivativePath, target); copied++; }
  }
  return copied;
}
