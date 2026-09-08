# Migration Plan: reference-architecture.ai

**Date:** 2026-09-07
**New design:** `/Users/alex/projects/terraphim/reference-architecture.ai/index.html` (single file, 1,534 lines, not a git repository)
**Old site:** `https://github.com/reference-architecture-ai/reference-architecture.ai` (Zola, DeepThought theme, HEAD `3862ee2`)

**Decisions taken 2026-09-07 (all five settled; no open questions block this plan):**

| # | Decision | Choice |
|---|---|---|
| D1 | Repository | **Fresh repo in the `reference-architecture-ai` GitHub org.** Salvage the uncommitted port from the stale checkout first (see §2b) |
| D2 | Generator | **Zola, upgraded to 0.23.x** from the pinned 0.17.2. DeepThought dropped entirely |
| D3 | Legacy 2020-22 content | **Keep, archived at the same URLs.** Dated banner, visually separated in listings |
| D4 | Comments | **Utterances only.** Disqus removed |
| D5 | Hero CTA | **Drop "Read on Medium" entirely.** All reading paths stay on-site |

---

## 0. Live state, verified 2026-09-07

Checked before planning, because two of these change the SEO framing:

- **`reference-architecture.ai` has no DNS record.** Neither apex nor `www` resolves. The site is reachable only at `https://reference-architecture-ai.pages.dev`. Meanwhile `robots.txt` advertises `Sitemap: https://reference-architecture.ai/sitemap.xml` and every `<loc>` and canonical points at the same dead domain. **Nothing on this site is currently indexable at its own name.** Attaching the custom domain in Cloudflare Pages is a prerequisite for any SEO work, and it reframes D3: there is far less accumulated link equity to protect than assumed — which makes keeping the legacy URLs cheap, not expensive.
- **Production is still the old DeepThought theme** (`lang="en"`, light Bulma). The new design has never shipped.
- **The URL contract is 130 URLs.** Captured to `live-urls.txt` alongside this plan. Of those, **96 are taxonomy pages** — and every category and tag exists twice, as `/tags/rust/` and `/tags/rust/page/1/`, which are byte-identical. That is ~48 duplicate URLs of thin content, an active liability for a site optimising for SEO. Decide during the rebuild whether taxonomies earn their place at all; if they stay, the `/page/1/` duplicates need `rel=canonical` back to the base term or suppressing.
- The two 2026 posts and all `/docs/` pages are live and return 200, so the deployed build is current.

---

## 1. What each side actually is

| | Old | New |
|---|---|---|
| Form | Zola static site generator, DeepThought theme (Bulma/Sass) | One hand-written `index.html` with inline CSS + JS |
| Content | 15 real pages (3 posts, 8 docs, sections) | Zero content pages; a landing page only |
| Design | Generic light Bulma blog theme | "Warp Drive" dark theme, oklch palette, canvas star-field, FontAwesome, Space Grotesk/Onest/JetBrains Mono |
| Machinery | RSS, client-side search index, taxonomies, mermaid/katex/chart shortcodes, 404, robots, favicons, GA4, Disqus | None of it |
| Deploy | GitHub Actions -> `zola build` -> Cloudflare Pages project `reference-architecture-ai` | `deploy.sh` -> `wrangler pages deploy .` -> **same** Cloudflare Pages project |

The new page's Resources section links only offsite (medium.com, terraphim.ai, terraphim.rs, terraphim.pro, docs.terraphim.ai, github.com/terraphim). **There is currently no path from the new design to any of the site's own writing.** That is the gap this migration closes.

## 2. Two things to do before anything else

### 2a. Deploy collision

`deploy.sh` and the old repo's GitHub Actions workflow both publish to Cloudflare Pages project `reference-architecture-ai`. Last write wins. Running `deploy.sh` today would replace the whole Zola site with a single page and also ship `deploy.sh` itself into the public bundle.

