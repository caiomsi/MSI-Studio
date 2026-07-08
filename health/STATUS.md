# Site health — FAIL (2026-07-06)

**This is not a report of site outages.** The monitoring container's outbound
network egress was blocked by the environment's proxy policy for every
target host (HTTP 403 on CONNECT — "policy denial", per
`$HTTPS_PROXY/__agentproxy/status`). No HTTP requests reached any of the
sites below, via curl or via WebFetch. The actual live status of these
properties is unknown from this run.

| # | URL | Result |
|---|-----|--------|
| 1 | https://work.caiomsi.com/ | not reached — proxy 403 (policy denial) |
| 2 | https://caiomsi.com/ | not reached — proxy 403 (policy denial) |
| 3 | https://maplenbean.caiomsi.com/ | not reached — proxy 403 (policy denial) |
| 4 | https://bluepipe.caiomsi.com/ | not reached — proxy 403 (policy denial) |
| 5 | https://caiomsi.github.io/AJs-DD/ | not reached — proxy 403 (policy denial) |
| 6 | https://caiomsi.github.io/JC-escapamentos/ | not reached — proxy 403 (policy denial) |
| 7 | https://caiomsi.github.io/Vila-Velar/ | not reached — proxy 403 (policy denial) |
| 8 | https://caiomsi.github.io/STRATA/ | not reached — proxy 403 (policy denial) |
| 9 | https://caiomsi.github.io/Brasa-e-Sal/ | not reached — proxy 403 (policy denial) |
| 10 | https://caiomsi.github.io/PhotoFolio/ | not reached — proxy 403 (policy denial) |
| 11 | https://caiomsi.github.io/pac-game/ | not reached — proxy 403 (policy denial) |
| 12 | https://forms.caiomsi.com/api/submit | not reached — proxy 403 (policy denial) |

No content was fetched, so the placeholder/leak scan (`placehold.co`,
`TEXTO DE EXEMPLO`, `REPLACE WITH`, `formspree`, `lorem ipsum`) could not be
run this cycle.

## Changes since last report

First report. No prior `health/STATUS.md` existed. This run could not
establish a baseline because none of the target hosts were reachable from
this environment — the egress proxy rejected every CONNECT with a 403
(recorded in `recentRelayFailures` for `work.caiomsi.com`, `caiomsi.com`,
`maplenbean.caiomsi.com`, `bluepipe.caiomsi.com`, `caiomsi.github.io`,
`forms.caiomsi.com`).

**Action needed:** the environment's network egress policy needs
`caiomsi.com` (+ subdomains) and `caiomsi.github.io` added to its allowlist
before this routine can actually check site health.
