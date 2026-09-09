# BondStats — Financial Data Trail Explorer

Distinct native Astro UI for tracing financial data from source to downstream BondStats use.

## Route
`/tools/developer-tools/financial-data-trail-explorer/`

## UI
This intentionally does **not** reuse the standard BondStats dashboard/card composition. It is a graph/canvas-style data-forensics interface with:
- Trace mode
- Dependency mode
- Node inspector
- Searchable mapped trail catalog
- Source-authority links
- Responsive mobile layout

## Data policy
V1 maps provenance/lineage relationships only. It does not fabricate live observations, timestamps, confidence scores, or freshness values.

## Build
`npm install`
`npm run build`
