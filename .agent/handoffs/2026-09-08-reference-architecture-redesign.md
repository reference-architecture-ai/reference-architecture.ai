# Handover: reference-architecture.ai redesign and relaunch

**Date**: 2026-09-08
**UTC Time**: 12:56:14 UTC
**Change Slug**: `reference-architecture-redesign`
**Branch**: `main` (26 commits, clean tree, in sync with origin)
**Session File**: none — this session began before the session-start contract was
applied to this repository. `MIGRATION_PLAN.md` at the repo root served as the running
plan and decision log throughout, and is the closest equivalent.

---

## Progress Summary

**Completed.** A single-file landing page and an abandoned Zola site were merged into one
live, indexed, searchable site at **https://reference-architecture.ai**.

Starting point: a 1,534-line standalone `index.html` in one directory, and a separate
GitHub repo running Zola 0.17 with the DeepThought theme, 15 content pages, and no
connection between the two. The apex domain resolved to nothing.

- **Content migrated in full.** 3 posts and 8 docs carried over; the 2020-22 Redis-era
  material kept at its original URLs and marked archived; DeepThought's demo page dropped.
- **Design ported into Zola.** Zola 0.23 removed shortcodes entirely and moved Tera to
  v2, so this became a rebuild rather than a retheme.
- **Two layouts that did not previously exist**: long-form article and section listing.
  The design had neither, nor any navigation at all.
- **Search added** (Pagefind), **comments added** (utterances), **DNS fixed**, **www
  redirect added**, both webmaster tools wired up.
- **Two new articles' worth of link integrity work**: every crate reference verified
  published, every dead external link replaced with a verified archive snapshot.

**Current implementation state**: live and healthy. All 73 sitemap URLs return 200,
`zola check` reports 0 broken links, CI deploys green in ~50s.

**Working vs blocked**: nothing is blocked. The remaining items are judgement calls for
the owner, listed under Next Steps.

---

## Artifact Index

| Kind | Location |
|---|---|
| Plan / decision log | `MIGRATION_PLAN.md` (repo root) — decisions D1-D5, root-cause records, defect log |
| URL contract | `live-urls.txt` — the 130 URLs the pre-migration site served |
| Original design | `design-reference/index.html` — the standalone page this was ported from |
| Templates | `templates/{base,index,page,section,taxonomy_*,404,components}.html` |
| Styling | `static/css/warp.css` (~1,400 lines, one file) |
| Search | `static/js/search.js`, indexed by `pagefind@1.5.2` in CI |
| Homepage JS | `static/js/warp.js` (star-field canvas, homepage only) |
| Redirects | `static/_redirects` |
| CI | `.github/workflows/deploy.yml` (Zola 0.23.4 → Pagefind → Cloudflare Pages) |
| Contributor notes | `README.md` — front-matter keys, conventions, layout |
| Salvaged prior work | branch `salvage/warp-drive-wip` on `reference-architecture-ai/reference-architecture.ai-old` |

No `research/`, `design/`, `specs/`, `verification/` or `validation/` directories exist in
this repository. This was not run as a V-model change; verification was continuous and
in-browser, and the evidence lives in commit messages and `MIGRATION_PLAN.md`.

---

## Current State

### Known-good (verified on production, not locally)

- All **73 sitemap URLs** return 200
- **`zola check`: 0 broken links** (was 13 for most of this work)
- All 6 `_redirects` rules return 301 with path and query preserved
- **www → apex** 301, query string preserved
- **Search** works: modal hidden on load, opens, focus lands, results highlight
- **Comments** render on articles (utterances installation `160015620`, scoped to this
  repo alone)
- **Google Search Console**: domain property verified by TXT, sitemap Success, 72 pages
- **Bing Webmaster Tools**: imported from GSC, sitemap Success, 72 URLs
- Every `docs.rs` link in both articles resolves; every crate cited is published on
  crates.io (checked via API — docs.rs returns 200 for crates that do not exist)
- All 8 `web.archive.org` replacements return 200 **and contain the anchors** the
  articles link to

### Partially working / accepted trade-offs

- **Legacy PNG diagrams** in `/docs/nlp/` and `/docs/bert-qa-benchmarking/` were drawn on
  white and sit brightly against the dark page. Legible; not of the design.
- **Taxonomies** survive with pagination removed. Whether tags and categories earn their
  place at all is unresolved.
- **US spelling** in the archived posts: flagged, deliberately not corrected.
- `/json/` and `/json-ad/` are flagged by `zola check` as orphans. Intentional — they are
  machine-readable surfaces, not navigation.

### Risky or unresolved

- **No SPF/DMARC records.** The domain sends no mail but can be spoofed in From headers.
  Flagged to the owner; outside this change's scope.
- **A `queued` workflow run** (id `34203177977`) is stuck on the archived old repo. I
  dispatched it to test whether archiving blocks execution; it was accepted and never
  ran. It cannot be cancelled now the repo is read-only. Harmless; will age out.
