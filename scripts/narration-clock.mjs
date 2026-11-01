// The virtual clock the renderer and the thumbnails run the page on (scripts/narration-render.mjs,
// scripts/narration-poster.mjs): performance.now, Date.now, requestAnimationFrame, setTimeout and CSS
// animations stand still once __vclock.freeze() is called, and move only by __vclock.step(ms). So a
// frame is the same on any machine, however slow it draws.
export const CLOCK_SHIM = `(() => {
  const realNow = performance.now.bind(performance), realDate = Date.now;
  const realRaf = window.requestAnimationFrame.bind(window), realCaf = window.cancelAnimationFrame.bind(window);
  const realST = window.setTimeout.bind(window), realCT = window.clearTimeout.bind(window);
  const dateBase = realDate() - realNow();
  let frozen = false, vt = 0, nextId = 1e6, rafQ = [], timers = [];
  performance.now = () => frozen ? vt : realNow();
  Date.now = () => frozen ? dateBase + vt : realDate();
  window.requestAnimationFrame = (cb) => { if (!frozen) return realRaf(cb); rafQ.push([++nextId, cb]); return nextId; };
  window.cancelAnimationFrame = (id) => { rafQ = rafQ.filter(x => x[0] !== id); realCaf(id); };
  window.setTimeout = (fn, ms = 0, ...a) => {
    if (!frozen || typeof fn !== "function") return realST(fn, ms, ...a);
    timers.push({ id: ++nextId, at: vt + (+ms || 0), fn: () => fn(...a) }); return nextId;
  };
  window.clearTimeout = (id) => { timers = timers.filter(t => t.id !== id); realCT(id); };
  window.__vclock = {
    freeze() { vt = realNow(); frozen = true; },
    now: () => vt,
    step(ms) {
      vt += ms;
      for (let guard = 0; guard < 50; guard++) {
        const due = timers.filter(t => t.at <= vt).sort((a, b) => a.at - b.at);
        if (!due.length) break;
        timers = timers.filter(t => t.at > vt);
        due.forEach(t => { try { t.fn(); } catch (e) { console.error(e); } });
      }
      const q = rafQ; rafQ = [];
      q.forEach(([, cb]) => { try { cb(vt); } catch (e) { console.error(e); } });
      document.getAnimations().forEach(a => { try { a.pause(); a.currentTime = (a.currentTime ?? 0) + ms; } catch {} });
    },
  };
})();`;
