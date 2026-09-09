# Dynamic listings & query-index setup

The homepage, magazine, and adventures listings are **dynamic**: instead of
shipping static cards, each listing block reads `/query-index.json` at render
time and builds cards from it.

## How it works

- `scripts/ffetch.js` — `queryIndex()` fetches `/query-index.json` (paginated).
- `blocks/cards-article/cards-article.js` — when its first row is a config
  keyword (`articles` or `adventures`, optional second row = numeric limit), it
  populates from the index filtered by template; otherwise it renders authored
  static cards.
- `blocks/cards-filter/cards-filter.js` — same pattern with keyword `adventures`;
  builds category filter tabs from each row's `category` field.

Config blocks authored into content:

| Page | Block | Config |
|------|-------|--------|
| `/us/en` (homepage) | cards-article ×2 | `articles` / `4`, then `adventures` / `4` |
| `/us/en/magazine` | cards-article | `articles` (all) |
| `/us/en/adventures` | cards-filter | `adventures` (all) |

## query-index.json fields

Each detail page contributes one row:

| Field | Source |
|-------|--------|
| `path` | page path (no extension) |
| `title` | page title |
| `description` | meta description |
| `image` | hero content image (first non-logo raster image in `main`) |
| `template` | `article-detail` / `adventure-detail` / … |
| `category` | adventure "Activity" spec (Surfing/Cycling/Skiing/Rock Climbing/Camping/…) — adventures only |
| `lastModified` | (optional) for newest-first sort |

The local `content/query-index.json` is a generated seed so listings work in
preview before the production index exists. **On aem.live the index is produced
by the pipeline**, not this file — configure it once at **tools.aem.live**:

## Configure the index at tools.aem.live

1. Open the site config at <https://tools.aem.live/> for
   `shekhar-sj/eds-ema-capstone`.
2. Add an **index** named `default` producing `/query-index.json`, including
   pages under `/us/en/**`.
3. Map these properties (each reads a page metadata field or DOM value):
   - `title` ← page title
   - `description` ← `meta[name="description"]`
   - `image` ← `meta[property="og:image"]` (or first content image)
   - `template` ← `meta[name="template"]`
   - `category` ← `meta[name="category"]`
   - `lastModified` ← `<lastModified>`
4. So the pipeline can read `template`/`category`, publish those as page
   metadata. The detail pages should carry **Template** (and **Category** for
   adventures) in their metadata block; add them in the document/DA source or via
   the importer if not already present.
5. Republish the detail pages so the index populates.

Until the production index is live, the blocks fall back gracefully: an empty or
missing `/query-index.json` yields an empty (not broken) listing.
