import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
const script = path.resolve("scripts/check-public.mjs");
let directory: string;
beforeEach(() => {
  directory = mkdtempSync(path.join(os.tmpdir(), "wardrobe-public-test-"));
  execFileSync("git", ["init", "-q"], { cwd: directory });
});
afterEach(() => { rmSync(directory, { recursive: true, force: true }); });
it("examines staged bytes even when the working copy is subsequently cleaned", () => {
  writeFileSync(path.join(directory, "README.md"), `synthetic credential: ${"gh" + "p_"}${"x".repeat(30)}`);
  execFileSync("git", ["add", "README.md"], { cwd: directory });
  writeFileSync(path.join(directory, "README.md"), "Clean working copy");
  expect(() => execFileSync(process.execPath, [script], { cwd: directory, stdio: "pipe" })).toThrow();
});
it("rejects accidentally tracked private state", () => {
  mkdirSync(path.join(directory, ".runtime"));
  writeFileSync(path.join(directory, ".runtime/wardrobe.json"), "{}");
  execFileSync("git", ["add", ".runtime/wardrobe.json"], { cwd: directory });
  expect(() => execFileSync(process.execPath, [script], { cwd: directory, stdio: "pipe" })).toThrow();
});
it("accepts a minimal synthetic public document", () => {
  writeFileSync(path.join(directory, "README.md"), "A synthetic starter");
  execFileSync("git", ["add", "README.md"], { cwd: directory });
  expect(execFileSync(process.execPath, [script], { cwd: directory, encoding: "utf8" })).toContain("checks passed");
});