**Resolution (D1):** `deploy.sh` is retired, and the old repo's `cloudflare-pages.yml` must be *actively stopped* — moving to a fresh repo does not disarm it. It still fires on every push to the old `main` and direct-uploads production to the same Pages project. Concretely, at cutover: **delete `.github/workflows/cloudflare-pages.yml` in the old repo, then archive the repo** (archiving disables Actions). Do the delete first — archiving alone, if later un-archived, re-arms it.

Note this is direct-upload, not Cloudflare's Git integration, so there is no "production branch" to repoint: whichever workflow uploads last owns production. The fresh repo's workflow simply becomes the only one still running.

### 2b. Unbacked-up work at risk

There is a second, stale checkout at `~/projects/reference-architecture.ai` — HEAD `488b085`, *behind* GitHub's `3862ee2` — carrying **uncommitted, unpushed changes**:

| File | Change |
|---|---|
| `templates/index.html` | +697 lines — an **earlier Warp Drive port already inlined into Zola**, self-contained (own head, `<style>`, `<script>`), with GA4 wired in |
| `content/_index.md` | Body stripped to front matter, description rewritten to the new positioning |
| `config.toml` | `highlight_code`, `extra_syntaxes`, `highlight_theme` **deleted** — a regression, code highlighting silently off |
| `.github/workflows/*.yml` | Two edits |

This existed only in one working tree with no remote copy. **Resolved 2026-09-07:** preserved as commit `245a653` on branch `salvage/warp-drive-wip`, pushed to the existing GitHub repo.

While pushing, GitHub secret scanning rejected the branch over `config.toml:204`. The finding is a **Mapbox `pk.` token belonging to the DeepThought theme author (`ratanshreshtha`)** — not ours, already public on `main` and upstream in the theme, with `enabled = false` and the shortcode unused. It was removed to allow the push. Two consequences worth knowing: **any future push touching `config.toml` on the old repo will be blocked the same way** until that block goes, and it should simply not be carried into the fresh repo (it dies with DeepThought anyway). Nothing to rotate — it is not a Zestic or Terraphim credential.

What to salvage from it: the GA4 wiring, the `_index.md` front-matter rewrite, and any CSS deltas. What *not* to carry: the `config.toml` highlighting deletions, and the section layout — the standalone `index.html` in this directory is the newer and fuller iteration (it has the 9-step flywheel section that the earlier port lacks).

## 3. Target architecture (D2)

**Zola 0.23.x, DeepThought dropped, templates built from the new design.** The new `index.html` splits mechanically:

| New `index.html` region | Zola destination |
|---|---|
| `<head>`, `:root` tokens + all CSS (lines 11-819) | `sass/warp.scss` (or a single `static/css/warp.css`) + `templates/base.html` head block |
| Ribbon nav (line 829) + footer (line 1372) | `templates/base.html` |
| Hero, hyperdrive, architecture, harness, failures, comparison, flywheel, resources (lines 863-1370) | `templates/index.html` (homepage only) |
| Canvas warp-tunnel JS + scroll observers (line ~1390 to end) | `static/js/warp.js`, deferred |

Rationale, stated plainly: the 15 content pages use mermaid, katex, code highlighting and co-located image bundles; RSS, tag feeds, search index, taxonomies, 404, robots and sitemap all work out of the box; content conversion cost is zero because the tree is already Zola.

Zola was checked for viability, not assumed: **v0.23.4 released 2026-08-20, commits within the last week, 17.4k stars, not archived.** The site's pin at 0.17.2 is six minor versions stale — the upgrade is part of this migration, not deferred.

Considered and rejected:
- **Astro 7.3** — genuinely better SEO tooling (automatic responsive/AVIF images, build-time OG generation, content collections). Rejected because this site's visuals are five hand-written SVG diagrams, so the image pipeline wins little, and the cost is a Node toolchain, front-matter conversion for 15 pages, and reimplementing the mermaid/katex/chart shortcodes as components.
- **md-book 0.2.0** (in-house) — inspected the source: canonical URLs and Pagefind search, but **no sitemap, no RSS, no taxonomies, no OG tags**, and a `SUMMARY.md` book model. Wrong shape for a landing page plus an SEO-led blog.

