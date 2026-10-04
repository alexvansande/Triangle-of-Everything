# Brief for adding a dust source (temporary — for build agents)

Repo: /home/user/Triangle-of-Everything (Vite site, log-log chart of mass vs size).
Read first: scripts/build-dust.mjs (checks), scripts/dust/sources.mjs (existing source
objects — copy their shape and helpers: vizier(), csv(), num(), ok(), relErr()), and
docs/dust-report.md (what the current sources look like).

You add ONE new file: scripts/dust/src-<group>.mjs with
  `export default [ { id, label, cat, cite, radius, density: [lo, hi], anchors, load(fetchText) }, ... ]`
- load(fetchText) → [{ name, logR, logM }], CGS: logR = log10(radius / cm), logM = log10(mass / g).
- fetchText(url, cacheFile) returns a Promise<string>, cached in scripts/dust/.cache/ (curl under the hood,
  so the proxy works). For binary files (zip/xlsx) you may write your own small cached download with
  execFileSync("curl", ...) into scripts/dust/.cache/ and unzip with `unzip -p` or python3 — no new npm deps.
- `density` is the plausible log10(g/cm³) envelope for the class: wide enough for real scatter,
  tight enough to catch unit slips (factors of 10³).
- `anchors`: 1–3 well-known members with textbook values + tol (dex). They catch unit/column errors.
- `cat` must be one of: particle composite atomic micro macro planet star remnant blackhole galaxy largescale
  (that sets the dot colour; the build also cross-checks against hand-placed objects in src/objects.json
  that have the SAME cat and name — a disagreement > 0.3 dex fails the build; read objects.json for the
  conventions those objects use and match them).
- `label` is shown in the hover tooltip under the name: "Kind · Source" (≈ ≤ 50 chars).
- Radius conventions used on this chart: organisms and artefacts = HALF the largest dimension
  (a 1.7 m human → 85 cm); spheres = radius; molecules = equivalent-sphere radius.

RULES ON CORRECTNESS (the user cares a lot):
- Only real, individually named objects/species/items from a published or authoritative source.
  No synthetic or interpolated objects.
- Prefer sources where BOTH mass and size are measured. If one quantity has to be derived (e.g. mass from
  measured volume × density), the density must be a well-measured value for that specific class, the
  derivation must be written in `radius`/`cite`, and `label` must make it visible, e.g.
  "Meteorite · Met. Bulletin (size from class density)". Never derive from a generic allometric fit.
- Apply quality cuts where the data allows (uncertainties, "estimated" flags, missing values).
- Human-readable names (common or Latin name, catalogue designation) — no raw IDs if a name exists.
- Keep each source to a sensible size (≤ ~5,000 rows; sample deterministically if bigger).

DONE = `node scripts/build-dust.mjs --only=<your ids>` exits 0 (it writes nothing). Do NOT run the full
build, do NOT edit any other file, do NOT commit. Wikidata: send a descriptive User-Agent, keep queries
light (LIMIT, simple patterns), retry on 502/429 with backoff.

Report back: per source — id, row count kept, logM and logR range, anchors used, curated cross-check
results, any rejection list worth a human look, and honest caveats (what is measured vs derived).
