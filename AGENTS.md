# Working on Wardrobe

## Read first

Read README.md and docs/catalogue.md. This is a reusable, local-first starter. The tracked fixtures are entirely synthetic. The app is a review workspace, not an autonomous clothing identification system.

## Data boundaries

- Keep every user's photos, identities, catalogue, import inventories, style editions, generated likenesses, credentials, and local machine paths out of tracked files.
- Private state belongs in `.runtime/` (or an explicitly configured ignored/private data directory). Only synthetic illustrations belong in `public/demo/`.
- Do not copy a Photos library or scan it automatically. Obtain the user's intended source, subject, and time window before accessing private photos. Never modify the source library.
- Explain what would leave the computer before external image analysis; obtain approval for the selected images. The app itself does not redact faces automatically.
- Generated images are illustrations. They must never become evidence of ownership, identity, actual wear, body shape, or a product match.
- Run `npm run check:public` against the staged file list and inspect the diff before any publication. Never force-add ignored data. Permission to edit locally does not imply permission to publish private data.

## Setup and schema

Use `npm run setup -- --name "Your name" --empty` before first launch for a personal wardrobe. Do not overwrite existing state; make a private backup first. Profiles and item ownership use generic string IDs; do not hardcode particular people.

`lib/types.ts` defines the catalogue, photo evidence, outfit observations, and store. `lib/style-assistant-types.ts` defines saved style editions and recommendations. Read these types before writing private JSON. Use unique lowercase IDs and keep item references valid. Maintain the existing owner IDs. The store path is `.runtime/wardrobe.json` unless WARDROBE_DATA_DIR is set. Private media is served by `/api/media/photos/...` and `/api/media/renders/...`; never place user media in public/.

## Evidence and style workflow

1. Agree on the person and photo window. Explain inventory import versus broad Photos text search; review subject matches locally.
2. Inspect selected images at sufficient resolution, distinguish visible details from guesses, deduplicate garments, and retain source references. Imported discovery records are not garment observations.
3. Propose uncertain item identities for review. Do not claim a brand from a resemblance, a full outfit from an upper-body crop, or retirement from a low photo count.
4. Write reviewed catalogue entries to the private store. Keep source dates aligned with source images and count each actual wear/session once. Synthetic fixtures have zero observed wears.
5. Create a personal style edition only when useful evidence and stated preferences exist. Advice should cite its supporting items/observations, label inference, and record missing evidence. Do not fill required fields with invented observations or budgets.
6. Save private style profiles to `.runtime/style/profiles.json`, recommendations to `recommendations.json`, and optional weekly editions to `weekly.json`. See docs/catalogue.md for file envelopes. Do not mark validation passed before checking references, owner isolation, provenance, and claim support.
7. Run tests, typecheck, and build for code changes; verify relevant routes and the fresh empty-profile experience.

## Product and engineering

Keep the calm editorial layout, clear garment imagery, accessible keyboard controls, and observed/suggested distinctions. Avoid false saved states, unsupported privacy promises, or automatic external calls. The app is single-process and local-only; profiles are not authentication. Keep loopback binding and the Host/origin checks. Do not remove them to make a hosted demo.
