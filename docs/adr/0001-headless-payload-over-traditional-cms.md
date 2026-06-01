# Headless Payload CMS + Next.js, not a traditional institutional CMS

The CCTP's wording (native-module configuration, "déjà utilisé pour sites institutionnels", "ne pas être tributaire du soumissionnaire") leans toward a traditional admin-configurable CMS such as Drupal/Typo3. We instead deliver a **Next.js 16 front-office backed by Payload CMS (MIT), running inside the same Next.js app**.

Rationale: Payload provides the CCTP's hardest back-office clauses **natively and for free** — document locking (= the required *verrou exclusif*), versions/history (= *historisation*), official Form Builder and Nested Docs plugins — whereas the equivalents in Strapi sit behind a paid Enterprise tier, which would itself create the financial dependency the CCTP warns against. Single-deploy topology (one app + one Postgres) also simplifies Lot 2 hosting.

## Considered Options

- **Payload (chosen)** — MIT, native locking/versioning, single deploy. Weaknesses: roles are code-defined (not admin-UI), thinner French institutional track record.
- **Strapi community** — larger FR public-sector footprint, admin-UI roles; but locking/history/granular-RBAC are Enterprise-only.
- **Strapi Enterprise** — buys those features but adds recurring per-seat licensing = financial dependency.
- **Drupal/Typo3** — best literal fit for "native modules / admin-configurable" and conformity optics; rejected to keep a modern Next.js/React front-office.

## Consequences

- A bespoke React front means **structural/template/visual** changes require our developers. We mitigate by drawing an explicit **autonomy boundary** (content/tree/forms self-serve; structure via Lot 2 maintenance évolutive) and documenting it in the offer.
- **Conformity risk** on "déjà utilisé pour sites institutionnels" — the offer must evidence Payload institutional references.
- CLAUDE.md §5 (markdown-as-source-of-truth) is superseded: **Payload is the content source of truth.**
