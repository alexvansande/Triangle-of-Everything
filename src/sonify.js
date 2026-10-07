// =============================================================
// Sound map — ?sonify (or the sonify-preview build)
// =============================================================
// The chart as a step sequencer, after Yamaha's Tenori-on and André Michelle's
// ToneMatrix: a playhead sweeps left to right across whatever part of the map
// is on screen, and every main object it passes plays a note. Height on the
// screen sets the pitch (a pentatonic scale, so any zoom spans a full musical
// range); the object's region of the triangle sets the instrument, and each
// object gets its own small, fixed variation of it (seeded from its name), so
// every dot has a voice of its own. Zooming and panning changes the music:
// the quantum corner rings like glass, life plucks, stars swell like brass,
// galaxies drone. Everything is synthesized with Web Audio, no samples.

const STEPS = 16;
const MAX_VOICES = 5;                        // per step: the most important objects win
const SCALE = [0, 2, 4, 7, 9];               // major pentatonic
const ROOT = 50;                             // D3
const ROWS = 15;                             // three octaves of the scale across the screen height

// One instrument per category: name, register (octaves from the root), reverb send
const INSTRUMENTS = {
  particle:   { name: "Particles",       sound: "glass bells",   oct: 2,  wet: 0.35 },
  composite:  { name: "Hadrons",         sound: "metal pluck",   oct: 1,  wet: 0.3 },
  atomic:     { name: "Atoms",           sound: "marimba",       oct: 1,  wet: 0.25 },
  micro:      { name: "Microbes",        sound: "bubbles",       oct: 1,  wet: 0.25 },
  macro:      { name: "Living & made",   sound: "plucked string",oct: 0,  wet: 0.25 },
  planet:     { name: "Planets",         sound: "vibraphone",    oct: 0,  wet: 0.35 },
  star:       { name: "Stars",           sound: "warm brass",    oct: -1, wet: 0.4 },
  remnant:    { name: "Remnants",        sound: "pulsar ticks",  oct: 1,  wet: 0.3 },
  blackhole:  { name: "Black holes",     sound: "sub drop",      oct: -2, wet: 0.5 },
  galaxy:     { name: "Galaxies",        sound: "slow pad",      oct: -1, wet: 0.6 },
  largescale: { name: "Cosmic web",      sound: "deep choir",    oct: -2, wet: 0.7 },
};

const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
// four numbers in [0, 1) from an object's name: its own timbre
const voiceOf = (name) => { const h = hash(name); return [h & 255, (h >> 8) & 255, (h >> 16) & 255, (h >> 24) & 255].map(v => v / 256); };
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);

let ctx, master, verb;

function makeAudio() {
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
  master = ctx.createGain(); master.gain.value = 0.7;
  master.connect(comp).connect(ctx.destination);
  // a soft hall: decaying stereo noise
  const len = ctx.sampleRate * 3.2, ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / len * 6.5) * (1 - Math.exp(-i / 400));
  }
  verb = ctx.createConvolver(); verb.buffer = ir;
  const vg = ctx.createGain(); vg.gain.value = 0.55;
  verb.connect(vg).connect(master);
}

