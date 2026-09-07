# reference-architecture.ai

Source for [reference-architecture.ai](https://reference-architecture.ai) — reference
architecture patterns for production AI agent systems.

Built with [Zola](https://www.getzola.org) 0.23.4 and deployed to Cloudflare Pages.

## Local development

```bash
zola serve          # http://127.0.0.1:1111, live reload
zola build          # writes public/
zola check          # internal links and anchors
```

Zola must be 0.23.x. The version is pinned in `.github/workflows/deploy.yml`; keep the
two in step, or CI and local will disagree.

## Layout

```
content/            Markdown. posts/ is the blog, docs/ is reference material.
templates/          Tera templates.
  base.html         Head, SEO, navigation, footer.
  index.html        Homepage: the eight landing sections.
  page.html         Long-form article layout.
  section.html      Post and doc listings.
  components.html   mermaid and youtube (Zola 0.23 removed shortcodes).
static/css/warp.css The whole design. One file, CSS custom properties.
static/js/warp.js   Homepage star-field canvas. Nothing else depends on it.
static/_redirects   URL continuity from the pre-2026 site.
design-reference/   The original standalone design, kept for comparison.
```

## Writing

Front matter that this site understands beyond Zola's own:

| Key | Effect |
| --- | --- |
| `extra.archived = true` | Adds the dated archive banner and moves the entry into the Archive block in listings. |
| `extra.mermaid = true` | Loads Mermaid on that page. Only set it where a diagram exists. |
| `skip_content_templating = true` | Stops Zola templating the body. Needed when code samples contain `{%` or `{{`. |

Diagrams live in `static/diagrams/`. They carry their own dark palette, so they work
against the site background without further styling.

## Conventions

- British English throughout. No emoji — `render_emoji` is off deliberately.
- Articles are canonical here. If a piece is syndicated elsewhere, that copy carries
  `rel="canonical"` pointing back to this site.
- Every URL that ever shipped stays reachable. If one has to move, it gets a line in
  `static/_redirects`.

## History

This repository succeeds
[reference-architecture-ai/reference-architecture.ai](https://github.com/reference-architecture-ai/reference-architecture.ai),
which ran the DeepThought theme on Zola 0.17 from 2020 to 2026. That repository is
retained read-only as the historical record; its content was carried over here in full, with the 2020-22 Redis and
RedisGears material kept at its original URLs and marked as archived.

`MIGRATION_PLAN.md` records what moved, what was dropped, and why.

## Licence

Content CC BY-SA 4.0. Code Apache 2.0.
