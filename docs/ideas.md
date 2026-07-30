# Ideas

> Feature ideas, improvements, tech debt, and things worth revisiting.

**This project is an archived artifact** (see the status banner in `CLAUDE.md`). Nothing
below is scheduled. The items are kept because they describe the renderer being ported into
the wiki graph view, and a couple of them become that view's problems instead.

## 2026-07-30 — absorbed by the wiki

Decision: the radial renderer is ported into the wiki frontend; this repo is archived. Design
doc: `~/Projects/central-hub/docs/plans/2026-07-30-wiki-graph-view-design.md`.

Deferred out of that design, and worth revisiting there rather than here:

- **Cross-link (dashed) edges need link adjacency the wiki does not store.** Backlinks are a
  `LIKE '%[[slug]]%'` scan over `pages.content` with a trigram GIN index — there is no links
  table. Phase 2 picks between a client-side parse over a bounded scope and a new
  `GET /api/wiki/graph` endpoint in `~/Projects/wiki`.
- **Whole-wiki graph.** Rejected as a default because `logs/` forms one huge meaningless
  spoke, but a filtered "everything except `logs/`" view might be worth trying once scoped
  maps exist.
- **Node colour has no source of truth in the wiki.** Vaults had a `color` field; namespaces
  do not. The design keys colour off namespace depth. A per-namespace colour convention
  (wiki-side) would be better if the graph becomes a primary navigation surface.
- **Graph as an editing surface.** Explicitly out of scope — editing stays in `WikiEditor`.
  Revisit only if the map becomes where knowledge actually gets organised.

## Not carried over

These were real gaps in this app, and are resolved by the wiki rather than fixed here:

- **`resource` and `note` node types declared but unimplemented** — they exist in
  `src/data/schema.ts` and `CLAUDE.md` with no dedicated components, falling through to leaf
  rendering. The wiki's `type` field supersedes this.
- **Build-time content parsing** — adding a node required a rebuild and redeploy, with no
  runtime persistence or in-app editing. The wiki API and `WikiEditor` supersede this.
- **Cross-vault connections unsupported** — nodes were scoped to their vault. Wiki namespaces
  plus `[[slug]]` links supersede this.
- **Single demo vault** — `programming`, 11 nodes of generic JS/TS/React material. Scaffolding;
  not migrating.
