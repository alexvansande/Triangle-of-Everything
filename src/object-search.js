const normalize = value => String(value).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

/** Build once after the lazy catalogue loads; curated entries win name duplicates. */
export function buildSearchIndex(curated, catalogue) {
  const seen = new Set();
  return [...curated, ...catalogue].flatMap(object => {
    const names = [object.name, ...(object.aliases || [])].map(normalize);
    if (seen.has(names[0])) return [];
    seen.add(names[0]);
    return [{ object, names }];
  });
}

export function searchObjects(index, query, limit = 8) {
  const q = normalize(query);
  if (!q) return [];
  return index.map(entry => ({ ...entry, score: Math.min(...entry.names.map(name =>
    name === q ? 0 : name.startsWith(q) ? 1 : name.includes(q) ? 2 : 3)) }))
    .filter(entry => entry.score < 3).sort((a, b) => a.score - b.score)
    .slice(0, limit).map(entry => entry.object);
}
