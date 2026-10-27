# Optional Photos discovery

The demo and empty catalogue need no Photos integration. First set your Photos search name in Settings. Choose one of these optional discovery sources.

## Local inventory

Set `WARDROBE_PHOTOS_INVENTORY` in `.env.local` to a local JSON file with an `assets` array:

```json
{
  "assets": [
    {
      "uuid": "sample-photo-1",
      "filename": "sample-photo.jpg",
      "capturedAt": "2026-01-01T12:00:00Z",
      "mediaType": "photo",
      "people": ["Your Photos search name"],
      "labels": [],
      "derivativePath": "/absolute/path/to/a/photo.jpg"
    }
  ]
}
```

The example is synthetic. Store your real inventory outside Git. Subject matching is case-insensitive exact matching against `people`; photos outside the selected time window, videos, duplicate IDs, and unsafe IDs are excluded. The inventory is an input format, not an included full-library exporter. A missing or malformed inventory must be fixed locally.

`derivativePath` points to a local JPEG, PNG, or WebP. Available files are copied to the private data directory under `photos/<profile-id>/`, keeping their extension. An optional `WARDROBE_PHOTOS_LIBRARY` enables lookup of one known Photos derivative layout for assets without an explicit path; this layout is not guaranteed across Photos versions. Explicit paths are more predictable.

Imports record identifiers and skip already discovered photos on later runs. This does not deduplicate visually similar garments. If a photo was discovered before its image became available, materialise it separately with Codex; repeated discovery does not retry skipped files automatically.

## Apple Photos on macOS

Set `WARDROBE_ENABLE_PHOTOS=1` in `.env.local`, restart the server, open Photos, and use Imports. macOS may request permission for the launching terminal/app to control Photos.

The helper uses Photos' **text search**, followed by a date window. This is not a People & Pets identity API, so names may match captions, places, or unrelated results. Review subject matches before using them as wardrobe evidence. Query results alone do not export images or identify clothing. The included export AppleScript is an optional helper for an explicitly selected search/window; it exports originals and should only be run after reviewing scope. Originals are never changed.

## Review with Codex

An import is a discovery record. Ask Codex to review selected evidence, propose garment entries, preserve source references, and save only reviewed results in the private store. External image analysis uses Codex's configured tools; get clear consent before sending any selected image outside the computer.
