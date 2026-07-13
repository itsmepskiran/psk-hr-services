# Sheetal Paidimarri — PSK Services & Portfolio

A single repo hosting two static sites plus a landing page that links between them.

## Structure

- `index.html` — root landing page linking to both sites below
- `hr-services/` — PSK Services HR & Business Consulting site (Part of BMG Enterprises)
- `portfolio/` — Sheetal Paidimarri's personal portfolio site

Both sites are plain HTML, CSS and vanilla JavaScript — no build step required.

## Run locally

Serve the repo root so relative links between sites work:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

Enabled via GitHub Pages from the `main` branch. The root `index.html` acts
as the entry point, linking to `/hr-services/` and `/portfolio/`.

## History

`portfolio/` was merged in from the standalone
[itsmepskiran/portfolio](https://github.com/itsmepskiran/portfolio) repo via
`git subtree`, preserving its full commit history.
