# Ideas

> Feature ideas, improvements, tech debt, and things worth revisiting.

## High Priority

<!-- Ideas that should be addressed soon or in the next phase -->

- **Deployment / hosting is undecided.** Nothing is deployed. Open question is whether this
  ships standalone or gets folded into the mase.fi wiki (notes-app) — see
  `docs/plans/` for the design doc once that decision lands.

## Future

<!-- Ideas for later — no urgency, but worth remembering -->

- **Vault content is a single demo vault.** Only `programming` exists (11 nodes of generic
  JS/TS/React material). Treat it as scaffolding, not content worth preserving.
- **Cross-vault connections are unsupported.** Nodes are scoped to their vault; linking
  across vaults would need layout and loader changes.

## Tech Debt

<!-- Fragile patterns, latent bugs, things that work but could be better -->

- **`resource` and `note` node types are declared but unimplemented.** Both exist in
  `src/data/schema.ts` and are documented in `CLAUDE.md`, but there are no dedicated node
  components for them — they fall through to the generic leaf rendering.
- **Content is parsed at build time.** Adding or editing a node requires a rebuild and
  redeploy; there is no runtime persistence or in-app editing.
