// src/trackpad-pinch.js
// Safari reports a trackpad pinch as proprietary gesture events, while
// Chrome and Firefox send a wheel event with ctrlKey set — the only form
// d3-zoom listens for. Re-dispatch Safari's pinch as that wheel event, so
// d3 handles it exactly like any other browser's (same anchor point, same
// gesture start/end), and stop Safari from zooming the whole page instead.

// d3-zoom's default wheel scale: k × 2^(−deltaY × 0.002 × 10) when ctrlKey
const DELTA_PER_DOUBLING = 1 / (0.002 * 10);

// zoomNode: the element d3-zoom is attached to. listenOn: where pinches can
// start (defaults to zoomNode; add overlays that sit on top of it). Safari
// keeps sending a gesture to the element it started on, and an overlay may
// remove that element mid-pinch; its events then never bubble, so the rest
// of the gesture is also caught on that element itself.
export function enableTrackpadPinch(zoomNode, listenOn = [zoomNode]) {
  let active = false, last = 1, origin = null;
  const change = (e) => {
    if (!active || e.__pinched) return;
    e.__pinched = true;
    e.preventDefault();
    const ratio = e.scale / last;
    last = e.scale;
    if (!ratio || !isFinite(ratio)) return;
    zoomNode.dispatchEvent(new WheelEvent("wheel", {
      bubbles: true, cancelable: true, ctrlKey: true,
      clientX: e.clientX, clientY: e.clientY, deltaMode: 0,
      deltaY: -Math.log2(ratio) * DELTA_PER_DOUBLING,
    }));
  };
  const end = (e) => {
    if (!active) return;
    e.preventDefault();
    active = false;
    origin?.removeEventListener("gesturechange", change);
    origin?.removeEventListener("gestureend", end);
    origin = null;
  };
  document.addEventListener("gesturestart", (e) => {
    active = listenOn.some(el => el.contains(e.target));
    if (!active) return;
    e.preventDefault();
    last = 1;
    origin = e.target;
    origin.addEventListener("gesturechange", change);
    origin.addEventListener("gestureend", end);
  });
  document.addEventListener("gesturechange", change);
  document.addEventListener("gestureend", end);
}
