# Contributing

Use Node.js 22 or later and `npm ci`. Keep changes reusable across profiles and platforms; optional Photos integration may require macOS but browsing must not.

Before proposing a change, run `npm test`, `npm run typecheck`, and `npm run build`. Stage only the intended code, synthetic fixtures, and documentation, then run `npm run check:public` and inspect the staged diff. Never attach real wardrobe records, private photos, access-bearing links, or credentials to a public issue or pull request. Reproduce issues with fictional data.

Use `.github/PULL_REQUEST_TEMPLATE.md` for pull requests. Include a synthetic-only screenshot when it helps explain an interface change. Upload it as a PR attachment; do not commit screenshots containing personal information. Describe pending checks honestly. Keep code and original demo art compatible with the MIT license.
