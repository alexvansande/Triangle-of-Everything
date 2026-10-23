// Pictures of things that shine (stars, particles, nebulae, galaxies…). They
// were drawn with mix-blend-mode: screen over black squares; WebKit painted
// those black squares solid over the fractal background. They are now stored
// as transparent pictures, brightness turned into opacity with their dark
// backing baked in (scripts/unscreen-icons.mjs), and drawn like any other.
// Being luminous still matters: no cast shadow, a tighter hover circle.
export const LUMINOUS_CATS = new Set(["remnant", "galaxy", "largescale", "star", "particle", "composite", "blackhole", "atomic"]);
export const LUMINOUS_SLUGS = new Set(["halleys-comet", "hale-bopp"]);
export const isLuminousArt = (cat, slug = "") => !slug.includes("void") && (LUMINOUS_CATS.has(cat) || LUMINOUS_SLUGS.has(slug));
