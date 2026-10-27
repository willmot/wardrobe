import { afterEach, beforeEach, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
const script = path.resolve("scripts/setup.mjs");
let directory: string;
beforeEach(() => { directory = mkdtempSync(path.join(os.tmpdir(), "wardrobe-setup-test-")); });
afterEach(() => { rmSync(directory, { recursive: true, force: true }); });
it("creates an empty personal setup and refuses to overwrite it", () => {
  const args = [script, "--name", "Sample User", "--photos-name", "Sample Search", "--empty"];
  execFileSync(process.execPath, args, { cwd: directory });
  const original = readFileSync(path.join(directory, "wardrobe.config.json"), "utf8");
  const config = JSON.parse(original);
  expect(config.seedDemo).toBe(false); expect(config.profiles[0].photosName).toBe("Sample Search");
  expect(config.profiles[0].initials).toBe("SU");
  expect(() => execFileSync(process.execPath, args, { cwd: directory, stdio: "pipe" })).toThrow();
  expect(readFileSync(path.join(directory, "wardrobe.config.json"), "utf8")).toBe(original);
});