**What the new design does not yet have, and this is the bulk of the work:** no long-form article layout, no post/doc listing layout, and no nav entries for Posts or Docs. Those must be designed in the Warp Drive language before any content can land.

**D5 — hero CTA:** the "Read on Medium" button is removed. Replace it rather than leaving a lone button — something like "Read the Articles" -> `/posts/`. The point of D5 is that the reading path stays on-site, not that the hero loses one. Every reading path stays on-site; the canonical version of each post lives at `reference-architecture.ai`. If a piece is also syndicated to Medium, that copy carries `rel="canonical"` pointing home. The Medium card in Resources may stay as a publication link, but it is no longer a hero-level exit.

## 4. Content inventory and disposition

Two distinct eras. The 2020-2022 material is The Pattern / Redis / RedisGears work. The 2026-09 material is the harness-engineering thesis that the new landing page copy is written against.

| Path | Words | Date | Era | Disposition | Target URL |
|---|---|---|---|---|---|
| `content/posts/mcp-native-agent-architecture/index.md` | 2,824 | 2026-09-07 | Current | **Migrate, feature** | `/posts/mcp-native-agent-architecture/` |
| `content/posts/harness-engineering-agents/index.md` | 2,286 | 2026-09-06 | Current | **Migrate, feature** (hero CTA target) | `/posts/harness-engineering-agents/` |
| `content/_index.md` | 369 | - | Legacy | Superseded by new hero. **File itself must stay** (Zola requires it with front matter to render the homepage) — relocate only the body to `/docs/legacy-capability-map/`, leaving front matter behind. On the move, rewrite its relative links (`./docs/intake/`, `./docs/nlp/#...`, `./docs/ai-product/`) to absolute `/docs/...`, in both markdown links **and** the mermaid `click` directives, or they resolve under the new path | `/docs/legacy-capability-map/` |
| `content/docs/bert-qa-benchmarking/index.md` | 2,198 | 2022-06-16 | Legacy | Migrate as archive | unchanged |
| `content/docs/nlp/index.md` | 1,636 | 2022-05-28 | Legacy | Migrate as archive | unchanged |
| `content/posts/github_oauth2/index.md` | 1,402 | 2022-08-19 | Legacy | Migrate as archive | unchanged |
| `content/docs/ai_product/index.md` | 411 | 2020-08-31 | Legacy | Migrate as archive | unchanged |
| `content/posts/post-0.md` | 239 | 2022-06-16 | Legacy | Migrate as archive (site announcement) | unchanged |
| `content/docs/donate.md` | 126 | 2020-08-31 | Legacy | Review — still accurate? | unchanged |
| `content/docs/intake.md` | 122 | 2020-08-31 | Legacy | Migrate as archive | unchanged |
| `content/docs/contribution.md` | 121 | 2021-12-15 | Legacy | Migrate, update for new repo layout | unchanged |
| `content/docs/metadata.md` | 56 | 2022-05-14 | Legacy | Migrate as archive | unchanged |
| `content/docs/extended-shortcodes/index.md` | 1,837 | 2020-08-29 | Theme demo | **Drop** (plus its 7 unsplash JPGs) | 410 |
| `content/static/json.md`, `json-ad.md` | 8 each | - | Machinery | Keep, verify templates still resolve | unchanged |
| `content/posts/_index.md`, `content/docs/_index.md` | 19/17 | - | Section index | Rewrite for the new listing layout | unchanged |

**D3 — legacy content stays, archived at the same URLs.** No redirects, no lost link equity. "Archive" means: URL and content unchanged, a dated banner ("Published 2022, retained for reference — the Redis/RedisGears era of this project"), and a distinct visual treatment in the listing so it never reads as current advice. Needs an `archived = true` front-matter flag (or a taxonomy term) that `page.html` and `section.html` both key off.

