import "server-only";

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

export type PhotosMatch = { photosIdentifier: string; capturedAt: string };

function helperPath(name: string): string {
  return path.join(process.cwd(), "scripts", name);
}

function parseLines(output: string): PhotosMatch[] {
  return output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [photosIdentifier, capturedAt] = line.split("\t");
    return { photosIdentifier, capturedAt };
  }).filter((match) => match.photosIdentifier && match.capturedAt);
}

function appleScriptDate(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function dateWindow(days: number): [string, string] {
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  return [appleScriptDate(start), appleScriptDate(end)];
}

export async function queryPhotos(searchName = "", days = 30): Promise<PhotosMatch[]> {
  if (!searchName.trim()) throw new Error("Set a Photos search name in Settings first.");
  if (process.platform !== "darwin") throw new Error("Photos import requires macOS.");
  const [start, end] = dateWindow(days);
  const { stdout } = await execFileAsync("osascript", [helperPath("photos-query.applescript"), searchName, start, end], { timeout: 30_000, maxBuffer: 2_000_000 });
  return parseLines(stdout);
}

export async function exportPhotos(destination: string, searchName = "", days = 30): Promise<PhotosMatch[]> {
  if (!searchName.trim()) throw new Error("Set a Photos search name in Settings first.");
  if (process.platform !== "darwin") throw new Error("Photos import requires macOS.");
  const [start, end] = dateWindow(days);
  const { stdout } = await execFileAsync("osascript", [helperPath("photos-export.applescript"), searchName, start, end, destination], { timeout: 120_000, maxBuffer: 2_000_000 });
  return parseLines(stdout);
}
