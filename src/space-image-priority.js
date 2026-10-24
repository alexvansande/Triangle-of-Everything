import legacy from '../content/icons/space-image-priority.json' with {type:'json'};
import current from '../content/icons/provenance-2026-10-24.json' with {type:'json'};

const photos = new Set(legacy.photos), ai = new Set(legacy.ai);
const space = new Set(['planet','star','remnant','blackhole','galaxy','largescale']);
// Lower wins. Unknown provenance remains neutral, never implicitly a photo.
export function spaceImagePriority(slug, category) {
  if (!space.has(category)) return 1;
  const provenance = current[slug]?.category;
  if (provenance === 'photo-adjusted') return 0;
  if (provenance?.includes('ai')) return 2;
  if (ai.has(slug)) return 2;
  return photos.has(slug) ? 0 : 1;
}