### Assets that must travel

- `static/diagrams/*.svg` (5 referenced by the MCP post: `approval-flow`, `deterministic-replay`, `four-layer-architecture`, `terraphim-multi-agent`, `traditional-vs-mcp`). Verified in the browser after the port: **they render correctly on the dark ground with no work needed.** Each carries an internal `<style>` deriving `--_node-fill`, `--_line`, `--_text` from `--bg`/`--fg`/`--surface`, with Tokyo Night fallbacks. Correcting an earlier assumption in this plan: those host variables **never reach the diagrams**, because the posts embed them as `![](…)` -> `<img>`, and CSS custom properties do not cross an `<img>` boundary. Every diagram therefore paints itself in its Tokyo Night fallbacks — which happen to sit well against `--void`. `--bg`/`--fg` are defined in `warp.css` regardless, so that inlining a diagram later works as intended.
- `static/diagrams/sideeffect-class.svg` is present but referenced by nothing. Confirm whether it belongs in the MCP post or should be dropped.
- Co-located post bundles: `bert-qa-benchmarking/` (5 PNGs + a stray `.pptx` and a `Screenshot from 2022-04-15…png` — clean these out), `nlp/` (5 PNGs), `github_oauth2/` (1 PNG).
- `static/images/ai_product.drawio.svg` (+ `.drawio` source), `avatar.jpg`, unsplash hero JPG.
- `static/icons/*` — favicons and webmanifest. The new `index.html` has **no favicon links at all**.

## 5. Head and machinery gaps in the new design

Verified absent from `index.html` and present in the old `templates/base.html`. All must be restored in the ported `base.html`:

