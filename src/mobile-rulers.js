// =============================================================
// MOBILE-RULERS.JS — rulers that come up while you look around (phones)
// =============================================================
//
// The phone map runs edge to edge with no axes. While you pan or pinch, or
// when you tap an object, rulers fade in over the map, as in the narrated
// videos: size along the bottom, and mass on the right (or energy on the
// left, down among particles and atoms, where electronvolts are the unit),
// with dashed guides from the screen's centre (or the tapped object) to both
// and its values written at the rulers. They fade out a moment after you stop.
// The axes button pins them (pin()), instead of opening solid margins.
// While you're moving only the rulers show: the crosshair and guides are for a
// still moment, on a tapped object or with the rulers pinned (author, 2026-10-23).
//
// Positions are chart-local px; the map's own logR is a radius and the size
// ruler reads the diameter, like the desktop axis (WIDTH_LOG_OFFSET).
// =============================================================

import { RADIUS_UNITS, MASS_UNITS, ENERGY_UNITS, WIDTH_LOG_OFFSET as W_OFF } from "./data.js";

const HOLD_MS = 1800;          // after the last movement, before fading
const EV_PER_G = 32.75;        // log10 of 1 g × c² in eV (data.js ENERGY_UNITS)
// Energy ruler below about the mass of a large molecule (logM in g), with a
// little hysteresis so it doesn't flip back and forth at the border.
const ENERGY_BELOW = -18, FLIP = 0.5;

// Prefix bases in log10 of the ruler's unit (grams, centimetres of diameter, eV)
const MASS_BASES = [[-12, "pg"], [-9, "ng"], [-6, "μg"], [-3, "mg"], [0, "g"], [3, "kg"], [6, "t"], [9, "kt"], [12, "Mt"], [15, "Gt"]];
const SIZE_BASES = [[-13, "fm"], [-10, "pm"], [-7, "nm"], [-4, "μm"], [-1, "mm"], [0, "cm"], [2, "m"], [5, "km"]];
const ENERGY_BASES = [[-3, "meV"], [0, "eV"], [3, "keV"], [6, "MeV"], [9, "GeV"], [12, "TeV"], [15, "PeV"], [18, "EeV"]];
const SUP = (n) => String(n).replace(/./g, c => "⁰¹²³⁴⁵⁶⁷⁸⁹⁻"["0123456789-".indexOf(c)]);

function baseFor(d, bases) {
  let base = bases[0];
  for (const b of bases) if (b[0] <= d) base = b;
  return base;
}
function tickLabel(v, bases) {          // v = log10 of the value in the base unit
  const d = Math.floor(v + 1e-9), k = Math.round(10 ** (v - d)), base = baseFor(d, bases), e = d - base[0];
  if (e > 5) return `${k > 1 ? k + "×" : ""}10${SUP(e)} ${base[1]}`;
  if (e < -2) return `${k > 1 ? k + "×" : ""}10${SUP(e)} ${base[1]}`;
  return `${(k * 10 ** e).toLocaleString("en-US", { maximumSignificantDigits: 3 })} ${base[1]}`;
}
/** "70 kg", "1.7 m": two significant figures in the ruler's units. */
function valueLabel(v, bases) {
  const d = Math.floor(v + 1e-9), base = baseFor(d, bases), e = d - base[0], mant = +(10 ** (v - d)).toPrecision(2);
  if (e > 5 || e < -2) return `${mant}×10${SUP(e)} ${base[1]}`;
  return `${(+(mant * 10 ** e).toPrecision(2)).toLocaleString("en-US")} ${base[1]}`;
}
// [{ at, label, minor }] for the visible span lo…hi (log10, base unit) at ppd px per decade
function fillTicks(lo, hi, ppd) {
  const out = [];
  for (let d = Math.floor(lo); d <= Math.ceil(hi); d++) {
    if (ppd > 70) out.push({ at: d });
    const ks = ppd > 520 ? [2, 3, 4, 5, 6, 7, 8, 9] : ppd > 260 ? [2, 3, 5] : ppd > 150 ? [2, 5] : [];
    for (const k of ks) out.push({ at: d + Math.log10(k), minor: true });
  }
  return out.filter(t => t.at >= lo && t.at <= hi);
}
const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/**
 * layer: a d3 <g> above the map (chart-local px), pointer-events off.
 * px/py: logR/logM → chart px; ipx/ipy: back. frame(): { w, h, top, bottom } of
 * the visible map (where the size ruler may sit: above sheets and buttons, or
 * below the top buttons when the object is down by the bottom one).
 * avoid(): screen boxes (chart px) the labels must stay out of.
 * focus(): { x, y } of the tapped object, or null for the screen's centre.
 */
