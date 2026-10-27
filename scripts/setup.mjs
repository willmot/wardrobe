import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log('Usage: npm run setup -- --name "Your name" [--photos-name "Photos search name"] [--empty | --demo]');
  process.exit(0);
}
function option(flag) {
  const index = args.indexOf(flag);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value.`);
  return value;
}
const allowed = new Set(["--name", "--photos-name", "--empty", "--demo"]);
for (let i = 0; i < args.length; i++) {
  if (!allowed.has(args[i])) throw new Error(`Unknown option: ${args[i]}`);
  if (["--name", "--photos-name"].includes(args[i])) i++;
}
if (args.includes("--empty") && args.includes("--demo")) throw new Error("Choose either --empty or --demo.");
const name = option("--name")?.trim();
if (!name) throw new Error('Set your name: npm run setup -- --name "Your name" --empty');
const dataDir = path.resolve(process.env.WARDROBE_DATA_DIR || ".runtime");
if (existsSync("wardrobe.config.json") || existsSync(path.join(dataDir, "wardrobe.json"))) {
  throw new Error("Existing setup found. Use Settings to rename the profile. For a fresh start, stop the server and move wardrobe.config.json and your private data directory to a backup first.");
}
const config = {
  profiles: [{ id: "default", name, photosName: option("--photos-name")?.trim() || name,
    initials: name.split(/\s+/).map((part) => Array.from(part)[0]).slice(0, 2).join("").toUpperCase() }],
  seedDemo: args.includes("--demo"),
};
writeFileSync("wardrobe.config.json", `${JSON.stringify(config, null, 2)}\n`, { flag: "wx", mode: 0o600 });
console.log("Created private configuration. Run npm run dev and open http://127.0.0.1:3000.");