// ---------- instruments: (time, frequency, velocity, voice[4], output) ----------
function env(g, t, a, peak, d, sustain = 0, rel = 0) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + a);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, sustain || 0.0001), t + a + d);
  if (rel) g.gain.exponentialRampToValueAtTime(0.0001, t + a + d + rel);
}
function osc(type, f, t, end, out) {
  const o = ctx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t);
  o.connect(out); o.start(t); o.stop(end); return o;
}
function fm(t, f, vel, ratio, index, dec, out) {   // a two-operator FM voice
  const g = ctx.createGain(); g.connect(out); env(g, t, 0.003, vel, dec);
  const car = osc("sine", f, t, t + dec + 0.1, g);
  const mg = ctx.createGain(); mg.gain.setValueAtTime(f * index, t); mg.gain.exponentialRampToValueAtTime(f * 0.01, t + dec);
  const mod = osc("sine", f * ratio, t, t + dec + 0.1, mg); mg.connect(car.frequency);
}
const PLAY = {
  particle(t, f, v, p, out) { fm(t, f, v * 0.5, 3.5 + Math.round(p[0] * 4), 1.5 + p[1] * 2, 0.6 + p[2] * 0.6, out); },
  composite(t, f, v, p, out) { fm(t, f, v * 0.55, 1.41 + p[0] * 0.6, 3 + p[1] * 3, 0.35 + p[2] * 0.3, out); },
  atomic(t, f, v, p, out) {      // marimba: a sine and its fourth harmonic, quick
    const g = ctx.createGain(); g.connect(out); env(g, t, 0.002, v * 0.6, 0.45 + p[0] * 0.4);
    osc("sine", f, t, t + 1, g);
    const h = ctx.createGain(); h.connect(g); env(h, t, 0.001, 0.35 + p[1] * 0.3, 0.08);
    osc("sine", f * (3.9 + p[2] * 0.3), t, t + 0.3, h);
  },
  micro(t, f, v, p, out) {       // a bubble: a short upward blip
    const g = ctx.createGain(); g.connect(out); env(g, t, 0.003, v * 0.9, 0.2 + p[0] * 0.12);
    const o = osc("triangle", f * 0.7, t, t + 0.4, g);
    o.frequency.exponentialRampToValueAtTime(f * (1.3 + p[1] * 0.6), t + 0.08);
  },
  macro(t, f, v, p, out) {       // a plucked string: a bright saw closing down
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 2 + p[0] * 4;
    lp.frequency.setValueAtTime(f * (6 + p[1] * 6), t); lp.frequency.exponentialRampToValueAtTime(f * 1.2, t + 0.3);
    const g = ctx.createGain(); lp.connect(g).connect(out); env(g, t, 0.003, v * 0.65, 0.6 + p[2] * 0.5);
    osc("sawtooth", f, t, t + 1.3, lp);
  },
  planet(t, f, v, p, out) {      // a vibraphone: soft sine with a slow tremolo
    const g = ctx.createGain(); env(g, t, 0.01, v * 0.55, 1.6 + p[0]);
    const trem = ctx.createGain(); trem.gain.value = 0.75; g.connect(trem).connect(out);
    const lg = ctx.createGain(); lg.gain.value = 0.25; lg.connect(trem.gain);
    osc("sine", 4 + p[1] * 3, t, t + 3, lg);
    osc("sine", f, t, t + 3, g); const h = ctx.createGain(); h.gain.value = 0.15; h.connect(g); osc("sine", f * 4, t, t + 3, h);
  },
  star(t, f, v, p, out) {        // warm brass: two detuned saws, the filter swells open
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 1;
    lp.frequency.setValueAtTime(f * 1.2, t); lp.frequency.linearRampToValueAtTime(f * (3 + p[0] * 3), t + 0.15);
    lp.frequency.exponentialRampToValueAtTime(f * 1.5, t + 0.9);
    const g = ctx.createGain(); lp.connect(g).connect(out); env(g, t, 0.06, v * 0.3, 0.9 + p[1] * 0.6);
    osc("sawtooth", f * (1 - 0.004 - p[2] * 0.004), t, t + 1.8, lp); osc("sawtooth", f * (1 + 0.004 + p[2] * 0.004), t, t + 1.8, lp);
  },
  remnant(t, f, v, p, out) {     // a pulsar: a quick train of ticks
    const n = 3 + Math.floor(p[0] * 4), gap = 0.045 + p[1] * 0.05;
    for (let i = 0; i < n; i++) {
      const g = ctx.createGain(); g.connect(out); env(g, t + i * gap, 0.001, v * 0.35 * (1 - i / n), 0.03);
      osc("square", f * 2, t + i * gap, t + i * gap + 0.06, g);
    }
  },
  blackhole(t, f, v, p, out) {   // a sub drop
    const g = ctx.createGain(); g.connect(out); env(g, t, 0.01, v * 0.9, 1.4 + p[0]);
    const o = osc("sine", f * 2, t, t + 2.6, g); o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 1.2 + p[1]);
  },
  galaxy(t, f, v, p, out) {      // a slow pad: detuned saws, soft attack, long tail
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = f * (2.5 + p[0] * 2);
    const g = ctx.createGain(); lp.connect(g).connect(out); env(g, t, 0.5 + p[1] * 0.4, v * 0.22, 2.4, 0, 0);
    for (const d of [-0.007, 0, 0.006 + p[2] * 0.004]) osc("sawtooth", f * (1 + d), t, t + 3.5, lp);
  },
  largescale(t, f, v, p, out) {  // a deep choir: stacked sines, very slow
    const g = ctx.createGain(); g.connect(out); env(g, t, 0.9, v * 0.35, 3);
    for (const [r, a] of [[1, 1], [2, 0.5], [3, 0.25 + p[0] * 0.2], [5, 0.1]]) {
      const h = ctx.createGain(); h.gain.value = a; h.connect(g); osc("sine", f * r * (1 + (p[1] - 0.5) * 0.002 * r), t, t + 4.2, h);
    }
  },
};