export function createMobileRulers({ layer, px, py, ipx, ipy, frame, avoid, focus, onUnpin }) {
  layer.attr("class", "mobile-rulers").style("opacity", 0);
  // soft dark bands behind the rulers, so their numbers read over any picture
  const defs = layer.append("defs");
  const band = (id, x2, y2, stops) => {
    const g = defs.append("linearGradient").attr("id", id).attr("x1", 0).attr("y1", 0).attr("x2", x2).attr("y2", y2);
    stops.forEach(([o, a]) => g.append("stop").attr("offset", o).attr("stop-color", "#06061a").attr("stop-opacity", a));
  };
  band("mr-fade-h", 0, 1, [[0, 0], [0.5, 0.55], [1, 0]]);
  band("mr-fade-r", 1, 0, [[0, 0], [1, 0.6]]);
  band("mr-fade-l", 1, 0, [[0, 0.6], [1, 0]]);
  let hideTimer = null, visible = false, energy = false;
  let pinned = false, pinMs = Infinity, moving = false;   // pinned by the axes button: up until unpinned (or pinMs idle)

  // fade out after `ms` without movement; a pin with a time limit unpins then
  function arm() {
    clearTimeout(hideTimer);
    const ms = pinned ? pinMs : HOLD_MS;
    if (ms === Infinity) return;
    hideTimer = setTimeout(() => {
      if (pinned) { pinned = false; onUnpin?.(); }
      hide();
    }, ms);
  }
  function show() {
    visible = true;
    layer.style("opacity", 1);
    arm();
    draw();
  }
  /** Still moving: hold them up a little longer (the next redraw draws them). */
  function keep() { arm(); }
  function hide() {
    clearTimeout(hideTimer);
    visible = false;
    layer.style("opacity", 0);
  }
  /** A pan or pinch starts (true) or ends (false): no guides while moving. */
  function setMoving(on) {
    if (moving === on) return;
    moving = on;
    if (visible) draw();
  }
  /** The axes button: keep them up (for `ms` of stillness, or until unpinned). */
  function pin(on, ms = Infinity) {
    pinned = on; pinMs = ms;
    if (on) show(); else hide();
  }

  function draw() {
    if (!visible) return;
    layer.selectAll(":scope > :not(defs)").remove();
    const boxes = avoid();
    const { w, top, bottom } = frame();
    const f = focus(), centre = f || { x: w / 2, y: (top + bottom) / 2 };
    // the size ruler goes along the bottom, or the top when the object is down there
    const atTop = !!f && f.y > bottom - 90;
    const yB = Math.round(atTop ? top + 12 : bottom - 14), xSide = () => (energy ? 24 : w - 24);
    const logMc = ipy(centre.y);
    energy = energy ? logMc < ENERGY_BELOW + FLIP : logMc < ENERGY_BELOW - FLIP;
    const xS = xSide(), dir = energy ? 1 : -1;   // labels sit inward of the side ruler
    const placed = [];
    const free = (box) => !boxes.some(b => overlaps(box, b)) && !placed.some(b => overlaps(box, b));
    const text = (x, y, s, anchor, cls) => {
      const wd = s.length * 5.4 + 6, bx = anchor === "middle" ? x - wd / 2 : anchor === "end" ? x - wd : x;
      const box = { x: bx, y: y - 10, w: wd, h: 13 };
      if (!free(box)) return false;
      placed.push(box);
      layer.append("text").attr("x", x).attr("y", y).attr("text-anchor", anchor).attr("class", cls).text(s);
      return true;
    };

    // guides first, their values claim their places before the ticks
    const yTop = atTop ? yB + 26 : 60, ySideMax = atTop ? bottom - 10 : yB - 22;
    if (!moving && (f || pinned)) {
      const gx = Math.max(0, Math.min(w, centre.x)), gy = Math.max(yTop, Math.min(ySideMax, centre.y));
      if (!f) layer.append("path").attr("class", "mr-cross")
        .attr("d", `M${gx - 7},${gy}H${gx + 7}M${gx},${gy - 7}V${gy + 7}`);
      layer.append("line").attr("class", "mr-guide").attr("x1", gx).attr("y1", gy).attr("x2", xS).attr("y2", gy);
      layer.append("line").attr("class", "mr-guide").attr("x1", gx).attr("y1", gy).attr("x2", gx).attr("y2", yB);
      const sideValue = energy ? valueLabel(logMc + EV_PER_G, ENERGY_BASES) : valueLabel(logMc, MASS_BASES);
      text(xS + dir * 8, gy - 6, sideValue, energy ? "start" : "end", "mr-value");
      text(gx + 6, atTop ? yB + 30 : yB - 7, valueLabel(ipx(centre.x) + W_OFF, SIZE_BASES), "start", "mr-value");
    }

    // size, along the bottom
    layer.append("rect").attr("class", "mr-fade").attr("x", 0).attr("y", yB - 14).attr("width", w).attr("height", 32);
    layer.append("line").attr("class", "mr-axis").attr("x1", 0).attr("x2", w).attr("y1", yB).attr("y2", yB);
    const tickX = (x, minor, s) => {
      if (x < 6 || x > w - 6) return;
      if (!text(x, yB + 15, s, "middle", minor ? "mr-unit mr-minor" : "mr-unit")) return;
      layer.append("line").attr("class", "mr-tick").attr("x1", x).attr("x2", x).attr("y1", yB - (minor ? 3 : 5)).attr("y2", yB + (minor ? 3 : 5));
    };
    for (const u of RADIUS_UNITS) if (!/Planck|Hubble/.test(u.label)) tickX(px(u.logR), false, u.label);
    const rppd = Math.abs(px(1) - px(0)), rlo = ipx(0) + W_OFF, rhi = ipx(w) + W_OFF;
    for (const tk of fillTicks(Math.min(rlo, rhi), Math.max(rlo, rhi), rppd)) tickX(px(tk.at - W_OFF), tk.minor, tickLabel(tk.at, SIZE_BASES));

    // mass on the right, or energy on the left
    layer.append("rect").attr("class", energy ? "mr-fade-l" : "mr-fade-r")
      .attr("x", energy ? 0 : xS - 50).attr("y", atTop ? yB : 0).attr("width", energy ? xS + 50 : w - xS + 50).attr("height", atTop ? bottom - yB : yB);
    layer.append("line").attr("class", "mr-axis").attr("x1", xS).attr("x2", xS).attr("y1", atTop ? yB : 0).attr("y2", atTop ? bottom : yB);
    const tickY = (y, minor, s) => {
      if (y < yTop || y > ySideMax) return;
      if (!text(xS + dir * 8, y + 3.5, s, energy ? "start" : "end", minor ? "mr-unit mr-minor" : "mr-unit")) return;
      layer.append("line").attr("class", "mr-tick").attr("x1", xS - (minor ? 3 : 5)).attr("x2", xS + (minor ? 3 : 5)).attr("y1", y).attr("y2", y);
    };
    const named = energy ? ENERGY_UNITS.filter(u => !/PLANCK/.test(u.label))
      : MASS_UNITS.filter(u => !/\/c²|Planck|electron|proton/.test(u.label));
    for (const u of named) tickY(py(u.logM), false, u.label);
    const off = energy ? EV_PER_G : 0, mppd = Math.abs(py(1) - py(0));
    const mA = ipy(ySideMax) + off, mB = ipy(yTop) + off;
    for (const tk of fillTicks(Math.min(mA, mB), Math.max(mA, mB), mppd))
      tickY(py(tk.at - off), tk.minor, tickLabel(tk.at, energy ? ENERGY_BASES : MASS_BASES));
    text(w - 8, atTop ? yB + 28 : yB - 8, "SIZE →", "end", "mr-name");
    text(energy ? xS + 8 : xS - 8, atTop ? ySideMax : yTop + 4, energy ? "ENERGY ↑" : "MASS ↑", energy ? "start" : "end", "mr-name");
  }

  return { show, keep, hide, pin, draw, setMoving, get visible() { return visible; }, get pinned() { return pinned; } };
}