- Favicon set: 16x16, 32x32, apple-touch-icon, safari-pinned-tab, `site.webmanifest`
- GA4 `G-NK475MFMER`
- RSS `<link rel="alternate" type="application/rss+xml">` (Zola generates `rss.xml`)
- Canonical URL
- Search modal + `search_index.en.js` (Zola's `build_search_index = true` already produces it)
- 404 page in the new visual language

Additionally missing from *both* and worth adding while the head is being rebuilt: Open Graph and Twitter card tags, and a JSON-LD `Article`/`Organization` block. The old theme had neither, so social previews are currently blank.

`config.toml` changes to make in the same pass:

- `render_emoji = true` -> `false` (house rule: no emoji anywhere).
- **D4 — comments: utterances only.** Delete the `[extra.commenting]` Disqus block. Point `[extra.utterances]` at the new repo (`repo` currently reads the placeholder `"repo-config"`) and set `theme` to a dark variant so it sits correctly on `--void`. Removing Disqus is also a Core Web Vitals win.
- **Restore `highlight_code = true` and `highlight_theme`** — the stale checkout deleted them (§2b). Pick a dark theme that sits with the Warp Drive palette; `one-dark` was the original and still works, but check it against `--void-deep`.
- Pre-existing typo: the `tags` taxonomy reads `fees = true` where it should be `feed = true`, so tag feeds have never been generated.
- Zola 0.23 config migration: diff `config.toml` against the current schema, since 0.17 -> 0.23 spans six releases (`generate_feeds`/`feed_filenames` semantics in particular).

## 6. Sequence — status

| # | Step | Status |
|---|---|---|
| 0 | Rescue the unbacked-up work | **Done.** `salvage/warp-drive-wip`, commit `245a653`, on the old GitHub repo |
| 1 | Fresh repo, seeded from `3862ee2` | **Done.** `github.com/reference-architecture-ai/website` |
| 2 | Zola 0.23.4 upgrade, config schema migration | **Done.** Verified on CI: `zola 0.23.4`, 14 pages, 158ms |
| 3 | Baseline the URL contract | **Done.** 130 live URLs in `live-urls.txt` |
| 4 | Port the chrome (base/index/CSS/JS, full SEO head) | **Done** |
| 5 | Article and listing layouts, nav, 404 | **Done** |
| 6 | Content dispositions | **Done** |
| 7 | URL continuity and `_redirects` | **Done.** 130 -> 72; every loss is a `/page/N/` duplicate plus `extended-shortcodes` |
| 8 | Content pass (diagrams, mermaid, KaTeX, images) | **Done.** Verified in Chrome |
| 9 | SEO pass | **Partly done.** Markup shipped; submission needs live DNS |
| 10 | Verify live | **Done.** Deployed and verified at `reference-architecture-ai.pages.dev` |

### What actually shipped

Six commits on `main`. Highlights beyond the plan as written:

- **Zola 0.23 removed shortcodes entirely** and moved Tera to v2. This turned a retheme
  into a rebuild: `macros::` call syntax, the `concat` and `filter` filters, and the
  whole shortcode mechanism are all gone. mermaid and youtube became components;
  `json.html`/`json-ad.html` were rewritten flat; DeepThought does not survive the
  upgrade at all and was dropped rather than fixed.
- **The design had no navigation.** The ribbon is a desktop-only status bar, so mobile
  had no way to reach anything. Added ribbon links plus a sticky mobile topbar.
- **The design had no share image.** Rendered `static/images/og-default.png` (1200x630)
  from an HTML card in the Warp Drive palette.
- **`publish.yml` removed.** It cross-posted every new post to dev.to and Medium via
  blogpub, needs secrets that do not exist here, and contradicts D5.
- **The two workflows became one** (`deploy.yml`), off the deprecated
  `cloudflare/pages-action@v1` and onto `wrangler-action@v3`.
- **The Mapbox token had to be stripped from history.** The seed commit carried
  `config.toml` verbatim from `3862ee2`, including the DeepThought author's public
  Mapbox key, and GitHub push protection rejected the push. `git filter-repo` replaced
  the value across all six commits. The seed commit is therefore verbatim *except* for
  that one string.
- **Repo named `website`, not `reference-architecture.ai`.** The canonical name is held
  by the old repository and renaming it was not available in this session.

## 7. Risks

| Risk | Mitigation |
|---|---|
| Both deploy paths target the same Pages project; a stray `deploy.sh` run wipes the site | Delete `deploy.sh` in step 1, before anything else |
| The 5 SVG diagrams fall back to Tokyo Night colours beside the Warp Drive palette (`--bg`/`--fg` undefined, `--surface` means something different) | Define/reconcile the three host tokens in step 3; verify visually in step 7. Low effort, but invisible until someone looks |
| Legacy Redis-era content dilutes the harness-engineering positioning | D3: archive banners + visual separation. Accepted trade-off — link equity kept, positioning managed by presentation |
| Inline 800-line CSS becomes unmaintainable across five templates | Extract to one stylesheet in step 3, not later |
| Zola 0.17 -> 0.23 spans six releases; config schema and shortcode behaviour may have shifted | Step 2 upgrades and verifies a clean build on **untouched** content, before any redesign work, so breakage is unambiguous |
| The §2b working tree is the only copy of ~700 lines of work | Step 0 exists solely to remove this risk. Do it first |
| A fresh repo loses the old repo's history, issues and the six existing branches | Old repo is archived, not deleted, and linked from the new README as the historical record |
| The custom domain never resolves, so the relaunch is invisible to search regardless of how good the SEO work is | Attach `reference-architecture.ai` to the Pages project and verify DNS **before** step 9; treat it as a gate on the SEO pass, not a follow-up |
| 48 duplicate `/page/1/` taxonomy URLs of thin content work against the SEO goal | Decide taxonomies' fate during step 5; canonical the `/page/1/` variants to their base term if they stay |
| Utterances silently fails to load on articles | Install the utterances GitHub App on the new repo and set `[extra.utterances] repo` (currently the placeholder `"repo-config"`) before step 10 |

---

## 7b. Post-launch defects found and fixed

The first look at the deployed site showed it completely unstyled. Root cause, and two
follow-ons found by crawling production rather than eyeballing it:

| Defect | Cause | Fix |
|---|---|---|
| No CSS, no JS, no icons, every nav link dead on `pages.dev` | Zola's `get_url()` and `permalink` build absolute URLs from `config.base_url` = `https://reference-architecture.ai`, which has no DNS. The browser resolved every asset against a host that does not answer | Assets, navigation and feed links are now root-relative |
| Cross-references between articles also dead | Markdown internal links (`@/` form and resolved bare paths) render absolute too | `page.content` / `section.content` pass through the same `base_url` strip |
| `/docs/metadata/./docs/intake` and a doubled-parenthesis gist link 404ing | Malformed markdown, broken since it was written in 2020-22 | Rewritten as `@/` links, so a future rename breaks the build instead of shipping a 404 |

Deliberately still absolute, because they name the canonical host for crawlers rather
than the browsing one: `rel=canonical`, `og:url`, `og:image`, `twitter:image`, JSON-LD,
`sitemap.xml`, `rss.xml`, and the `/json/` and `/json-ad/` exports.

This also means **per-branch preview deployments work**, which they never would have
under absolute URLs.

**Verified on production:** all 72 sitemap URLs return 200; all 93 unique internal
references resolve; no anchor, image, script or stylesheet points at the canonical host;
no console errors.

Known cosmetic issue, not fixed: the legacy PNG diagrams in `/docs/nlp/` and
`/docs/bert-qa-benchmarking/` were drawn on white and sit brightly against the dark
page. They are archived screenshots and remain legible; recolouring them would mean
altering the record.

## 7c. Search

The site had none. Worse, it was shipping a **382KB `search_index.en.js` on every
deploy that nothing loaded** — DeepThought's search modal went when the templates were
replaced, but Zola's elasticlunr index stayed switched on and `static/js/site.js` still
held the orphaned client for it. Every route check returned 200 because the file *was*
there; nothing verified that anything used it.

Now **Pagefind 1.5.2**, the same tool `terraphim/md-book` uses. It indexes the built HTML
after `zola build`, so no index lives in the source tree, and it fetches nothing until
the modal is opened — shards load on demand rather than one blob on every page view.

- `static/js/search.js` — modal controller, ported from md-book's `pagefind-search.js`
  and trimmed. Kept its generation counter: `debouncedSearch` resolves out of order
  under fast typing, so without it a slow early query overwrites a later one's results.
  `/` or Cmd/Ctrl+K opens, Esc closes, arrows walk the results.
- Indexing boundaries: `data-pagefind-body` on `<main>`, `data-pagefind-ignore` on the
  footer, and a `pagefind` template block that excludes taxonomy listings and 404.
  Indexing those put thin "Tags. harnesses. 1 article." entries above the articles
  themselves — 71 indexed pages became 15 real ones, and "harness" went from 12
  mostly-noise hits to 6 content pages.
- `build_search_index = false`, the inert `[search]` table removed, and
  `static/js/{site,flamethrower}.js` deleted.

Three bugs, all found by opening the page rather than trusting the build:

| Bug | Cause |
|---|---|
| Modal visible on every page load | `.search-modal { display: flex }` outranks the UA's `[hidden] { display: none }` |
| Caret not in the field after opening | Focus set in the same tick the element stopped being `[hidden]`, before layout. A single `requestAnimationFrame` was not enough either; `focusInput()` now retries across three timing paths |
| Tag pages crowding out articles | Everything under `<main>` was indexed, including navigation pages |

Verified live: hidden on load, opens on click, focus lands in the field, and typing
returns highlighted results from the real articles.

## 8. Open items

**The site is live at https://reference-architecture.ai** as of 2026-09-08. Sections 1
and 2b below are closed; what remains needs your accounts.

### 1. DNS — **done 2026-09-08**

The zone had zero records. A proxied CNAME `reference-architecture.ai` ->
`reference-architecture-ai.pages.dev` was added through the Cloudflare dashboard, the
Pages custom domain moved from `pending` to `active`, and the certificate issued. The
domain now resolves, serves over HTTPS with a valid certificate, and every route
returns 200.

For the record, the original §0 diagnosis was wrong in an instructive way: the domain
was never unattached. It had been attached since 2024-12-21 and the zone was active.
Its SSL certificate pack had expired and been removed, which showed as `status: error`;
a `PATCH` cleared that to `pending`, and validation then simply waited on a DNS record
that had never existed.

### 2. Retire the old repository — **done 2026-09-08**

Renamed to `reference-architecture-ai/reference-architecture.ai-old` and archived, so it
is read-only and its deploy workflow cannot be triggered by a push. The
`salvage/warp-drive-wip` branch is preserved there.

One untidy artefact: a `Cloudflare Pages Deployment` run (id `34203177977`) sits stuck in
`queued` on that repository. I dispatched it to test whether archiving blocks execution.
It was accepted and never ran — which is the answer — but it was a careless way to
establish it, and it cannot be cancelled now the repo is read-only. Production was
checked immediately and throughout and never changed. The run will age out.

### 2b. Rename the new repository — **done 2026-09-08**

Now `reference-architecture-ai/reference-architecture.ai`. The utterances `repo`, the
nav and footer GitHub links, the README history section and the git remote all follow it.

### 3. Post-launch setup — mostly done 2026-09-08

| Item | Status |
|---|---|
| `www` subdomain | **Done.** Proxied CNAME `www` -> `reference-architecture.ai`, plus a redirect rule 301ing `https://www.*` to the apex with the query string preserved. Verified: `/`, `/posts/` and a UTM-tagged URL all 301 correctly |
| Google Search Console | **Done.** Domain property `reference-architecture.ai` verified by TXT record (`google-site-verification=...`), which also covers `www` and every subdomain. `sitemap.xml` submitted: status **Success, 72 pages discovered** — matching the build exactly |
| Bing Webmaster Tools | **Needs you.** Not signed in, and I cannot sign in or create accounts on your behalf. Once signed in at <https://www.bing.com/webmasters>, the fastest route is *Import from Google Search Console*, which carries the verified property and the sitemap across in one step |
| Utterances GitHub App | **Done 2026-09-08.** Installed on the organisation, scoped to `reference-architecture.ai` alone rather than the org-wide default, with read metadata plus read/write issues. Installation id `160015620`, `repository_selection: selected`. Verified on a live article: the widget renders "0 Comments - powered by utteranc.es" with the Write/Preview tabs and a Sign in with GitHub button, in the dark theme — no "not installed on this repository" error |

Chose the manual TXT route for Search Console rather than Google's "authorise access to your Cloudflare DNS account" flow, so no OAuth link exists between the two accounts. Keep the TXT record: removing it drops the verification.

Cloudflare still flags one thing I have deliberately not acted on: **no MX/SPF/DKIM/DMARC records**, so `@reference-architecture.ai` cannot receive email and the domain can be spoofed in From headers. Adding SPF and DMARC is worthwhile hardening for a domain that sends no mail, but it is outside this migration and affects deliverability, so it is your call.

### Judgement calls left for you

- `docs/donate.md` dates to 2020 and points at the Redis-era project. Kept and archived;
  it may want rewriting or removing.
- `static/diagrams/sideeffect-class.svg` is referenced by nothing. Kept.
- 13 broken external links remain, all in archived 2020-22 posts. Left as published:
  archived content is a record, not maintained. Both current posts are clean.
- The legacy PNG diagrams in `/docs/nlp/` and `/docs/bert-qa-benchmarking/` were drawn on
  white and sit brightly against the dark page. Legible, but not of the design.
- Taxonomies survive with pagination removed. Whether tags and categories earn their
  place at all is still open.
- US spelling in the legacy posts: flagged, not corrected.
