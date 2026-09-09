# BondStats — Financial Data Trail Explorer · Phase 2

Phase 2 adds a small automated provenance-health layer to the existing static Financial Data Trail Explorer.

## What is automated

A GitHub Actions workflow runs every six hours and checks whether mapped official/public source endpoints and the BondStats master yield dataset are reachable. It records only operational metadata:

- endpoint reachable / unreachable
- HTTP status
- request latency
- check timestamp
- returned content type

The generated snapshot is written to:

`public/data/lineage-health.json`

The explorer loads that file in the browser and displays current pipeline-health metadata in the UI.

## What is deliberately NOT automated

This version does **not** scrape, republish, cache, copy, or reproduce third-party charts, articles, logos, screenshots, branded interfaces, or substantial source content. It also does not invent observations, freshness scores, confidence ratings, or source values.

The health job checks endpoint availability only. Actual financial observations remain linked to their official/public source or to BondStats-owned datasets.

## Copyright / provenance policy

All UI code, layout, wording, metadata schema and generated health records in this repo are original BondStats material.

Third-party references are limited to:
- factual institution/source names
- series identifiers
- public URLs
- machine-generated HTTP metadata

No third-party logos or artwork are bundled.

## Workflow

`.github/workflows/data-lineage-health.yml`

Schedule:
`17 */6 * * *`

Manual run is also enabled through `workflow_dispatch`.

## Local test

```bash
npm install
npm run update:lineage
npm run build
```

## Route

`/tools/developer-tools/financial-data-trail-explorer/`

## Deployment note

For the standalone GitHub repo, deploy this Astro project as usual. For the BondStats main site, copy the explorer route plus `public/data/lineage-health.json`; if the automation is to live in the main repo, also copy the registry, script and workflow.


## GitHub Pages deployment

This standalone repo is configured for GitHub Pages via GitHub Actions.

In GitHub:
1. Open `Settings → Pages`.
2. Set **Source** to **GitHub Actions**.
3. Push to `main` or run the `Deploy Astro to GitHub Pages` workflow manually.

The repo includes `.nojekyll` to prevent the legacy Jekyll builder from processing Astro files.

Expected Pages path:

`/bondstats-financial-data-trail-explorer/`

The health feed is loaded using Astro's `BASE_URL`, so it works correctly from the repository subpath.