export function startSonify(app) {
  const state = { playing: false, bpm: 112, mute: new Set(), solo: null, t0: 0, step: 0, next: 0 };
  const voices = new Map(app.objects.map(o => [o.name, voiceOf(o.name)]));
  const pulses = [];                         // rings to draw: {x, y, color, t}

  // ---------- overlay ----------
  const cv = document.createElement("canvas");
  cv.id = "sonify-canvas";
  document.body.appendChild(cv);
  const g2 = cv.getContext("2d");
  const panel = document.createElement("div");
  panel.id = "sonify-panel";
  panel.innerHTML = `
    <div class="sn-head">
      <button id="sn-play" type="button" aria-label="Play">▶</button>
      <div><div class="sn-title">Sound map</div><div class="sn-sub">zoom and pan to change the music</div></div>
    </div>
    <label class="sn-tempo">tempo <input id="sn-bpm" type="range" min="60" max="168" step="4" value="${state.bpm}"><span id="sn-bpm-v">${state.bpm}</span></label>
    <ul id="sn-list">${Object.entries(INSTRUMENTS).map(([k, v]) => `
      <li data-cat="${k}" title="tap to mute · double-tap to solo">
        <span class="sn-dot" style="background:${app.categories[k]?.color || "#fff"}"></span>
        <span class="sn-name">${v.name}</span><span class="sn-sound">${v.sound}</span><span class="sn-n">0</span>
      </li>`).join("")}</ul>`;
  document.body.appendChild(panel);
  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const resize = () => { const d = devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; g2.setTransform(d, 0, 0, d, 0, 0); };
  resize(); addEventListener("resize", resize);

  // ---------- what's on screen ----------
  function visible() {
    const P = app.plot(), k = app.k(), out = [];
    for (const o of app.objects) {
      if (o.minK && k < o.minK) continue;
      const x = app.px(o.logR), y = app.py(o.logM);
      if (x < 0 || x >= P.w || y < 0 || y >= P.h) continue;
      out.push({ o, x, y, col: Math.floor(x / P.w * STEPS) });
    }
    return out;
  }
  const audible = (cat) => state.solo ? state.solo === cat : !state.mute.has(cat);

  // ---------- the sequencer: schedule a little ahead of the audio clock ----------
  const stepDur = () => 60 / state.bpm / 2;  // 8th notes
  function scheduleStep(step, t) {
    const P = app.plot();
    const hits = visible().filter(v => v.col === step && audible(v.o.cat) && INSTRUMENTS[v.o.cat])
      .sort((a, b) => (a.o.z ?? 9) - (b.o.z ?? 9)).slice(0, MAX_VOICES);
    const vel = 0.9 / Math.sqrt(Math.max(1, hits.length));
    for (const { o, x, y } of hits) {
      const ins = INSTRUMENTS[o.cat];
      const row = Math.max(0, Math.min(ROWS - 1, Math.floor((1 - y / P.h) * ROWS)));
      const midi = ROOT + 12 * ins.oct + SCALE[row % 5] + 12 * Math.floor(row / 5);
      const p = voices.get(o.name);
      const pan = ctx.createStereoPanner(); pan.pan.value = (x / P.w) * 1.4 - 0.7;
      const send = ctx.createGain(); send.gain.value = ins.wet;
      pan.connect(master); pan.connect(send).connect(verb);
      PLAY[o.cat](t, mtof(midi), vel * (0.85 + p[3] * 0.3), p, pan);
      pulses.push({ name: o.name, color: app.categories[o.cat]?.color || "#fff", t });
    }
  }
  let timer = 0;
  function tick() {
    while (state.next < ctx.currentTime + 0.12) {
      scheduleStep(state.step, state.next);
      state.step = (state.step + 1) % STEPS;
      state.next += stepDur();
    }
  }
  function play() {
    if (!ctx) makeAudio();
    ctx.resume();
    state.playing = true; state.step = 0; state.next = ctx.currentTime + 0.06; state.t0 = state.next;
    clearInterval(timer); timer = setInterval(tick, 25); tick();
    playBtn.textContent = "❚❚"; playBtn.setAttribute("aria-label", "Pause");
  }
  function stop() {
    state.playing = false; clearInterval(timer);
    playBtn.textContent = "▶"; playBtn.setAttribute("aria-label", "Play");
  }

  // ---------- controls ----------
  const playBtn = panel.querySelector("#sn-play");
  playBtn.addEventListener("click", () => state.playing ? stop() : play());
  const bpm = panel.querySelector("#sn-bpm");
  bpm.addEventListener("input", () => {     // takes effect from the next step
    state.bpm = +bpm.value; panel.querySelector("#sn-bpm-v").textContent = state.bpm;
  });
  let lastTap = { cat: null, t: 0 };
  panel.querySelector("#sn-list").addEventListener("click", (e) => {
    const li = e.target.closest("li[data-cat]"); if (!li) return;
    const cat = li.dataset.cat, now = performance.now();
    if (lastTap.cat === cat && now - lastTap.t < 350) {          // double tap: solo (again: unsolo)
      if (state.mute.has(cat)) state.mute.delete(cat); else state.mute.add(cat);   // undo the first tap's toggle
      state.solo = state.solo === cat ? null : cat;
    } else if (state.mute.has(cat)) state.mute.delete(cat); else state.mute.add(cat);
    lastTap = { cat, t: now };
    showList();
  });
  addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea")) return;
    if (e.key === "p" || e.key === "P") { e.preventDefault(); state.playing ? stop() : play(); }
  });
  function showList(counts) {
    panel.querySelectorAll("#sn-list li").forEach(li => {
      const cat = li.dataset.cat;
      li.classList.toggle("off", !audible(cat));
      li.classList.toggle("solo", state.solo === cat);
      if (counts) {
        const n = counts[cat] || 0;
        li.querySelector(".sn-n").textContent = n;
        li.classList.toggle("absent", n === 0);
      }
    });
  }
  setInterval(() => {
    const counts = {}; for (const v of visible()) counts[v.o.cat] = (counts[v.o.cat] || 0) + 1;
    showList(counts);
  }, 300);

  // ---------- drawing: the playhead and a ring on every dot as it sounds ----------
  const byName = new Map(app.objects.map(o => [o.name, o]));
  function frame() {
    requestAnimationFrame(frame);
    g2.clearRect(0, 0, innerWidth, innerHeight);
    if (!ctx || !state.playing) return;
    const P = app.plot(), now = ctx.currentTime;
    // the playhead: where the step clock is now (the step being heard)
    const heard = ((state.step - Math.ceil((state.next - now) / stepDur()) + STEPS * 4) % STEPS);
    const frac = 1 - ((state.next - now) / stepDur() % 1);
    const x = P.x + (heard + frac) / STEPS * P.w;
    const grad = g2.createLinearGradient(x - 60, 0, x, 0);
    grad.addColorStop(0, "rgba(255,213,79,0)"); grad.addColorStop(1, "rgba(255,213,79,0.10)");
    g2.fillStyle = grad; g2.fillRect(x - 60, P.y, 60, P.h);
    g2.fillStyle = "rgba(255,213,79,0.55)"; g2.fillRect(x - 1, P.y, 2, P.h);
    for (let i = pulses.length - 1; i >= 0; i--) {
      const q = pulses[i], age = now - q.t;
      if (age > 0.9) { pulses.splice(i, 1); continue; }
      if (age < 0) continue;
      const o = byName.get(q.name), px = P.x + app.px(o.logR), py = P.y + app.py(o.logM);
      const f = age / 0.9;
      g2.strokeStyle = q.color; g2.globalAlpha = (1 - f) * 0.9; g2.lineWidth = 2.5 * (1 - f) + 0.5;
      g2.beginPath(); g2.arc(px, py, 6 + f * 26, 0, Math.PI * 2); g2.stroke();
      g2.globalAlpha = 1;
    }
  }
  frame();
}