- **`terraphim_symphony`** is listed on terraphim.rs but is **not published on
  crates.io**, so it is deliberately unlinked. **The `terraphim_automata/wasm` directory
  that terraphim.rs links to is a GitHub 404.** Both are upstream defects on terraphim.rs,
  not here.

---

## Resume Procedure

```bash
cd ~/projects/terraphim/reference-architecture.ai
git status --short && git log -3 --oneline        # expect clean, main, 6d3578e

zola --version                                     # MUST be 0.23.x; 0.17 configs will not load
pagefind --version                                 # 1.5.2 in CI

zola build && zola check                           # expect 0 broken links, 2 orphan warnings
pagefind --site public                             # expect "Indexed 15 pages"

# Search only works against the built output, because Pagefind indexes public/.
# `zola serve` alone will NOT have /pagefind/ — serve the built directory instead:
cd public && python3 -m http.server 8912 --bind 127.0.0.1
# then open http://127.0.0.1:8912/ and press "/" to test search
```

**Live smoke test:**

```bash
B=https://reference-architecture.ai
for u in $(rg -o '<loc>[^<]*' public/sitemap.xml | sed "s|<loc>$B||"); do
  c=$(curl -s -o /dev/null -w '%{http_code}' "$B$u"); [ "$c" = 200 ] || echo "$c $u"
done   # expect no output
curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}\n' https://www.reference-architecture.ai/
```

**Credentials**: `~/.my_cloudflare.sh` holds a 1Password reference (`op://TerraphimPlatform/
cloudflare.personal.token/credential`), not a literal. It needs
`--account zesticailtd.1password.com`. That token has **Pages permissions but not
`Zone:DNS:Edit`** — DNS changes must go through the dashboard.

---

## Next Steps

1. **Immediate — decide on the legacy PNG diagrams.** White-background screenshots in
   `/docs/nlp/` and `/docs/bert-qa-benchmarking/`. Redrawing means altering an archived
   record; a CSS treatment (subtle inversion or a light card) may be the honest middle.
2. **Follow-up — SPF and DMARC records** for `reference-architecture.ai`. The domain
   sends no mail, so a strict `v=spf1 -all` plus a `p=reject` DMARC record is low-risk
   anti-spoofing.
3. **Deferred — decide whether taxonomies stay.** 96 of the original 130 URLs were tag
   and category pages. Pagination is gone, halving them, but they are excluded from
   search precisely because they were noise. If they are noise for search, they may be
   noise full stop.

---

## Open Questions and Risks

- `content/docs/donate.md` was rewritten this session, but the wider question — whether
  the site should solicit support at all, and in whose name — was not asked.
- Two upstream defects on terraphim.rs (unpublished `terraphim_symphony`, 404 wasm
  directory) are worth reporting to that project.
- ~~The site claims "12 Core patterns" with nothing behind it.~~ **Resolved
  2026-09-08.** Two corrections to that note: the chip was not actually on the live site
  (I had dropped it when trimming the ribbon from five items to three to make room for
  navigation), and the twelve patterns did exist in the content, just unindexed.
  `/docs/patterns/` now names all twelve, each linking to where it is argued, and the
  ribbon chip is restored as a link to it.

---

## Notes for the Next Session

**Things that cost real time here and should not be rediscovered:**

- **Zola 0.23 removed shortcodes entirely.** `{% mermaid() %}` → `{% <mermaid> %}`
  components; `macros::foo()` call syntax and the `concat`/`filter` filters are gone.
  DeepThought does not survive the upgrade and was not worth fixing.
- **Markdown runs over the *rendered* component output.** A blank line inside a mermaid
  body becomes a `<p>` inside the `<pre>` and breaks the diagram. The template cannot
  defend against it — keep mermaid bodies free of blank lines.
- **`get_url()` and `permalink` emit absolute URLs from `config.base_url`.** On any host
  that is not the canonical domain — preview deploys included — that breaks every asset
  and link. Assets, navigation and rendered content are passed through
  `replace(from=config.base_url, to="")`; `rel=canonical`, OG, JSON-LD, sitemap and RSS
  deliberately stay absolute.
- **`zola serve` rewrites `base_url` to localhost**, which masks exactly that class of
  bug. Test against the built `public/` directory, not the dev server.
- **docs.rs returns 200 for crates that do not exist.** Verify publication through the
  crates.io API instead.
- **GitHub renders `#L<n>` line anchors client-side**, so `zola check` reports working
  links as broken. `skip_anchor_prefixes` now covers github.com.
- **A class selector beats the UA's `[hidden] { display: none }`.** `.search-modal
  { display: flex }` made the modal render on every page load until
  `.search-modal[hidden] { display: none }` was added.

**The methodological lesson**, which is the one that mattered most: route sweeps that
only assert HTTP 200 prove nothing about whether anything *uses* a file. A 382KB
`search_index.en.js` shipped on every deploy, consumed by nothing, through several
deploys I had called "verified". The same blind spot let an entirely unstyled site go
live — `curl | rg -c 'warp.css'` confirmed the *reference* existed without ever checking
it resolved.
