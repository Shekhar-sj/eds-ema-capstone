# Dynamic listings & query-index

The home page ("Recent Articles" / "Next Adventures"), Magazine, and Adventures
listings are index-driven: the `cards-article` and `cards-filter` blocks read
`/query-index.json` at render time and build cards from it — no code change when
content is added.

## How ordering works

`cards-article` shows newest-first:
- If the index has a **`lastModified`** column, it sorts by it (newest first).
  A page you edit + republish rises to the top automatically.
- If not (a hand-authored sheet), it falls back to **index row order**, treating
  the LAST row as newest. To reorder you'd move the row, not edit the page.

To get the "edit a page → it moves to the top" behavior, the index must carry
`lastModified`. A **manually-authored DA sheet never gets it** (it only holds
the columns you type, and republishing a page doesn't touch the sheet). The
automatic way is a **pipeline-generated index configured at tools.aem.live**.

## Set up the automatic index (recommended)

1. Open <https://tools.aem.live> and select `shekhar-sj/eds-ema-capstone`.
2. In the **Index Admin** editor (tools.aem.live → Index Admin), set
   Include `/us/en/**` and add only these five properties — each needs a
   SELECT/SELECT-FIRST value or the save returns 400:
   - `title` → `meta[property="og:title"]` → `attribute(el, "content")`
   - `description` → `meta[name="description"]` → `attribute(el, "content")`
   - `image` → `meta[property="og:image"]` → `attribute(el, "content")`
   - `template` → `meta[name="template"]` → `attribute(el, "content")`
   - `category` → `meta[name="category"]` → `attribute(el, "content")`
   **Do NOT add a `lastModified` property** — the indexer adds it automatically
   as a built-in column (Unix timestamp from publish time). Adding it with an
   empty selector is what triggers the 400 Bad Request.
3. Ensure detail pages expose the fields as meta tags (they already do):
   `og:title`, `description`, `og:image`, `template`, and `category`
   (adventures). Republish any page missing them.
4. Publish/preview to trigger the first index build. From then on, publishing a
   page updates its row (and `lastModified`) automatically.

Once the pipeline index is live, delete the hand-authored `query-index` sheet in
DA so the two don't compete — the pipeline `/query-index.json` takes over, and
the listing blocks keep working unchanged (they already sort by `lastModified`).

## Fields per row

| field | source |
|-------|--------|
| path | page path |
| title | `og:title` |
| description | `meta[name=description]` |
| image | `og:image` (card thumbnail) |
| template | `meta[name=template]` — `article-detail` / `adventure-detail` drives which listing shows the card |
| category | `meta[name=category]` — adventures filter tabs |
| lastModified | page publish time (pipeline-populated) — sort key |
