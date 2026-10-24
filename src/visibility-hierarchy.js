// Input order is the fixed editorial hierarchy. Every earlier candidate
// reserves space, even when itself blocked. A greedy "visible winners only"
// pass can swap A → B → A as an upstream blocker releases B during zoom.
// With fixed priorities, growing separation only reveals more candidates.
export function priorityCircles(items, radiusOf, room = 1, blockers = []) {
  const reserved = blockers.map(o => ({ sx:o.sx, sy:o.sy, r:radiusOf(o), imagePriority:o.imagePriority ?? 1 }));
  const visible = new Set();
  for (const item of items) {
    const r = radiusOf(item);
    const blocked = reserved.some(other => {
      if (other.imagePriority > (item.imagePriority ?? 1)) return false;
      const distance = (r + other.r) * room;
      return (item.sx-other.sx)**2 + (item.sy-other.sy)**2 < distance**2;
    });
    if (!blocked) visible.add(item);
    reserved.push({sx:item.sx,sy:item.sy,r,imagePriority:item.imagePriority ?? 1});
  }
  return visible;
}
