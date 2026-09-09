# FINAL GitHub Pages branch fix

Use GitHub Pages exactly like a normal static BondStats standalone tool:

Settings → Pages
Source: Deploy from a branch
Branch: main
Folder: /(root)

Important:
- This patch puts the public site directly at repository root as `index.html`.
- `.nojekyll` is also at repository root.
- Delete `.github/workflows/deploy.yml` if that old Astro deploy workflow still exists.
- The Astro source files can remain in the repo; `.nojekyll` prevents Pages/Jekyll from processing them.
- The health action only updates `data/lineage-health.json`.

Public URL:
https://<username>.github.io/bondstats-financial-data-trail-explorer/
