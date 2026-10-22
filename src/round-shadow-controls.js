// Offsets are percentages of the resting body diameter, so zoom and hover
// preserve the same registration. Only the shared spherical texture uses them.
const DEFAULT = { x: -5, y: -5 };
const KEY = 'tri-round-shadow-offset';
export const roundShadowOffset = { ...DEFAULT };
const clamp = value => Math.max(-50, Math.min(50, Number(value)));

export function mountRoundShadowControls(panel, redraw) {
  panel.style.maxHeight = 'calc(100dvh - 170px)';
  panel.style.overflowY = 'auto';
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    for (const axis of ['x', 'y']) {
      if (Number.isFinite(saved?.[axis])) roundShadowOffset[axis] = clamp(saved[axis]);
    }
  } catch { /* Storage is optional. */ }
  const controls = document.createElement('details');
  controls.id = 'round-shadow-controls';
  controls.style.cssText = 'padding:8px 0;border-bottom:1px solid #ffffff25;margin-bottom:10px';
  controls.innerHTML = `<summary style="cursor:pointer">Spherical shadow position</summary>
    <p class="setting-note">Adjust all round shadows live. Values are % of the object’s width. Saved in this browser.</p>
    <label class="setting-range"><span class="setting-range-label">West ← → East <output id="round-shadow-x-value"></output></span><input aria-label="Spherical shadow horizontal offset" id="round-shadow-x" type="range" min="-50" max="50" step="1"></label>
    <label class="setting-range"><span class="setting-range-label">North ↑ ↓ South <output id="round-shadow-y-value"></output></span><input aria-label="Spherical shadow vertical offset" id="round-shadow-y" type="range" min="-50" max="50" step="1"></label>
    <button type="button">Reset position</button>`;
  panel.prepend(controls);
  function sync() {
    for (const axis of ['x', 'y']) {
      controls.querySelector(`#round-shadow-${axis}`).value = roundShadowOffset[axis];
      controls.querySelector(`#round-shadow-${axis}-value`).value = `${roundShadowOffset[axis]}%`;
    }
  }
  function apply() {
    sync();
    try { localStorage.setItem(KEY, JSON.stringify(roundShadowOffset)); } catch { /* Optional. */ }
    redraw();
  }
  for (const axis of ['x', 'y']) {
    controls.querySelector(`#round-shadow-${axis}`).addEventListener('input', event => {
      roundShadowOffset[axis] = clamp(event.target.value);
      apply();
    });
  }
  controls.querySelector('button').addEventListener('click', () => {
    Object.assign(roundShadowOffset, DEFAULT);
    apply();
  });
  sync();
}
