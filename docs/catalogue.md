# Personal catalogue and style workflow

The app's JSON schemas are TypeScript types in `lib/types.ts` and `lib/style-assistant-types.ts`. Personal data belongs in the ignored private data directory (`.runtime/` by default). Keep the server stopped while editing the JSON with Codex, and make a private backup first.

## Add real items

Start with `npm run setup -- --name "Your name" --empty`. Read the `WardrobeItem` type and ask Codex to help create entries from reviewed photos or your own descriptions. There is no automatic photo-to-garment pipeline in the app.

Each item needs a unique ID and an existing profile's `ownerId`. Describe unknown brands as unknown. Keep uncertainty in `confidence` and `notes`. Use `/api/media/photos/<profile-id>/<filename>` for local source images and `/api/media/renders/<filename>` for private illustration files. A placeholder image such as `/demo/demo-shirt.svg` can be used until you add your own illustration; do not treat it as evidence. Use the matching source date for each source image. Add observed pairings and wear counts only when source evidence supports them. Proposed outfits are `suggested`, not `worn`.

The catalogue supports editing existing entries in the browser. Adding entries and structured outfit observations currently uses the private JSON store with Codex. Do not replace an existing store with a new demo seed.

## Save style editions

The loader reads these optional private files under `.runtime/style/`:

- `profiles.json`: `{ "activeEditionByOwner": { "default": "my-edition" }, "editions": [/* StyleProfileEdition objects */], "legacyEditions": [] }`
- `recommendations.json`: `{ "recommendations": [/* StyleRecommendation objects */] }`
- `weekly.json`: `{ "activeEdition": "my-week", "editions": [/* WeeklyStyleEdition objects */] }`

The snippets show envelope structure, not directly usable JSON: replace comments with validated objects matching the types. Use your actual profile ID instead of `default` if you configured another one. Keep recommendation `ownerId` and `editionId` aligned with the active edition. Briefing entries use `surface: "briefing"` and a `briefingSlot`. Reference only existing wardrobe items and observations. Weekly review maps should include the relevant owner. Dates and source claims must be supported, not copied from fictional examples.

Without private editions, an empty wardrobe shows an honest empty state. The demo alone displays synthetic example advice. Generated visuals are optional and never count as observations.

## Limits

The JSON store uses atomic file replacement, but it is not a multi-process database. Run one app server per data directory and avoid simultaneous manual edits. Backups, Photos original export, vision review, product research, and style-edition authoring are deliberate local workflows, not background jobs included with this starter.
