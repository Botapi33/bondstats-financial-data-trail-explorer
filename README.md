# BondStats Financial Data Trail Explorer

A clean, static GitHub Pages repository.

## GitHub Pages setup

Use:

- **Settings → Pages**
- **Source:** Deploy from a branch
- **Branch:** `main`
- **Folder:** `/(root)`

There is no Astro, Jekyll front matter, build dependency, package manager, or deployment workflow in this repository.

The only GitHub Action is `Financial Data Trail Health`. It updates `data/lineage-health.json` every six hours and can also be run manually.

## Public files

- `index.html`
- `styles.css`
- `app.js`
- `data/lineage-registry.json`
- `data/lineage-health.json`

## Copyright policy

The explorer contains original BondStats UI/code and factual source metadata only. It does not include third-party logos, screenshots, charts, branded interfaces, or copied source text.
