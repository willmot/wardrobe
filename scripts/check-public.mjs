import { execFileSync } from "node:child_process";

// Scan the exact Git index: ignored local state must never become publication input.
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const allowedRoots = new Set(["app", "components", "lib", "scripts", "tests", "docs", "public", ".github"]);
const allowedFiles = new Set([".gitignore", ".env.example", "README.md", "AGENTS.md", "CONTRIBUTING.md", "LICENSE", "package.json", "package-lock.json", "tsconfig.json", "vitest.config.ts", "next.config.ts", "proxy.ts", "wardrobe.config.example.json"]);
const patterns = [
  ["private machine path", /\/(?:Users|home)\/[a-zA-Z0-9_.-]+\//],
  ["private network URL", /https?:\/\/[^\s"'<>]*(?:\.ts\.net|\.local|\.hmn\.md)/i],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["credential-shaped token", /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|AKIA[A-Z0-9]{16})\b/],
  ["email address", /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/],
];
const errors = [];
for (const file of files) {
  const root = file.split("/")[0];
  if (!allowedFiles.has(file) && !allowedRoots.has(root)) errors.push(`${file}: unexpected publication path`);
  if (file.startsWith("public/") && !/^public\/demo\/demo-[a-z-]+\.svg$/.test(file)) errors.push(`${file}: only reviewed demo SVGs may be published`);
  if (/(?:^|\/)(?:\.runtime|\.data|data|tmp|backups|node_modules|\.next)(?:\/|$)/.test(file) || /(?:^|\/)\.env(?!\.example$)/.test(file) || file === "wardrobe.config.json") errors.push(`${file}: private state path`);
  const buffer = execFileSync("git", ["show", `:${file}`], { maxBuffer: 10 * 1024 * 1024 });
  if (buffer.includes(0)) { errors.push(`${file}: unexpected binary file`); continue; }
  const text = buffer.toString("utf8");
  for (const [label, pattern] of patterns) if (pattern.test(text)) errors.push(`${file}: ${label}`);
}
if (!files.length) errors.push("No Git-tracked files were found.");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Public-file checks passed for ${files.length} tracked text/SVG files. Review remains necessary; pattern checks cannot prove absence of every kind of personal information.`);