const CSS = `
#sonify-canvas { position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 9000; }
#sonify-panel { position: fixed; z-index: 9001; right: 14px; top: 64px; width: 248px; max-height: calc(100vh - 140px); overflow-y: auto;
  padding: 12px 12px 8px; border-radius: 14px; background: rgba(8, 9, 30, 0.86); border: 1px solid rgba(150, 160, 255, 0.2);
  color: #eef0ff; font: 13px/1.3 Inter, system-ui, sans-serif; backdrop-filter: blur(6px); }
.sn-head { display: flex; align-items: center; gap: 10px; }
#sn-play { flex: none; width: 42px; height: 42px; border-radius: 50%; border: 0; background: #ffd54f; color: #0b0c20;
  font-size: 15px; cursor: pointer; }
#sn-play:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.sn-title { font: 700 18px/1 "Barlow Condensed", "Arial Narrow", sans-serif; letter-spacing: 0.06em; text-transform: uppercase; }
.sn-sub { color: #a3a8d6; font-size: 12px; margin-top: 3px; }
.sn-tempo { display: flex; align-items: center; gap: 8px; margin: 10px 0 6px; color: #a3a8d6; font-size: 12px; }
.sn-tempo input { flex: 1; accent-color: #ffd54f; }
.sn-tempo span { width: 28px; text-align: right; font-variant-numeric: tabular-nums; color: #eef0ff; }
#sn-list { list-style: none; margin: 0; padding: 0; }
#sn-list li { display: grid; grid-template-columns: 12px 1fr auto; grid-template-rows: auto auto; column-gap: 8px; align-items: center;
  padding: 5px 6px; border-radius: 8px; cursor: pointer; user-select: none; }
#sn-list li:hover { background: rgba(255, 255, 255, 0.06); }
.sn-dot { grid-row: 1 / 3; width: 10px; height: 10px; border-radius: 50%; }
.sn-name { font-weight: 600; }
.sn-sound { grid-column: 2; color: #a3a8d6; font-size: 11.5px; }
.sn-n { grid-row: 1 / 3; grid-column: 3; font-variant-numeric: tabular-nums; color: #a3a8d6; font-size: 12px; }
#sn-list li.absent { opacity: 0.45; }
#sn-list li.off { opacity: 0.3; text-decoration: line-through; }
#sn-list li.solo { background: rgba(255, 213, 79, 0.14); box-shadow: inset 0 0 0 1px rgba(255, 213, 79, 0.5); }
@media (max-width: 640px) {
  #sonify-panel { left: 8px; right: 8px; top: auto; bottom: 8px; width: auto; max-height: 42vh; }
  #sn-list { display: grid; grid-template-columns: 1fr 1fr; }
  .sn-sound { display: none; }
}
`;
