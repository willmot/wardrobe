# Wardrobe

A local-first wardrobe catalogue and style workspace. Browse your clothes, correct item details, plan outfits, and keep style advice connected to source evidence.

The project is designed to work alongside Codex: the app provides the catalogue and review interface; Codex helps you import evidence, identify garments, research uncertain matches, and prepare style editions.

**The repository contains only fictional demo garments and original SVG illustrations. No personal photos, wardrobe history, private configuration, or API keys are included.**

## Try the demo

Install [Node.js 22 or later](https://nodejs.org/), then:

```sh
git clone https://github.com/willmot/wardrobe.git
cd wardrobe
npm ci
npm run dev
```

Open <http://127.0.0.1:3000>. The first run creates four fictional garments in `.runtime/wardrobe.json`. No API key or Photos access is needed. The demo banner makes sample content explicit.

## Start your own wardrobe

Before running the app for the first time:

```sh
npm ci
npm run setup -- --name "Your name" --photos-name "Your Photos search name" --empty
npm run dev
```

The setup command creates an ignored, private `wardrobe.config.json`. `--empty` starts with no items, import history, or style claims. Use `--demo` instead to explore the fictional catalogue under your own display name.

If you already tried the demo, stop the server and move `.runtime/` and any existing `wardrobe.config.json` to a private backup outside the checkout before running setup. Setup refuses to overwrite an existing configuration or store. If you set a different data directory, back up that directory instead.

You can also copy `wardrobe.config.example.json` to `wardrobe.config.json` and edit it. Multiple profiles are supported; give each a unique lowercase ID. Configuration seeds the first run. After a store exists, profile edits live in the store; update names in Settings, and ask Codex to add additional profiles to the private store. Restart after changing configuration.

## Continue with Codex

Add the cloned folder as a local project in Codex. Start with:

> Read README.md, AGENTS.md, and docs/catalogue.md. Help me set up my own empty wardrobe. Keep personal data and images out of Git. Before using my Photos library, explain the available import options and what they can identify. Ask before sending any image to an external service.

See [the catalogue workflow](docs/catalogue.md) and [Photos discovery](docs/photos.md). Browsing works on platforms supported by Next.js; the optional Apple Photos helper requires macOS, Photos, and local automation permission.

## What works today

- Search and filter the catalogue; inspect source evidence and edit item details.
- Switch profiles and persist display names and Photos search names locally.
- Build an outfit draft from your own catalogue items.
- Discover recent photos from an explicitly configured inventory or optional Apple Photos search. Repeated discovery skips previously recorded identifiers.
- Display saved, evidence-linked style editions and recommendations; record feedback.
- Optionally request a text-to-image catalogue illustration using your own OpenAI API key.

This is a starter, not an automatic wardrobe extraction service. Imports record discovery results and, with an inventory, copy available image files for review. They do not identify clothes, create catalogue entries, or generate style advice automatically. Apple Photos text search is broader than a confirmed person match. Ask is a keyword lookup of saved advice, not a live AI chat. Outfit drafts are not saved; archiving and automated face redaction are not implemented. Image generation uses an item description rather than source photos, so it cannot establish product identity or exact construction.

## Private local data

| Path | Contents |
| --- | --- |
| `wardrobe.config.json` | Initial profile settings; ignored by Git |
| `.runtime/wardrobe.json` | Working profiles, catalogue, imports, observations, feedback |
| `.runtime/photos/` | Private evidence copies |
| `.runtime/renders/` | Optional generated catalogue illustrations |
| `.runtime/style/` | Your saved style editions and recommendations |
| `.env.local` | Optional local integration settings and API key |
| `public/demo/` | Public, fictional SVG demo illustrations only |

`.runtime/`, `.data/`, `data/`, temporary directories, user configuration, and environment files are ignored. Keep private photos out of `public/`: Next.js serves that directory as static content. Use `/api/media/photos/...` for private local evidence stored under `.runtime/photos/`. A configurable `WARDROBE_DATA_DIR` should point to an ignored directory or somewhere outside the repository. Back up both your configuration and private data directory; Git does not back them up.

The app binds to loopback and rejects foreign Host headers and cross-origin writes. **It has no authentication and is intended for one trusted local user, not public hosting.** Profiles are organisation tools, not access-control boundaries. Other software and people with access to the same computer can access the local app.

## Optional integrations

Copy `.env.example` to `.env.local` and uncomment only the settings you need. Node scripts do not load `.env.local`; if running setup with a custom data directory, set `WARDROBE_DATA_DIR` in the shell too.

For Photos, follow [docs/photos.md](docs/photos.md). Source photos are not automatically sent to an external service. If you choose to analyse images through Codex, its configured tools and account determine where those images are processed; review that separately.

For optional catalogue generation, set `OPENAI_API_KEY` in `.env.local`. Clicking the generation button asks for confirmation before sending the item's text description to OpenAI. API usage is billed separately from a Codex subscription. The implementation uses the Images API; consult [OpenAI's image generation documentation](https://developers.openai.com/api/docs/guides/image-generation) for current model access and behaviour. No paid API call is needed for setup, browsing, tests, or builds.

## Development

```sh
npm test
npm run typecheck
npm run build
npm start
```

The stack is Next.js App Router, React, TypeScript, and a local JSON store. Use one server process per data directory; this store is not designed for concurrent servers. Run `npm run check:public` after staging files to check the exact publication file list for private paths, common credential patterns, unexpected binaries, and private network references. This is an additional check, not a substitute for reviewing what you publish.

Read [CONTRIBUTING.md](CONTRIBUTING.md) before sharing changes. The code and original demo illustrations are [MIT licensed](LICENSE).
