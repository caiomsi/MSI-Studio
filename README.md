# MSI Studio

Agency showcase site for **MSI Studio** — a small web-development studio building fast,
hand-coded static websites for small businesses. Showcases selected work and links out
to each live site.

- **Live:** https://work.caiomsi.com
- **Stack:** plain static HTML + CSS + vanilla JS, no build step.
- **Aesthetic:** bold / brutalist — saturated color blocks, oversized type, hard offset shadows.

## Featured work

| Project | Live URL |
|---------|----------|
| Maple & Bean (coffee shop) | https://maplenbean.caiomsi.com |
| AJ's Diamond Detailing | https://caiomsi.github.io/AJs-DD/ |
| Caio·MSI (personal portfolio) | https://caiomsi.com |

## Develop

Open `index.html` directly, or serve the folder for correct relative paths:

```bash
python3 -m http.server
# visit http://localhost:8000
```

## Deploy

Hosted on GitHub Pages from the `master` branch. Push to deploy:

```bash
git add -A && git commit -m "..." && git push
```

Custom domain `work.caiomsi.com` is set via the `CNAME` file + a Cloudflare DNS
`CNAME work → caiomsi.github.io` record.

## Structure

```
index.html        single page, all sections
css/style.css      design tokens + all styles
js/main.js         nav, scroll-reveal, interactions
images/            portfolio thumbnails + og image
favicon.svg
```
