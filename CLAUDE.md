# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## What this is

MSI Studio — the agency's own showcase site, linking out to the other projects as
portfolio pieces. Static HTML/CSS/JS, no build step. See the root `../CLAUDE.md` for
shared conventions (preview/deploy commands, SEO expectations, image guidelines).
There's also a `README.md` in this repo — check it too.

## Structure

`index.html` at root, `css/style.css`, `js/main.js`, work-sample thumbnails in
`images/` (`work-ajs-detailing.jpg`, `work-caiomsi-portfolio.jpg`,
`work-jc-escapamentos.jpg`, `work-maple-and-bean.jpg`, `work-strata.jpg`,
`work-vila-velar.jpg` — keep these in sync as the portfolio grows). Deployed via
GitHub Pages at `work.caiomsi.com` (Cloudflare DNS, see `CNAME`).

## Design language

"The Drafting Table" — an ink-on-paper, refined/premium look (see memory: design
taste favors refined over loud). Check `css/style.css`'s design tokens before
changing colors/type.

## Contact form — wired

The contact form POSTs JSON to the shared `MSI-Forms` backend
(`https://forms.caiomsi.com/api/submit`), same pattern as `Caiomsi-Main`. Keep the
hidden `company` honeypot field.
