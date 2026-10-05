// src/trackpad-pan.js
// Wheel input, the Figma / Apple Maps way: a trackpad two-finger drag pans,
// a pinch (ctrlKey wheel — Safari's comes via trackpad-pinch.js) zooms, and
// a mouse wheel still zooms, as in Google Maps.
import { select, zoomTransform } from "d3";

// Browsers don't say which device sent a wheel event, so classify it:
// Chrome and Safari report trackpad scrolls with wheelDeltaY === -3·deltaY,
// while mouse notches come as ±120-multiples that don't match; any sideways
// delta is a trackpad (or shift+wheel, which should pan anyway). Without
// wheelDeltaY (Firefox) only sideways motion counts as a pan. The verdict
// sticks for the whole burst, so momentum tails can't flip it mid-gesture.
const WHEEL_BURST_MS = 150; // d3-zoom's own wheel gesture idle
let _sticky = null, _stickyT = 0;
export function wheelKind(e) {
  if (e.ctrlKey) return "zoom"; // pinch
  const now = performance.now();
  if (_sticky && now - _stickyT < WHEEL_BURST_MS) {
    _stickyT = now;
    return _sticky;
  }
  const trackpad = e.deltaX !== 0 ||
    (e.wheelDeltaY ? e.wheelDeltaY === -3 * e.deltaY : false);
  _sticky = trackpad && e.deltaMode === 0 ? "pan" : "zoom";
  _stickyT = now;
  return _sticky;
}

// Call after the zoom's start/end listeners are registered: it wraps them.
// d3 keeps wheel zoom for mouse wheels and pinches; trackpad drags pan via
// translateBy instead. A pan burst runs as ONE gesture — translateBy alone
// would fire start/end per wheel event (a full redraw / relayout each), so
// both are held until the burst idles, matching d3's own wheel gestures.
export function enableTrackpadPan(svgNode, zoom) {
  const sel = select(svgNode);
  const filter = zoom.filter();
  zoom.filter(function (e) {
    if (e.type === "wheel" && wheelKind(e) === "pan") return false;
    return filter.apply(this, arguments);
  });

  let burst = false, started = false, timer = null;
  const onStart = zoom.on("start"), onEnd = zoom.on("end");
  zoom.on("start", function (e) {
    if (burst) { if (started) return; started = true; } // once per burst
    onStart?.apply(this, arguments);
  });
  zoom.on("end", function (e) {
    if (burst) return; // the burst's own timer ends it
    onEnd?.apply(this, arguments);
  });

  svgNode.addEventListener("wheel", (e) => {
    if (wheelKind(e) !== "pan") return;
    e.preventDefault();
    // Screen px → zoom units: undo the current zoom and any viewBox or CSS
    // scaling, so the content tracks the fingers.
    const k = zoomTransform(svgNode).k * (svgNode.getScreenCTM()?.a || 1);
    sel.interrupt(); // a trackpad drag takes over from any glide or flight
    burst = true;
    zoom.translateBy(sel, -e.deltaX / k, -e.deltaY / k, e);
    clearTimeout(timer);
    timer = setTimeout(() => {
      burst = started = false;
      onEnd?.call(svgNode, { type: "end", sourceEvent: e, transform: zoomTransform(svgNode), target: zoom });
    }, WHEEL_BURST_MS);
  }, { passive: false });
}
