# BondStats Financial Data Trail Explorer — Branch Pages Fix

This patch changes the standalone tool to the same simple GitHub Pages model used by the other BondStats tools:

- GitHub Pages source: **Deploy from a branch**
- Branch: **main**
- Folder: **/docs**
- No Astro deployment workflow is required.
- The site itself is plain static HTML in `docs/index.html`.
- The existing scheduled Action is used only to refresh the lineage health JSON.

## Important

Delete `.github/workflows/deploy.yml` if it exists from the earlier Astro Pages attempt.

Then set:

`Settings → Pages → Build and deployment → Source: Deploy from a branch`

Branch:
`main`

Folder:
`/docs`

Save.

The public site will then be:

`https://<github-user>.github.io/bondstats-financial-data-trail-explorer/`

## Copyright

No third-party logos, screenshots, charts, branded interfaces, or copied source content are included.
