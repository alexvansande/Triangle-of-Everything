// Hopf particles: geometry, particle grammar and the WebGL2 renderer, shared by
// /hopf.html (the sandbox) and the chart's live particle icons (src/hopf-icons.js).
// =============================================================
// Geometry on S³
// A point of S³ ⊂ C² is (z1, z2) with |z1|² + |z2|² = 1, stored as
// R⁴ = (Re z1, Im z1, Re z2, Im z2). A (p,q) Seifert fiber over the base
// point (η, ξ1, ξ2) is
//   z1 = cos η · e^{i(ξ1 + pθ)},  z2 = sin η · e^{i(ξ2 + qθ)},  θ ∈ [0, 2π).
// (1,1) is the Hopf fibration proper: great circles, every pair linked once.
// Coprime (p,q) gives torus knots that wind p times around the axis and q
// times around the tube (q-fold symmetric); p/q is read as the electric charge.
// (0,1) are meridian rings of the torus: none of them link, the neutral case.
// =============================================================
const TAU = Math.PI * 2;

function fiberPoint(f, th) {
  const a1 = f.xi1 + f.p * th, a2 = f.xi2 + f.q * th;
  const c = Math.cos(f.eta), s = Math.sin(f.eta);
  return [c * Math.cos(a1), c * Math.sin(a1), s * Math.cos(a2), s * Math.sin(a2)];
}

// 4×4 rotation as a product of plane rotations [[i, j, angle], ...]
function rot4(planes) {
  const m = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
  for (const [i, j, a] of planes) {
    const c = Math.cos(a), s = Math.sin(a);
    for (let r = 0; r < 4; r++) {
      const mi = m[r * 4 + i], mj = m[r * 4 + j];
      m[r * 4 + i] = mi * c - mj * s;
      m[r * 4 + j] = mi * s + mj * c;
    }
  }
  return m;
}

function apply4(m, x) {
  return [
    m[0] * x[0] + m[1] * x[1] + m[2] * x[2] + m[3] * x[3],
    m[4] * x[0] + m[5] * x[1] + m[6] * x[2] + m[7] * x[3],
    m[8] * x[0] + m[9] * x[1] + m[10] * x[2] + m[11] * x[3],
    m[12] * x[0] + m[13] * x[1] + m[14] * x[2] + m[15] * x[3],
  ];
}

// Stereographic projection from the pole w = 1 of a point at 4D radius r,
// turned so the axis that the z1 phase rotates around is vertical (a proper
// rotation: chirality is kept)
function stereo(x, r) {
  const k = r / Math.max(1e-3, 1 - r * x[3]);
  return [x[0] * k, x[2] * k, -x[1] * k];
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
// Rotate r about unit axis t (r ⟂ t)
const spinAbout = (r, t, a) => { const c = Math.cos(a), s = Math.sin(a), b = cross(t, r); return [r[0] * c + b[0] * s, r[1] * c + b[1] * s, r[2] * c + b[2] * s]; };

const ROWS = 5;
// Sample one fiber into rows of the data texture:
//   row 0: position.xyz, half-width
//   row 1: ribbon direction R, cross-section flatness (1 = round tube)
//   row 2: binormal B = T × R
//   row 3: front linear rgb, intensity
//   row 4: back linear rgb
// The ribbon frame is rotation-minimizing (double reflection), with the
// closing mismatch spread evenly, so the only twist left is the one we add
// on purpose: spin × 2π over one loop. Spin ½ closes as a Möbius band.
// A fiber with its own `curve(u, flow)` skips S³ and gives 3D points directly;
// with `open` it is not closed into a loop. One with `field(point, time)` takes
// its [colour, intensity] from where each sample sits (and u).
function sampleFiber(f, M, flow, N, widthScale, radius, time, out, rowBase, W) {
  const P = [], T = [];
  for (let i = 0; i <= N; i++) {
    if (f.curve) P.push(f.curve(i / N, flow));
    else P.push(i === N ? P[0] : stereo(apply4(M, fiberPoint(f, TAU * i / N + flow)), radius));
  }
  for (let i = 0; i <= N; i++) {
    const a = f.open ? P[Math.max(i - 1, 0)] : P[(i - 1 + N) % N];
    const b = f.open ? P[Math.min(i + 1, N)] : P[(i + 1) % N];
    T.push(norm(sub(b, a)));
  }
  // initial normal: anything perpendicular to T0
  const t0 = T[0];
  const seed = Math.abs(t0[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const R = [norm(sub(seed, scale(t0, dot(seed, t0))))];
  for (let i = 0; i < N; i++) {
    const v1 = sub(P[i + 1], P[i]);
    const c1 = dot(v1, v1) || 1e-12;
    const rL = sub(R[i], scale(v1, 2 / c1 * dot(v1, R[i])));
    const tL = sub(T[i], scale(v1, 2 / c1 * dot(v1, T[i])));
    const v2 = sub(T[i + 1], tL);
    const c2 = dot(v2, v2);
    R.push(c2 < 1e-12 ? rL : norm(sub(rL, scale(v2, 2 / c2 * dot(v2, rL)))));
  }
  const mismatch = f.open ? 0 : Math.atan2(dot(cross(R[N], R[0]), T[0]), dot(R[N], R[0]));
  const flat = f.flat ?? 0.22;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const twist = mismatch * u + f.spin * TAU * u + (f.twistPhase || 0);
    const r = norm(spinAbout(R[i], T[i], twist));
    const b = cross(T[i], r);
    const lit = f.field && f.field(P[i], time, u);
    const front = lit ? lit[0] : f.color(u, time);
    const back = f.back ? f.back(u, time) : front;
    const hw = f.width * widthScale * (f.taper ? f.taper(u) : 1);
    const I = lit ? lit[1] : typeof f.intensity === 'function' ? f.intensity(u, time) : f.intensity;
    const o = (rowBase * W + i) * 4, row = W * 4;
    out[o] = P[i][0]; out[o + 1] = P[i][1]; out[o + 2] = P[i][2]; out[o + 3] = hw;
    out[o + row] = r[0]; out[o + row + 1] = r[1]; out[o + row + 2] = r[2]; out[o + row + 3] = flat;
    out[o + 2 * row] = b[0]; out[o + 2 * row + 1] = b[1]; out[o + 2 * row + 2] = b[2]; out[o + 2 * row + 3] = f.glow ? 1 : 0;
    out[o + 3 * row] = front[0]; out[o + 3 * row + 1] = front[1]; out[o + 3 * row + 2] = front[2]; out[o + 3 * row + 3] = I;
    out[o + 4 * row] = back[0]; out[o + 4 * row + 1] = back[1]; out[o + 4 * row + 2] = back[2]; out[o + 4 * row + 3] = 0;
  }
  return P;
}

// --- colour helpers (authored in sRGB, rendered in linear) ---
const lin = c => Math.pow(c / 255, 2.2);
const rgb = (r, g, b) => [lin(r), lin(g), lin(b)];
function cyclic(stops) {
  return u => {
    const x = (((u % 1) + 1) % 1) * stops.length;
    const i = Math.floor(x), f = x - i;
    const a = stops[i], b = stops[(i + 1) % stops.length];
    const s = f * f * (3 - 2 * f);
    return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
  };
}
function hsl(h, s, l) {
  const k = n => (n + h * 12) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [Math.pow(f(0), 2.2), Math.pow(f(8), 2.2), Math.pow(f(4), 2.2)];
}
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// The tunable look of the nucleons, atoms and electron, shared by every view
// and read live each frame (/atom-lab.html edits it). Changing the ones marked
// "rebuild" needs a new HopfView.
export const LOOK = {
  // defaults: the author's Atom Lab look (2026-10-29); particles may override
  // some of them with their own style (and camera and light with viewOpts)
  probe: 0,                          // probe resolution for nuclei inside atoms, 0 coarse … 1 fine
  protonFringe: 4, neutronFringe: 0,
  protonBall: 0.056, neutronBall: 0.043,
  neutronGrey: 0.46,                 // how far the neutron's R, G and B are washed toward grey
  quarks: 1.65,
  nucleusGain: 5.3,                  // nuclei inside atoms, against the electron's glow
  logScale: true,                    // rebuild
  nucleusShare: 0.39,                // rebuild: share of the radius the nucleus region gets on the log scale
  linearNucleus: 0.18,               // rebuild: its radius at linear scale (really ~10⁻⁵)
  rings: 0,
  cloudFibers: 180,                  // rebuild
  cloudGain: 2.75, cloudContrast: 1.15, cloudWidth: 0.005,
  dashes: 12, dashLength: 1, dashSpeed: 3,  // dashLength: lit share of each dash's stretch, 1 = whole circle
  spin: 0.6,                         // how fast the cloud's circles turn about the axis
  plusColor: '#46dcff', minusColor: '#9a5aff', coreColor: '#f0e6ff', hColor: '#006eff',  // hColor: hydrogen's electrons in a molecule
  orbital: '1s',                     // rebuild: hydrogen and deuterium's orbital
  showNucleus: true, showCloud: true,
  electronGain: 2.15,                // the electron's own woven torus
  electronCircles: 54,               // rebuild
  electronTorus: 0.785,              // rebuild: η of its torus, small = thin ring, π/4 = the round one
  electronWidth: 1,
  electronCustom: false, electronColorA: '#46dcff', electronColorB: '#6e5aff',
  electronDashes: false,             // light it in the cloud's dashes
};
// Atom Lab sets ignoreStyle so its sliders reach every particle, overrides or not
export const LAB = { ignoreStyle: false };
const styled = style => k => (LAB.ignoreStyle ? undefined : style?.[k]) ?? LOOK[k];
// camera and light the author picked: up close (the lone electron, the proton's sea)
// and for atoms; a view's opts take them unless the caller sets opts.own
const CLOSE_LIGHT = { bloom: 1.65, exposure: 1.55, width: 2.7, core: 1.3 };
const ATOM_LIGHT = { bloom: 1, exposure: 1.1, width: 0.55, core: 0.75 };
// the cloud's dash pattern along a line: lit share LOOK.dashLength of each of
// LOOK.dashes stretches, sliding at LOOK.dashSpeed; soft ends
function dashAt(u, t, tone, L = k => LOOK[k]) {
  const n = L('dashes'), len = L('dashLength');
  if (!n || len >= 1) return 1;
  const ph = n * u + tone - L('dashSpeed') * t / TAU, d = Math.abs(ph - Math.round(ph));
  return 1 - smooth(len / 2 - Math.min(len / 2, 0.06), len / 2 + 0.02, d);
}
const hexLin = h => rgb(parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16));

const RED = rgb(255, 70, 60), GREEN = rgb(60, 255, 120), BLUE = rgb(70, 130, 255);
const CYAN = rgb(60, 235, 255), MAGENTA = rgb(255, 70, 230), YELLOW = rgb(255, 225, 60);
const GOLD = rgb(255, 185, 60), STEEL = rgb(100, 145, 235), PALE = rgb(230, 235, 255);

// =============================================================
// Particle families
// =============================================================
const GEN_WORD = ['', 'generation 1', 'generation 2', 'generation 3'];

// Quarks: q = 3 always. Up-type winds the axis +2 (charge +⅔, trefoil);
// down-type −1 (charge −⅓, a 3-lobed coil). Generation g = g parallel strands
// on nested tori. Colour charge cycles R → G → B along each strand.
const QUARK_ETAS = { 1: [0.55], 2: [0.44, 0.68], 3: [0.34, 0.54, 0.74] };
function quark(id, name, current, upType, gen) {
  const p = upType ? 2 : -1;
  const charge = cyclic([RED, GREEN, BLUE]);
  return {
    id, name, current, family: 'Quarks',
    sub: `${upType ? 'Up' : 'Down'}-type quark, ${GEN_WORD[gen]}`,
    chips: [['Spin', '½ · Möbius'], ['Charge', upType ? '+⅔ · (2,3) trefoil' : '−⅓ · (−1,3) coil'],
      ['Generation', `${gen} strand${gen > 1 ? 's' : ''}`], ['Colour', 'R→G→B along strand']],
    why: upType
      ? 'Up-type quarks wind the axis +2 times for every 3 times around the tube: charge +2/3, the trefoil knot.'
      : 'Down-type quarks wind the axis −1 time for every 3 times around the tube: charge −1/3, an unknotted 3-lobed coil turning against the up-type direction.',
    N: 420,
    view: [],
    drift: [[0, 3, 0.07, 0.21], [1, 3, 0.06, 0.29]],
    pitch: 1.1,
    fibers() {
      const etas = QUARK_ETAS[gen];
      return etas.map((eta, k) => ({
        eta, xi1: 0, xi2: TAU * k / (3 * gen), p, q: 3, spin: 0.5,
        width: [0, 0.17, 0.12, 0.095][gen], intensity: 1.7,
        color: u => charge(u + k / gen),
      }));
    },
  };
}

// Leptons: charged ones are (1,−1) fibers, every pair linked once; neutrinos
// are (0,1) meridians, linked with nothing. Generation g = g nested tori.
// Drawn as silk: dozens of hair-thin fibers blended additively, so each torus
// reads as a translucent woven shell and inner generations glow through.
// Neutrinos only flicker into view through a moving slice of a 5th dimension.
const LEPTON_SHELLS = { 1: [[0.785, 54]], 2: [[0.42, 30], [0.785, 54]], 3: [[0.26, 20], [0.5, 34], [0.785, 54]] };
// innermost shell first: heavier generations add hotter, whiter cores
const SHELL_PAL = [
  cyclic([rgb(70, 220, 255), rgb(40, 110, 255), rgb(110, 90, 255), rgb(40, 160, 255)]),
  cyclic([rgb(150, 200, 255), rgb(170, 140, 255), rgb(120, 180, 255)]),
  cyclic([rgb(230, 240, 255), rgb(200, 220, 255), rgb(230, 210, 255)]),
];
function lepton(id, name, current, gen, neutrino) {
  return {
    id, name, current, family: 'Leptons',
    sub: `${neutrino ? 'Neutrino' : 'Charged lepton'}, ${GEN_WORD[gen]}`,
    chips: neutrino
      ? [['Spin', '½'], ['Charge', '0 · (0,1) unlinked rings'], ['Generation', `${gen} nested tor${gen > 1 ? 'i' : 'us'}`], ['Weak only', '5D slice']]
      : [['Spin', '½'], ['Charge', '−1 · (1,−1) linked circles'], ['Generation', `${gen} nested tor${gen > 1 ? 'i' : 'us'}`], ['Texture', 'silk']],
    why: neutrino
      ? 'Zero charge: meridian rings that thread the torus but link nothing. Like the spirograph\'s 5th dimension, a slice sweeps through them; outside it they are almost fully transparent, a particle that barely interacts.'
      : 'Charge −1: anti-Hopf circles (p = −1, q = 1), every pair linked once, so many of them weave a translucent torus. Each generation adds a smaller, hotter torus nested inside.',
    N: 160,
    additive: true,
    depthMin: 0.4,
    view: [[0, 3, 0.08]],
    drift: [[0, 3, 0.16, 0.23], [1, 3, 0.14, 0.31]],
    pitch: neutrino ? 0.8 : 0.6,
    fibers() {
      const out = [];
      const shells = LEPTON_SHELLS[gen];
      // the electron alone also takes LOOK's electron settings
      const own = id === 'electron';
      shells.forEach(([eta0, n0], si) => {
        const eta = own ? LOOK.electronTorus : eta0, n = own ? LOOK.electronCircles : n0;
        const pal = SHELL_PAL[shells.length - 1 - si];
        const m = neutrino ? Math.round(n * 0.6) : n;
        for (let k = 0; k < m; k++) {
          const xi1 = TAU * k / m, c = pal(k / m), tone = hash(k, 5);
          const custom = () => mixc(hexColor(LOOK.electronColorA), hexColor(LOOK.electronColorB), 0.5 - 0.5 * Math.cos(TAU * k / m));
          out.push(neutrino ? {
            eta, xi1, xi2: 0, p: 0, q: 1, spin: 0.5, flat: 1, width: 0.012,
            intensity: (u, t) => 0.003 + 1.4 * smooth(0.62, 0.97, 0.7 * Math.cos(xi1 - 0.45 * t + 2 * si) + 0.3 * Math.cos(TAU * u + 0.9 * t)),
            color: () => c,
          } : {
            eta, xi1, xi2: 0, p: 1, q: -1, spin: 0.5, flat: 1,
            get width() { return 0.0075 * (own ? LOOK.electronWidth : 1); },
            intensity: (u, t) => (own ? LOOK.electronGain : 1) * (si === shells.length - 1 ? 0.32 : 0.75) * (own && LOOK.electronDashes ? dashAt(u, t, tone) : 1),
            color: () => own && LOOK.electronCustom ? custom() : c,
          });
        }
      });
      return out;
    },
  };
}

// Composites, each in three gluon-field treatments to compare:
//   shortest — flux tubes where they are shortest (lattice-QCD energy minimum)
//   spread   — tubes pinned to quark points 120° apart, a tied-together look
//   mass     — brightness ∝ log(energy): the field carries ~99% of the mass,
//              so it outshines the quarks, drawn as tubes as fat as they are long
// Energies in MeV. Log brightness: log10(E / 0.1 MeV), relative to the field.
const logE = E => Math.log10(E / 0.1);
const COMPOSITE_KINDS = {
  proton: {
    name: 'Proton (uud)', sub: 'Baryon: three bound quarks', current: '/content/icons/proton.webp',
    mass: 938.3, quarkMasses: [2.16, 2.16, 4.7], flux: 'Y',
    chips: [['Spin', '½'], ['Charge', '⅔ + ⅔ − ⅓ = +1'], ['Quarks', 'two (2,3) + one (−1,3)']],
    why: 'Two up trefoils and one down coil, linked, each carrying one colour charge. Lattice QCD finds the gluon field between three quarks squeezed into three flux tubes meeting in a Y.',
    fibers: () => [
      // (2,3) fibers at the same η repeat every 2π/3 in ξ1, so π/3 is as far apart as two ups can sit
      { eta: 0.6, xi1: 0, xi2: 0, p: 2, q: 3, spin: 0.5, width: 0.11, intensity: 1.6, color: () => RED },
      { eta: 0.6, xi1: Math.PI / 3, xi2: 0, p: 2, q: 3, spin: 0.5, width: 0.11, intensity: 1.6, color: () => GREEN },
      { eta: 0.32, xi1: 0, xi2: Math.PI / 3, p: -1, q: 3, spin: 0.5, width: 0.11, intensity: 1.6, color: () => BLUE },
    ],
  },
  meson: {
    name: 'Meson (π⁺ = u d̄)', sub: 'A quark bound to an antiquark', current: '/content/icons/meson.webp',
    mass: 139.6, quarkMasses: [2.16, 4.7], flux: 'pair',
    chips: [['Spin', '½ + ½ opposed → 0'], ['Charge', '⅔ + ⅓ = +1'], ['Pair', '(2,3) + mirror (1,3)']],
    why: 'An up trefoil linked with an anti-down, the down\'s (−1,3) coil mirrored into (1,3). Red and antired (cyan): colourless together. Between them one gluon flux tube, the original "string" of string theory.',
    fibers: () => [
      { eta: 0.6, xi1: 0, xi2: 0, p: 2, q: 3, spin: 0.5, width: 0.13, intensity: 1.6, color: () => RED },
      { eta: 0.33, xi1: 0, xi2: Math.PI / 3, p: 1, q: 3, spin: 0.5, width: 0.13, intensity: 1.6, color: () => CYAN },
    ],
  },
};
const COMPOSITE_VARIANTS = {
  shortest: {
    label: 'shortest string', anchor: 'shortest', widthOfLength: 0, width: 0.2, intensity: 1.4,
    chip: ['Gluons', 'flux tubes at minimum length'],
    note: ' Here the tubes sit where they are shortest, which is where the linked loops already nearly touch, so they almost vanish inside the quarks.',
  },
  spread: {
    label: 'spread anchors', anchor: 'spread', widthOfLength: 0.14, intensity: 1.1,
    chip: ['Gluons', 'Y pinned 120° apart'],
    note: ' Here the tubes are pinned to the outermost point of each quark, 120° apart around the symmetry axis: an artistic choice of anchor, so the binding reads as ties.',
  },
  mass: {
    label: 'mass-honest', anchor: 'spread', widthOfLength: 0.5, intensity: 1.0, logBrightness: true,
    chip: ['Brightness', '∝ log(energy)'],
    note: ' Here brightness is log(energy): the quarks\' own masses are about 1% of the total, the rest is gluon-field energy, so the field outshines the quarks. Real tubes are about as thick as they are long, so the Y swells into a glow.',
  },
};
const COMPOSITES = [];
for (const [kind, K] of Object.entries(COMPOSITE_KINDS)) {
  for (const [vid, V] of Object.entries(COMPOSITE_VARIANTS)) {
    const fieldE = K.mass - K.quarkMasses.reduce((a, b) => a + b, 0);
    COMPOSITES.push({
      id: vid === 'shortest' ? kind : `${kind}-${vid}`,
      name: `${K.name} · ${V.label}`, sub: K.sub, current: K.current, family: 'Composites',
      chips: [...K.chips, V.chip],
      why: K.why + V.note,
      N: 420,
      view: [],
      drift: [[0, 3, 0.07, 0.2], [1, 3, 0.06, 0.26]],
      pitch: 1.1,
      flux: { type: K.flux, anchor: V.anchor, width: V.width, widthOfLength: V.widthOfLength, intensity: V.intensity },
      fibers() {
        const f = K.fibers();
        // log brightness: each quark against the field it sits in
        if (V.logBrightness) f.forEach((q, i) => { q.intensity *= logE(K.quarkMasses[i]) / logE(fieldE); });
        return f;
      },
    });
  }
}

// The proton as it looks at the resolution you probe it with. Colour charge
// can't be pinned to a place (it isn't gauge-invariant), so nothing here keeps
// a fixed colour: the three valence quarks pass colour between them through
// gluons and stay one red, one green, one blue at every instant.
//   low  — a fuzzy, colourless ball, ~0.84 fm across in charge; the R, G and B
//          light sum to white, with fringes where the fluctuations show
//   mid  — three point-like quarks racing around, tied by a flux-tube Y
//          (drawn mass-honest: the field holds ~99% of the energy)
//   high — the sea: gluons and quark–antiquark pairs that blink in and out,
//          more of them the finer you look
// The slider is a log scale of probe resolution, roughly 0.1 → 100 GeV.
const hash = (i, j) => { const x = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return x - Math.floor(x); };
const PURE = [rgb(255, 45, 40), rgb(45, 255, 50), rgb(50, 70, 255)];
const ANTI = [CYAN, MAGENTA, YELLOW];
function torusKnot(p, q, s, u) {
  const a = p * TAU * u, b = q * TAU * u, w = 1 + 0.45 * Math.cos(b);
  return [s * w * Math.cos(a), s * 0.45 * Math.sin(b), s * w * Math.sin(a)];
}
const turn = (v, ay, ax) => {
  const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
  const x = v[0] * cy + v[2] * sy, z = -v[0] * sy + v[2] * cy;
  return [x, v[1] * cx - z * sx, v[1] * sx + z * cx];
};
const addv = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mixc = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

// The coloured fringes stand for electric charge: the proton's +1 splits its
// R, G and B shells wide apart, the neutron's 0 leaves only a faint, muted
// fringe on a dimmer grey ball. Colour charge cancels to white in both.
// make({ lite }) drops the sea and thins the ball, for nuclei of many nucleons.
const NEUTRAL = rgb(150, 155, 165);
const nucleonScale = (id, name, current, QUARKS, neutral = false) => ({
  id, name, family: 'Composites',
  sub: 'What a nucleon looks like depends on how finely you probe it',
  current,
  chips: [['Low', 'fuzzy colourless ball'], ['Mid', '3 quarks + flux-tube Y'], ['High', 'gluon & quark sea'], ['Colour', 'swapped, never located']],
  why: (neutral
    ? 'Drag the slider from coarse to fine. The neutron is drawn grey: it has no electric charge (+⅔ − ⅓ − ⅓ = 0), where the proton\'s +1 is drawn as coloured fringes. Look closer'
    : 'Drag the slider from coarse to fine. Seen coarsely the proton is one fuzzy ball with no colour: red, green and blue light add to white, fringing where the colour field fluctuates. Look closer')
    + ' and three point-like quarks resolve, racing around inside a gluon field that holds about 99% of the mass. Each flash between two quarks is a gluon swapping their colours, so there is always one of each but never a fixed red one. Finest of all, the nucleon is mostly a fizzing sea of gluons and quark–antiquark pairs.',
  N: 220, pitch: 0.35, view: [], drift: [],
  additive: false, frame: { center: [0, 0, 0], radius: 1.05 },
  resolution: 0.5,
  make({ lite = false, L = styled(this.style) } = {}) {
    const st = { t: 0, lo: 1, mid: 0, hi: 0, ab: 0, perm: [0, 1, 2], swap: null, k: -1, Q: [], J: [0, 0, 0] };
    const fibers = [];
    // valence quarks: up (2,3) trefoils and down (−1,3) coils, drawn as tiny symbols
    const qColor = k => PURE[st.perm[k]];
    QUARKS.forEach(([p, q], k) => fibers.push({
      p, q, spin: 0.5, width: 0.028, intensity: () => 1.5 * L('quarks') * st.mid, taper: () => st.qv,
      curve: u => addv(st.Q[k] || [0, 0, 0], turn(torusKnot(p, q, 0.075 * st.qs * st.qv, u), st.t * (1.3 + 0.4 * k) + k * 2, st.t * (0.9 + 0.3 * k) + k)),
      color: () => qColor(k),
    }));
    const solidCount = fibers.length;
    // flux-tube Y from each quark to the Fermat point, as fat as it is long
    for (let k = 0; k < 3; k++) fibers.push({
      open: true, glow: true, spin: 0, flat: 1, width: 0,
      intensity: () => 0.9 * st.mid,
      taper: u => Math.pow(Math.sin(Math.PI * u), 0.3),
      curve: u => mixc(st.Q[k] || [0, 0, 0], st.J, u),
      color: () => neutral ? mixc(qColor(k), NEUTRAL, 0.85 * L('neutronGrey')) : qColor(k),
      leg: true,
    });
    // the gluon that carries a colour swap: a quick wavy flash between two quarks
    fibers.push({
      open: true, glow: true, spin: 0, flat: 1, width: 0.035,
      intensity: () => st.swap ? 2.2 * st.mid * Math.sin(Math.PI * st.swap.f) ** 2 : 0,
      taper: u => Math.pow(Math.sin(Math.PI * u), 0.5),
      curve: u => {
        if (!st.swap) return [0, 0, 0];
        const [a, b] = st.swap.pair.map(i => st.Q[i]);
        const d = sub(b, a), n = norm(cross(d, [0.3, 1, 0.2]));
        return addv(mixc(a, b, u), scale(n, 0.035 * Math.sin(8 * TAU * u - 30 * st.t)));
      },
      color: u => st.swap ? mixc(PURE[st.perm[st.swap.pair[0]]], ANTI[st.perm[st.swap.pair[1]]], u) : PALE,
    });
    // low resolution: shells of rings in pure R, G and B that add to white;
    // each colour's shell is nudged and breathes on its own, so the edge fringes
    const RINGS = lite ? [[0.45, 3], [0.88, 4]] : [[0.28, 5], [0.52, 7], [0.76, 9], [0.98, 11]];
    for (let c = 0; c < 3; c++) RINGS.forEach(([rho, n], si) => {
      for (let j = 0; j < n; j++) {
        const ay = TAU * hash(c * 7 + si, j), ax = Math.acos(2 * hash(j, c * 13 + si) - 1);
        fibers.push({
          glow: true, open: false, spin: 0, flat: 1, width: 0.11 + 0.07 * rho,
          intensity: () => L(neutral ? 'neutronBall' : 'protonBall') * (lite ? 2 : 1) * st.lo * (1.25 - 0.55 * rho),
          curve: u => {
            const r = rho * (1 + st.ab * (c - 1) * 0.6 + 0.03 * st.ab * 4 * Math.sin(st.t * (1.1 + 0.3 * c) + j));
            const off = scale([Math.cos(st.t * 0.7 + c * TAU / 3), 0.4 * Math.sin(st.t * 0.9 + c), Math.sin(st.t * 0.7 + c * TAU / 3)], st.ab * 0.5);
            return addv(off, turn([r * Math.cos(TAU * u), 0, r * Math.sin(TAU * u)], ay + 0.05 * st.t, ax));
          },
          color: () => neutral ? mixc(PURE[c], NEUTRAL, L('neutronGrey')) : PURE[c],
        });
      }
    });
    // high resolution: the sea. Gluons are small 8-fold wobbling loops in a
    // colour–anticolour pair; quark–antiquark pairs are two tiny rings that
    // pop out of the vacuum, fly apart and annihilate.
    const SEA = lite ? 0 : 72;
    const sea = [];
    for (let i = 0; i < SEA; i++) {
      const gluon = i % 3 !== 2;
      const item = { i, gluon, period: 1.2 + 1.6 * hash(i, 99), phase: hash(i, 7), env: 0, pos: [0, 0, 0], dir: [1, 0, 0], c: 0, c2: 1, ay: 0, ax: 0 };
      sea.push(item);
      const show = () => item.env * st.hi * smooth(i / SEA - 0.15, i / SEA + 0.02, st.hi);
      if (gluon) fibers.push({
        glow: true, open: false, spin: 0, flat: 1, width: 0.012,
        intensity: () => 1.6 * show(),
        curve: u => {
          const r = 0.042 * (0.6 + 0.4 * item.env) * (1 + 0.25 * Math.cos(8 * TAU * u + 6 * st.t));
          return addv(item.pos, turn([r * Math.cos(TAU * u), 0.02 * Math.sin(8 * TAU * u), r * Math.sin(TAU * u)], item.ay, item.ax));
        },
        color: u => mixc(PURE[item.c], ANTI[item.c2], 0.5 + 0.5 * Math.cos(8 * TAU * u)),
      });
      else for (const side of [1, -1]) fibers.push({
        glow: true, open: false, spin: 0, flat: 1, width: 0.014,
        intensity: () => 2.2 * show(),
        curve: u => {
          const sep = 0.1 * Math.sin(Math.PI * item.f);
          return addv(addv(item.pos, scale(item.dir, side * sep)), turn([0.028 * Math.cos(TAU * u), 0, 0.028 * Math.sin(TAU * u)], item.ay, item.ax));
        },
        color: () => side > 0 ? PURE[item.c] : ANTI[item.c],
      });
    }

    const step = (t, res) => {
      st.t = t;
      st.lo = 0.12 + 0.88 * (1 - smooth(0.12, 0.42, res)); // the ball never quite goes: the quarks stay inside it
      st.mid = smooth(0.12, 0.42, res) * (1 - 0.55 * smooth(0.62, 0.95, res));
      st.hi = smooth(0.5, 0.92, res);
      st.ab = L(neutral ? 'neutronFringe' : 'protonFringe') * (0.05 + 0.1 * smooth(0.05, 0.35, res));
      st.qv = smooth(0.02, 0.25, st.mid);
      st.qs = 1 - 0.35 * smooth(0.6, 1, res); // finer probes, smaller quarks: still unresolved points
      // quarks: fast, tangled orbits around 120°-spaced homes in a slowly turning triangle
      st.Q = [0, 1, 2].map(k => {
        const a = TAU * k / 3 + 0.25 * t;
        const home = [0.36 * Math.cos(a), 0.08 * Math.sin(0.8 * t + k), 0.36 * Math.sin(a)];
        return addv(home, [0.16 * Math.sin(2.3 * t + 2 * k), 0.2 * Math.sin(1.9 * t + 4 * k + 1), 0.16 * Math.cos(2.7 * t + 3 * k)]);
      });
      st.J = fermatPoint(st.Q, scale(st.Q.reduce(addv), 1 / 3));
      const meanLeg = st.Q.reduce((s, q) => s + Math.hypot(...sub(q, st.J)), 0) / 3;
      for (const f of fibers) if (f.leg) f.width = 0.5 * meanLeg;
      // colour swaps: every 1.3 s a gluon passes between two quarks and they trade colours at its peak
      const PER = 1.3, DUR = 0.45, k = Math.floor(t / PER), f = (t - k * PER) / DUR;
      while (st.k < k) {
        st.k++;
        const pair = [[0, 1], [1, 2], [0, 2]][Math.floor(hash(st.k, 3) * 3)];
        st.pending = pair;
      }
      if (f < 1 && st.pending) {
        if (!st.swap || st.swap.k !== k) st.swap = { k, pair: st.pending, f, done: false };
        st.swap.f = f;
        if (f > 0.5 && !st.swap.done) {
          const [a, b] = st.swap.pair;
          [st.perm[a], st.perm[b]] = [st.perm[b], st.perm[a]];
          st.swap.done = true;
        }
      } else st.swap = null;
      // sea: each fluctuation lives one period, then reappears somewhere new
      for (const it of sea) {
        const x = t / it.period + it.phase, cyc = Math.floor(x);
        it.f = x - cyc;
        it.env = Math.sin(Math.PI * it.f) ** 2;
        if (it.cyc !== cyc) {
          it.cyc = cyc;
          const r = 0.92 * Math.cbrt(hash(it.i, cyc)), th = Math.acos(2 * hash(cyc, it.i + 5) - 1), ph = TAU * hash(it.i + 11, cyc);
          it.pos = [r * Math.sin(th) * Math.cos(ph), r * Math.cos(th), r * Math.sin(th) * Math.sin(ph)];
          it.dir = norm([hash(it.i, cyc + 1) - 0.5, hash(it.i + 2, cyc) - 0.5, hash(cyc, it.i + 3) - 0.5]);
          it.c = Math.floor(3 * hash(it.i + 4, cyc));
          it.c2 = (it.c + 1 + Math.floor(2 * hash(cyc + 4, it.i))) % 3;
          it.ay = TAU * hash(it.i, cyc + 9); it.ax = TAU * hash(cyc + 9, it.i);
        }
      }
    };
    return { fibers, solidCount, step };
  },
});
// on their own: the proton opens on its finest probe (the sea, up close), the
// neutron on its coarsest; inside atoms both take the atom's look
const PROTON_SCALE = { ...nucleonScale('proton-scale', 'Proton · by resolution', '/content/icons/proton.webp', [[2, 3], [2, 3], [-1, 3]]),
  resolution: 1, style: { protonBall: 0.036, quarks: 0.75 }, viewOpts: CLOSE_LIGHT };
const NEUTRON_SCALE = { ...nucleonScale('neutron-scale', 'Neutron · by resolution', '/content/icons/neutron.webp', [[2, 3], [-1, 3], [-1, 3]], true),
  resolution: 0, viewOpts: ATOM_LIGHT };

// Atoms and molecules: nuclei (the nucleon pictures above, shrunk) inside the
// electrons' cloud. The cloud is woven from the electron's own (1,−1) Hopf
// circles, the ones its torus is made of: each circle through the ball is lit
// by the electron density where it passes, so the true orbital shapes (lobes,
// nodes) are carved out of the fibration. The circles turn slowly about the
// vertical axis, so light streams through a cloud that itself stays still.
// Hydrogen orbitals ψ_nlm in real form, r in Bohr radii, z the vertical axis.
function laguerre(k, a, x) {
  if (k === 0) return 1;
  let L0 = 1, L1 = 1 + a - x;
  for (let i = 1; i < k; i++) [L0, L1] = [L1, ((2 * i + 1 + a - x) * L1 - (i + a) * L0) / (i + 1)];
  return L1;
}
function legendre(l, m, x) {
  let pmm = 1;
  const s = Math.sqrt(Math.max(0, 1 - x * x));
  for (let i = 1; i <= m; i++) pmm *= (2 * i - 1) * s;
  if (l === m) return pmm;
  let pm1 = x * (2 * m + 1) * pmm;
  for (let ll = m + 2; ll <= l; ll++) [pmm, pm1] = [pm1, ((2 * ll - 1) * x * pm1 - (ll + m - 1) * pmm) / (ll - m)];
  return pm1;
}
const orbital = (n, l, m) => (x, y, z) => {
  const r = Math.hypot(x, y, z), rho = 2 * r / n;
  const ang = legendre(l, Math.abs(m), r ? z / r : 1) * (m > 0 ? Math.cos(m * Math.atan2(y, x)) : m < 0 ? Math.sin(-m * Math.atan2(y, x)) : 1);
  return rho ** l * Math.exp(-rho / 2) * laguerre(n - l - 1, 2 * l + 1, rho) * ang;
};
// radius holding 99% of the electron, from the radial distribution r²R²
function orbitalExtent(n, l) {
  const R = orbital(n, l, 0), dr = 0.02, P = [];
  let tot = 0;
  for (let r = dr; r < 12 * n * n; r += dr) { const v = r * R(0, 0, r); tot += v * v; P.push(tot); }
  return dr * (P.findIndex(v => v > 0.99 * tot) + 1);
}
// ∫|ψ|² over all space, so orbitals of different atoms and shells add up right
function orbitalNorm(n, l, m) {
  const R = orbital(n, l, 0), dr = 0.005 * n;
  let I = 0;
  for (let r = dr / 2; r < 14 * n * n; r += dr) { const v = r * R(0, 0, r); I += v * v * dr; }
  let f = 1;
  for (let i = l - Math.abs(m) + 1; i <= l + Math.abs(m); i++) f *= i;
  return I * (m === 0 ? TAU : Math.PI) * 2 / (2 * l + 1) * f;
}
export const ORBITALS = { '1s': [1, 0, 0], '2s': [2, 0, 0], '2p': [2, 1, 0], '3s': [3, 0, 0], '3p': [3, 1, 0], '3d z²': [3, 2, 0], '3d xz': [3, 2, 1], '4f z³': [4, 3, 0] };

const BOHR_FM = 52917.7;
// Electrons as hydrogen-like orbitals { n, l, m, Z (effective charge), occ,
// core, h (a hydrogen's, in a molecule), at (centre, fm) }. Returns, for a
// point in fm: ψ (meaningful when there is one orbital), the density per a0³,
// and the shares of it in core shells and in hydrogens' electrons.
function cloudOf(electrons) {
  const terms = electrons.map(e => ({ ...e, psi: orbital(e.n, e.l, e.m), k: e.occ * e.Z ** 3 / orbitalNorm(e.n, e.l, e.m), at: e.at || [0, 0, 0] }));
  return P => {
    let rho = 0, core = 0, h = 0, v = 0;
    for (const t of terms) {
      const s = t.Z / BOHR_FM;
      v = t.psi((P[0] - t.at[0]) * s, (P[2] - t.at[2]) * s, (P[1] - t.at[1]) * s);
      const d = t.k * v * v;
      rho += d;
      if (t.core) core += d;
      if (t.h) h += d;
    }
    return [v, rho, rho ? core / rho : 0, rho ? h / rho : 0];
  };
}

// Distances are drawn on a log scale, one ruler shared by every atom, so the
// nucleus (femtometres) and the orbital (a tenth of a nanometre) both show and
// their sizes stay honest. Inside the nucleus region, out to NUCLEUS_FM (room
// for oxygen-16), the scale is linear, so a proton is the same size in every
// atom; beyond it, pure log, every power of ten the same width out to the 4f
// orbital's edge. Where a log ruler starts is a free choice: LOOK.nucleusShare
// is the share of the picture's radius given to the nucleus region. Faint
// rings in the equatorial plane mark each power of ten.
const NUCLEON_FM = 0.84, NUCLEUS_FM = 3.6;
const LOG_RMAX = orbitalExtent(4, 3) * BOHR_FM, LOG_SPAN = Math.log10(LOG_RMAX / NUCLEUS_FM);
// span: decades from the nucleus region's edge to the ball's edge (a molecule's
// atoms each get their own ball, edged at their van der Waals radius)
const toLog = (r, sh, span = LOG_SPAN) => r < NUCLEUS_FM ? sh * r / NUCLEUS_FM : sh + (1 - sh) * Math.log10(r / NUCLEUS_FM) / span;
const fromLog = (x, sh, span = LOG_SPAN) => x < sh ? NUCLEUS_FM * x / sh : NUCLEUS_FM * 10 ** ((x - sh) / (1 - sh) * span);
// real distance per unit of picture distance
const logStretch = (x, sh, span = LOG_SPAN) => x < sh ? NUCLEUS_FM / sh : fromLog(x, sh, span) * Math.LN10 * span / (1 - sh);
const DECADES = [[1, '1 fm'], [10, '10 fm'], [100, '100 fm'], [1e3, '1 pm'], [1e4, '10 pm'], [1e5, '100 pm'], [1e6, '1 nm']];
const colorMemo = new Map();
const hexColor = h => { if (!colorMemo.has(h)) colorMemo.set(h, hexLin(h)); return colorMemo.get(h); };

// nuclei: [[particle, [x, y, z] fm], ...]; electrons as cloudOf takes them, or
// a function returning them; extentA0: the cloud's radius in Bohr radii at
// linear scale. style overrides LOOK for this atom. balls (a molecule, on the
// log scale): one log ball per atom, { at (picture), R (picture radius),
// edgeFm, nuclei, electrons } with nuclei and electrons about the atom's own
// centre; it replaces the single ball about the origin.
function atom({ id, name, sub, why, chips = [], nuclei, electrons, extentA0, balls, current, style = {} }) {
  const L = styled(style);
  const ballsOf = els => balls || [{ at: [0, 0, 0], R: 1, edgeFm: LOG_RMAX, nuclei, electrons: els }];
  return {
    id, name, sub, current, family: 'Atoms', chips, why, viewOpts: ATOM_LIGHT,
    N: 80, pitch: 0.6, view: [], drift: [],
    additive: false, frame: { center: [0, 0, 0], radius: 1.05 },
    // [label (the first ball's only), radius, centre] for each ring
    get ticks() {
      if (!L('logScale')) return [];
      const all = ballsOf(), Rmax = Math.max(...all.map(b => b.R));
      return all.flatMap((b, i) => DECADES.filter(([fm]) => fm < b.edgeFm)
        .map(([fm, label]) => [i ? null : label, b.R * toLog(fm, L('nucleusShare') * Rmax / b.R, Math.log10(b.edgeFm / NUCLEUS_FM)), b.at]));
    },
    make() {
      const logScale = L('logScale'), sh = L('nucleusShare');
      const els = typeof electrons === 'function' ? electrons(L) : electrons;
      const cloud = cloudOf(els), phase = els.length === 1 && !balls;
      const E = (typeof extentA0 === 'function' ? extentA0(L) : extentA0) * BOHR_FM;
      // log scale: each ball's nucleus region drawn linear, the rest of it log
      // about its own nucleus. Linear: the nucleus region exaggerated, the rest true.
      // every ball's nucleus region the same size on screen, so a proton is the
      // same size in every atom; the log part fills the rest of each ball
      const Rmax = Math.max(...ballsOf(els).map(b => b.R));
      const B = ballsOf(els).map(b => ({ ...b, sh: sh * Rmax / b.R, span: Math.log10(b.edgeFm / NUCLEUS_FM), cloud: cloudOf(b.electrons), peak: 1 }));
      const perFm = (logScale ? sh : L('linearNucleus')) / NUCLEUS_FM;
      const placeIn = (b, p) => {
        const r = Math.hypot(...p);
        return addv(b.at, r < NUCLEUS_FM ? scale(p, perFm * b.R * b.sh / sh) : scale(p, b.R * toLog(r, b.sh, b.span) / r));
      };
      const placeLinear = p => Math.hypot(...p) < NUCLEUS_FM ? scale(p, perFm) : scale(p, 1 / E);
      const list = logScale ? B.flatMap(b => b.nuclei.map(([P, pos]) => [P, pos, b])) : nuclei.map(([P, pos]) => [P, pos, null]);
      const place = (p, b) => b ? placeIn(b, p) : placeLinear(p);
      const NS = NUCLEON_FM * perFm;
      const many = list.length > 2;
      // each nucleon turned its own way, tumbling slowly: built from the same
      // seed they would otherwise be identical copies, and nothing aligns them
      // (in oxygen-16 their spins pair off and cancel)
      const nuc = list.map(([P, pos, b], k) => ({ made: P.make({ lite: many, L }), pos, b, k, off: place(pos, b), ay: 0, ax: 0, NS: NS * (b ? Rmax : 1) }));
      // nucleons in a big nucleus jostle a little
      const jiggle = (k, t) => many ? scale([Math.sin(1.3 * t + 2 * k), Math.sin(1.1 * t + 3 * k + 1), Math.sin(0.9 * t + 5 * k + 2)], 0.15) : [0, 0, 0];
      const wrap = (f, N) => Object.create(f, {
        curve: { value: u => addv(N.off, scale(turn(f.curve(u), N.ay, N.ax), N.NS)) },
        width: { get: () => f.width * N.NS },
        intensity: { value: (u, t) => (L('showNucleus') ? L('nucleusGain') : 0) * (typeof f.intensity === 'function' ? f.intensity(u, t) : f.intensity) },
      });
      const fibers = [];
      for (const N of nuc) fibers.push(...N.made.fibers.slice(0, N.made.solidCount).map(f => wrap(f, N)));
      const solidCount = fibers.length;
      for (const N of nuc) fibers.push(...N.made.fibers.slice(N.made.solidCount).map(f => wrap(f, N)));
      const density = q => {
        if (!logScale) return cloud(scale(q, E));
        // chance of finding an electron per unit of picture volume: the density
        // times how much real volume the log scale squeezes in, r² dr / (|d|² d|d|);
        // where balls overlap, their electrons add. In a molecule each atom is
        // lit against its own densest part, so a hydrogen's lone electron shows
        // beside oxygen's eight.
        let v = 0, c = 0, core = 0, h = 0;
        for (const b of B) {
          const d = [q[0] - b.at[0], q[1] - b.at[1], q[2] - b.at[2]], x = Math.hypot(...d) / b.R;  // (`sub` is the subtitle here)
          if (x >= 1 || !x) continue;
          const r = fromLog(x, b.sh, b.span), [bv, rho, bcore, bh] = b.cloud(scale(d, r / (x * b.R)));
          const w = rho * r * r * logStretch(x, b.sh, b.span) / (x * x * b.R ** 3) * (1 - smooth(0.93, 1, x)) / b.peak;
          v = bv; c += w; core += w * bcore; h += w * bh;
        }
        return [v, c, c ? core / c : 0, c ? h / c : 0];
      };
      if (logScale && B.length > 1) for (const b of B) {
        let pk = 0;
        for (let i = 1; i < 60; i++) for (let j = 0; j < 12; j++) {
          const x = i / 60, ct = 2 * (j + 0.5) / 12 - 1, r = fromLog(x, b.sh, b.span), st = Math.sqrt(1 - ct * ct);
          const rho = b.cloud([r * st, r * ct, 0])[1];
          pk = Math.max(pk, rho * r * r * logStretch(x, b.sh, b.span) / (x * x * b.R ** 3));
        }
        b.peak = pk;
      }
      // linear scale: keep the cloud off the (exaggerated) nuclei
      const nucR = logScale ? 0 : Math.max(...nuc.map(N => Math.hypot(...N.off)).filter(r => r < perFm * NUCLEUS_FM)) + NS;
      // tabulated once on a grid over the ball, then read back trilinearly.
      // Brightness is scaled to the densest point you can see: at linear scale
      // not the core electrons hidden under the drawn nucleus
      const G = 44, grid = new Float32Array(G * G * G * 4);
      let peak = 0;
      for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) for (let k = 0; k < G; k++) {
        const d = density([i, j, k].map(v => 2 * v / (G - 1) - 1)), o = ((i * G + j) * G + k) * 4;
        grid.set(d, o);
        if (logScale || Math.hypot(...[i, j, k].map(v => 2 * v / (G - 1) - 1)) > 1.1 * nucR) peak = Math.max(peak, d[1]);
      }
      const lookup = q => {
        const out = [0, 0, 0, 0], g = q.map(v => Math.min(G - 1.001, Math.max(0, (v + 1) * (G - 1) / 2)));
        const i = g[0] | 0, j = g[1] | 0, k = g[2] | 0, fi = g[0] - i, fj = g[1] - j, fk = g[2] - k;
        for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++) {
          const w = (a ? fi : 1 - fi) * (b ? fj : 1 - fj) * (c ? fk : 1 - fk), o = (((i + a) * G + j + b) * G + k + c) * 4;
          for (let e = 0; e < 4; e++) out[e] += w * grid[o + e];
        }
        return out;
      };
      // the electrons: (1,−1) circles over evenly spread base points, so they
      // fill S³ evenly. The ball r < 1 is the hemisphere w < 0, exactly half of
      // every great circle (θ from 0 to π), and the projection packs their
      // length 4/(1 + r²)² times denser toward the centre, which the brightness
      // undoes. Each circle can light up only in a few short dashes that slide along it.
      const FIBERS = L('cloudFibers');
      for (let k = 0; k < FIBERS; k++) {
        const eta = Math.acos(1 - 2 * (k + 0.5) / FIBERS) / 2, xi1 = k * Math.PI * (3 - Math.sqrt(5)), tone = hash(k, 5);
        const ce = Math.cos(eta), se = Math.sin(eta);
        fibers.push({
          open: true, spin: 0.5, flat: 1,
          get width() { return L('cloudWidth'); },
          curve: (u, flow) => {
            const th = Math.PI * u, a = xi1 + th + L('spin') * flow;
            return stereo([ce * Math.cos(a), ce * Math.sin(a), se * Math.cos(th), -se * Math.sin(th)], 1);
          },
          field: (q, t, u) => {
            if (!L('showCloud')) return [PALE, 0];
            const [v, c, core, h] = lookup(q), x = Math.hypot(...q);
            const base = phase ? hexColor(v >= 0 ? L('plusColor') : L('minusColor'))
              : mixc(mixc(hexColor(L('plusColor')), hexColor(L('coreColor')), core), hexColor(L('hColor')), h);
            const dash = dashAt(u, t, tone, L);
            const fade = logScale ? 1 : (1 - smooth(0.8, 1, x)) * smooth(0.5 * nucR, 1.1 * nucR, x);
            return [scale(base, 0.75 + 0.5 * tone), L('cloudGain') * (c / peak) ** L('cloudContrast') * dash * fade * (1 + x * x) ** 2 / 4];
          },
          color: () => PALE,
        });
      }
      // the ruler
      for (const [label, x, at] of this.ticks) fibers.push({
        glow: true, spin: 0, flat: 1, width: 0.004, intensity: () => L('rings') * (label ? 1 : 0.6),
        curve: u => addv(at, [x * Math.cos(TAU * u), 0, x * Math.sin(TAU * u)]),
        color: () => PALE,
      });
      const step = t => {
        for (const N of nuc) {
          N.made.step(t + 1.7 * N.k, L('probe'));
          N.ay = TAU * hash(N.k, 21) + 0.25 * (hash(N.k, 22) - 0.5) * t;
          N.ax = Math.acos(2 * hash(N.k, 23) - 1) + 0.2 * (hash(N.k, 24) - 0.5) * t;
          N.off = place(addv(N.pos, jiggle(N.k, t)), N.b);
        }
      };
      return { fibers, solidCount, step };
    },
  };
}

const ATOM_WHY = 'Electrons are not balls circling the nucleus: each is spread over an orbital, |ψ|², a fixed shape for each energy level (n), angular momentum (l, the letter s, p, d, f) and orientation (m). Here the cloud is woven from the electron\'s own Hopf circles, each lit by the chance of finding an electron where it passes. Distance from the centre is on a log scale, the rings marking 1 fm, 10 fm … 1 nm, so the nucleus, about 100,000 times smaller than the cloud, still shows, and every size is true on that ruler. The dark between them is honest too: the inner decades hold almost no volume, so the electrons are almost never there.';
const ORBITAL_WHY = 'An excited electron\'s orbital, woven from its own Hopf circles, each lit by |ψ|² where it passes; violet marks where ψ is negative. Drawn to linear scale so the shape shows (the log ruler of the hydrogen picture flattens it onto a shell), and every orbital at the same size: really they grow as n², so 3d is about 9× the 1s.';
const H_ELECTRON = L => { const [n, l, m] = ORBITALS[L('orbital')] || ORBITALS['1s']; return [{ n, l, m, Z: 1, occ: 1 }]; };
const H_EXTENT = L => { const [n, l] = ORBITALS[L('orbital')] || ORBITALS['1s']; return orbitalExtent(n, l); };
// oxygen's 8 electrons, 1s² 2s² 2p⁴, with Slater's effective charges; the four
// 2p electrons spread evenly over px, py and pz (the spherical average)
const O_ZEFF_1S = 7.7, O_ZEFF_2 = 4.55;
const oxygenElectrons = (at = [0, 0, 0]) => [
  { n: 1, l: 0, m: 0, Z: O_ZEFF_1S, occ: 2, core: true, at },
  { n: 2, l: 0, m: 0, Z: O_ZEFF_2, occ: 2, at },
  ...[-1, 0, 1].map(m => ({ n: 2, l: 1, m, Z: O_ZEFF_2, occ: 4 / 3, at })),
];
// oxygen-16: 8 protons and 8 neutrons, a tetrahedron inside an icosahedron
const PHI = (1 + Math.sqrt(5)) / 2;
const O16 = [
  ...[[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(v => scale(norm(v), 1.0)),
  ...[[0, 1, PHI], [0, -1, PHI], [0, 1, -PHI], [0, -1, -PHI], [1, PHI, 0], [-1, PHI, 0], [1, -PHI, 0], [-1, -PHI, 0], [PHI, 0, 1], [PHI, 0, -1], [-PHI, 0, 1], [-PHI, 0, -1]].map(v => scale(norm(v), 2.4)),
].map((pos, k) => [k % 2 ? NEUTRON_SCALE : PROTON_SCALE, pos]);
// water: O–H 95.72 pm, H–O–H 104.5°, the hydrogens below the oxygen
const OH_FM = 95720, HOH = 104.5 * Math.PI / 180;
const WATER_H = [-1, 1].map(s => [s * OH_FM * Math.sin(HOH / 2), -OH_FM * Math.cos(HOH / 2), 0]);
// on the log scale each atom is its own ball, edged at its van der Waals radius
// (O 152 pm, H 120 pm) and centred where the atom is, at one linear scale for
// the whole molecule: the space-filling model, ears overlapping the head.
// Centred so the molecule's farthest edge sits at 0.97.
const VDW_O = 152e3, VDW_H = 120e3;
const WATER_MID = (VDW_O + OH_FM * Math.cos(HOH / 2) + VDW_H) / 2 - VDW_O;  // drop that centres it vertically
const WATER_K = 0.97 / (Math.hypot(WATER_H[0][0], WATER_H[0][1] + WATER_MID) + VDW_H);
const WATER_BALLS = [
  { at: [0, WATER_MID * WATER_K, 0], R: VDW_O * WATER_K, edgeFm: VDW_O, nuclei: O16, electrons: oxygenElectrons() },
  ...WATER_H.map(p => ({ at: scale(addv(p, [0, WATER_MID, 0]), WATER_K), R: VDW_H * WATER_K, edgeFm: VDW_H,
    nuclei: [[PROTON_SCALE, [0, 0, 0]]], electrons: [{ n: 1, l: 0, m: 0, Z: 1, occ: 1, h: true }] })),
];
const ATOMS = [
  atom({ id: 'hydrogen', name: 'Hydrogen', sub: 'Hydrogen-1: one proton, one electron', current: '/content/icons/hydrogen.webp',
    chips: [['Electron', '1 · ground state 1s'], ['Lines', 'electron (1,−1) Hopf circles'], ['Scale', 'log radius, rings every ×10']],
    why: ATOM_WHY + ' Ground state: 1s, densest at the nucleus, though so little volume is there that the electron is mostly found near 50 pm; violet marks where ψ is negative.',
    nuclei: [[PROTON_SCALE, [0, 0, 0]]], electrons: H_ELECTRON, extentA0: H_EXTENT }),
  atom({ id: 'deuterium', name: 'Deuterium', sub: 'Hydrogen-2: a proton and a neutron, one electron, here excited to 3p',
    chips: [['Nucleus', 'p + n, ~3.9 fm apart'], ['Lines', 'electron (1,−1) Hopf circles'], ['Scale', 'log radius, rings every ×10']],
    why: ATOM_WHY + ' The extra neutron leaves the electron almost untouched: the 1s orbital is the same to 0.03% (the reduced mass). Shown here excited to 3p, 1.51 eV below escape: two lobes of opposite sign split by a flat node where the electron is never found; it falls back to 1s within a few billionths of a second, giving off light.',
    nuclei: [[PROTON_SCALE, [-1.97, 0, 0]], [NEUTRON_SCALE, [1.97, 0, 0]]], electrons: H_ELECTRON, extentA0: H_EXTENT,
    // the author's pick: the excited 3p state, its two lobes split by a dark node
    style: { orbital: '3p', neutronFringe: 0.35, neutronBall: 0.02, neutronGrey: 0.41, quarks: 0.85, nucleusGain: 2.25 } }),
  atom({ id: 'oxygen', name: 'Oxygen', sub: 'Oxygen-16: 8 protons, 8 neutrons, 8 electrons',
    chips: [['Nucleus', '8p + 8n'], ['Electrons', '1s² 2s² 2p⁴'], ['Core', '1s in the core colour'], ['Scale', 'log radius, rings every ×10']],
    why: ATOM_WHY + ' Oxygen\'s eight electrons fill 1s² 2s² 2p⁴, each orbital hydrogen-like with Slater\'s effective nuclear charge (7.7 for 1s, 4.55 for the second shell); the four 2p electrons are averaged over the three p orbitals, so the cloud is round. The two 1s electrons hug the nucleus about 8 times closer than hydrogen\'s.',
    nuclei: O16, electrons: oxygenElectrons(), extentA0: orbitalExtent(2, 1) / O_ZEFF_2 }),
  atom({ id: 'water', name: 'Water', sub: 'H₂O: an oxygen and two hydrogens',
    chips: [['Bonds', 'O–H 95.7 pm, 104.5°'], ['Electrons', '10'], ['Density', 'sum of free atoms'], ['Scale', 'log radius about the O']],
    why: ATOM_WHY + ' On the log scale each atom gets its own log ball about its own nucleus, sized by its van der Waals radius (oxygen 152 pm, hydrogen 120 pm) and placed where it really is: the hydrogens 95.7 pm from the oxygen, 104.5° apart, so the balls overlap like the space-filling model. The cloud here is the sum of free atoms\' densities (a "promolecule"): real bonding pulls the hydrogens\' electrons toward the oxygen, which this does not show.',
    nuclei: [...O16, ...WATER_H.map(p => [PROTON_SCALE, p])],
    electrons: [...oxygenElectrons(), ...WATER_H.map(at => ({ n: 1, l: 0, m: 0, Z: 1, occ: 1, h: true, at }))], extentA0: OH_FM / BOHR_FM + 3,
    balls: WATER_BALLS }),
  ...['2s', '2p', '3p', '3d z²', '3d xz', '4f z³'].map(o => {
    const [n, l, m] = ORBITALS[o];
    return atom({ id: `hydrogen-${n}${l}${m}`, name: `Hydrogen · ${o}`, sub: 'Excited hydrogen', why: ORBITAL_WHY,
      chips: [['Orbital', `${o} · n=${n}, l=${l}, m=${m}`], ['Lines', 'electron (1,−1) Hopf circles'], ['Nucleus', '~10⁵× too big']],
      nuclei: [[PROTON_SCALE, [0, 0, 0]]], electrons: [{ n, l, m, Z: 1, occ: 1 }], extentA0: orbitalExtent(n, l),
      style: { logScale: false, linearNucleus: 0.85, dashes: 0, cloudGain: 1.4, cloudContrast: 0.75, cloudFibers: 170, nucleusGain: 1 } });
  }),
];

export const PARTICLES = [
  quark('up', 'Up', '/content/icons/up-quark.webp', true, 1),
  quark('down', 'Down', '/content/icons/down.webp', false, 1),
  quark('charm', 'Charm', '/content/icons/charm.webp', true, 2),
  quark('strange', 'Strange', '/content/icons/strange.webp', false, 2),
  quark('top', 'Top', '/content/icons/top.webp', true, 3),
  quark('bottom', 'Bottom', '/content/icons/bottom.webp', false, 3),

  { ...lepton('electron', 'Electron', '/content/icons/electron.webp', 1, false), viewOpts: CLOSE_LIGHT },
  lepton('muon', 'Muon', '/content/icons/muon.webp', 2, false),
  lepton('tau', 'Tau', '/content/icons/tau.webp', 3, false),
  lepton('neutrino-e', 'Electron neutrino', '/content/icons/neutrino-e.webp', 1, true),
  lepton('neutrino-mu', 'Muon neutrino', '/content/icons/neutrino-mu.webp', 2, true),
  lepton('neutrino-tau', 'Tau neutrino', '/content/icons/neutrino-tau.webp', 3, true),

  {
    id: 'photon', name: 'Photon (visible light)', family: 'Bosons',
    sub: 'Gauge boson of electromagnetism: a wave packet',
    current: '/content/icons/visible-light.webp',
    chips: [['Spin', '1 · helicity = handedness'], ['End-on', 'a ball'], ['Side-on', 'E and B sine waves'], ['Colour', 'hue = wavelength band']],
    why: 'Circularly polarised light: the electric and magnetic fields each trace a helix, 90° apart, wound on the envelope of a wave packet. Seen end-on the loops stack into a ball (particle); seen from the side each helix projects to an exact sine wave (wave). Its spin ±1 is the helix\'s handedness. Other EM bands would change the number of turns.',
    N: 900,
    view: [],
    drift: [],
    pitch: 0,
    // the back half of each sine is still the wave: keep it lit
    depthMin: 0.75,
    // nearly orthographic, so the side view is an exact sine and not a perspective coil
    fov: 6 * Math.PI / 180,
    fibers() {
      const L = 1.8, R = 1, turns = 6;
      const helix = phase => (u, flow) => {
        const z = (2 * u - 1) * L;
        const r = R * Math.sqrt(Math.max(0, 1 - (z / L) ** 2));
        const a = turns * TAU * u + phase - flow * 25;
        return [z, r * Math.cos(a), r * Math.sin(a)];
      };
      const taper = u => Math.pow(Math.sin(Math.PI * u), 0.6);
      return [
        { curve: helix(0), open: true, spin: 1, width: 0.05, taper, intensity: 1.5, color: u => hsl(0.02 + 0.72 * u, 0.95, 0.56) },
        { curve: helix(Math.PI / 2), open: true, spin: 1, width: 0.035, taper, intensity: 1.2, color: u => hsl(0.02 + 0.72 * u, 0.6, 0.78) },
      ];
    },
  },
  {
    id: 'gluon', name: 'Gluon', family: 'Bosons',
    sub: 'Gauge boson of the strong force, SU(3)',
    current: '/content/icons/gluon.webp',
    chips: [['Spin', '1 · two-sided band'], ['Coil', '8 windings · SU(3) has 8 generators'], ['Front', 'colour'], ['Back', 'anticolour']],
    why: 'A band coiled 8 times around a thin torus, one winding per gluon type, like the spring of a colour flux tube. Its two sides carry a colour and an anticolour (here red and antigreen), because absorbing it turns a green quark red.',
    N: 640,
    view: [[0, 3, 0.05]],
    drift: [[0, 3, 0.08, 0.2], [1, 3, 0.07, 0.28]],
    pitch: 0.9,
    fibers() {
      return [{ eta: 0.36, xi1: 0, xi2: 0, p: 1, q: 8, spin: 1, width: 0.075, intensity: 1.6, color: () => RED, back: () => MAGENTA }];
    },
  },
  {
    id: 'w-boson', name: 'W⁺ boson', family: 'Bosons',
    sub: 'Charged carrier of the weak force',
    current: '/content/icons/w-boson.webp',
    chips: [['Spin', '1 · full-twist bands'], ['Charge', '+1 · (1,1) linked'], ['Gold', 'up-type'], ['Steel', 'down-type']],
    why: 'Charge +1: two Hopf circles, which always link exactly once. The W is the only particle that changes flavour, turning a down-type quark into an up-type, so one band is up-type gold and the other down-type steel, chained together. W⁻ is the mirror image.',
    N: 260,
    view: [[0, 3, 0.08]],
    drift: [[0, 3, 0.14, 0.22], [1, 3, 0.12, 0.3]],
    pitch: 0.35,
    fibers() {
      return [
        { eta: Math.PI / 4, xi1: 0, xi2: 0, p: 1, q: 1, spin: 1, width: 0.2, intensity: 1.6, color: () => GOLD },
        { eta: Math.PI / 4, xi1: Math.PI, xi2: 0, p: 1, q: 1, spin: 1, width: 0.2, intensity: 1.6, color: () => STEEL },
      ];
    },
  },
  {
    id: 'z-boson', name: 'Z boson', family: 'Bosons',
    sub: 'Neutral carrier of the weak force',
    current: '/content/icons/z-boson.webp',
    chips: [['Spin', '1 · full-twist bands'], ['Charge', '0 · (0,1) unlinked'], ['Sides', 'same: no flavour change'], ['Twin', 'the W, unchained']],
    why: 'The W\'s neutral twin: the same two bands, but as meridian rings, which never link. Same colour on both sides because the Z never changes flavour (there are no flavour-changing neutral currents).',
    N: 260,
    view: [[0, 3, 0.08]],
    drift: [[0, 3, 0.14, 0.22], [1, 3, 0.12, 0.3]],
    pitch: 0.35,
    fibers() {
      const pal = cyclic([rgb(90, 160, 255), rgb(225, 235, 255), rgb(120, 200, 255)]);
      return [
        { eta: Math.PI / 4, xi1: 0, xi2: 0, p: 0, q: 1, spin: 1, width: 0.2, intensity: 1.5, color: u => pal(u) },
        { eta: Math.PI / 4, xi1: Math.PI, xi2: 0, p: 0, q: 1, spin: 1, width: 0.2, intensity: 1.5, color: u => pal(u + 0.5) },
      ];
    },
  },
  {
    id: 'higgs', name: 'Higgs', family: 'Bosons',
    sub: 'Scalar boson of the Higgs field',
    current: '/content/icons/higgs.webp',
    chips: [['Spin', '0 · nothing to twist'], ['Fibers', 'all of S³'], ['Motion', 'radial breathing'], ['Vacuum', 'S³ itself']],
    why: 'The Higgs field\'s lowest-energy states form a 3-sphere, the very S³ every other picture lives on. So the Higgs is S³ itself, every Hopf circle at once, woven into a glowing ball. The boson is the one ripple that leaves it: the whole sphere breathing in and out.',
    N: 160,
    additive: true,
    depthMin: 0.45,
    view: [[0, 3, 0.05]],
    drift: [[0, 3, 0.1, 0.19], [1, 3, 0.08, 0.27]],
    pitch: 0.8,
    radius: t => 1 + 0.06 * Math.sin(1.4 * t),
    fibers() {
      const out = [];
      const pal = cyclic([rgb(255, 240, 215), rgb(255, 205, 140), rgb(255, 250, 240), rgb(255, 225, 190)]);
      [[0.12, 8], [0.28, 18], [0.44, 28], [0.6, 38], [0.76, 48]].forEach(([eta, n], si) => {
        for (let k = 0; k < n; k++) {
          const c = pal(k / n + si * 0.2);
          out.push({ eta, xi1: TAU * k / n, xi2: 0, p: 1, q: 1, spin: 0, flat: 1, width: 0.0065, intensity: 0.3, color: () => c });
        }
      });
      return out;
    },
  },

  PROTON_SCALE,
  NEUTRON_SCALE,
  ...COMPOSITES,
  ...ATOMS,
];

// =============================================================
// WebGL2 renderer: one shared context (browsers cap live contexts at ~16).
// Tubes are extruded in the vertex shader from each particle's fiber data
// texture → MSAA HDR target → dual-filter bloom → ACES tone map, then the
// frame is copied into that particle's own 2D canvas.
// =============================================================
const SCENE_VS = `#version 300 es
precision highp float;
precision highp sampler2D;
layout(location=0) in vec2 a_grid; // x: sample index, y: angle around the tube
uniform sampler2D u_data;
uniform mat4 u_vp;
uniform int u_first; // first fiber of this draw (WebGL2 has no base instance)
out vec3 v_pos; out vec3 v_nrm; out vec4 v_col; out vec3 v_back; out float v_side; out float v_glow;
void main() {
  int i = int(a_grid.x + 0.5), row = (gl_InstanceID + u_first) * ${ROWS};
  vec4 P = texelFetch(u_data, ivec2(i, row), 0);
  vec4 R = texelFetch(u_data, ivec2(i, row + 1), 0);
  vec4 B4 = texelFetch(u_data, ivec2(i, row + 2), 0);
  vec3 B = B4.xyz;
  v_glow = B4.w;
  v_col = texelFetch(u_data, ivec2(i, row + 3), 0);
  v_back = texelFetch(u_data, ivec2(i, row + 4), 0).rgb;
  float c = cos(a_grid.y), s = sin(a_grid.y), flat_ = R.w;
  // elliptical cross-section: wide along R, thin along B → a thick ribbon
  v_pos = P.xyz + P.w * (c * R.xyz + s * flat_ * B);
  v_nrm = normalize(c * flat_ * R.xyz + s * B);
  v_side = s;
  gl_Position = u_vp * vec4(v_pos, 1.0);
}`;

const SCENE_FS = `#version 300 es
precision highp float;
in vec3 v_pos; in vec3 v_nrm; in vec4 v_col; in vec3 v_back; in float v_side; in float v_glow;
uniform vec3 u_cam, u_center;
uniform float u_radius, u_exposure, u_core, u_depthMin;
out vec4 o;
void main() {
  vec3 n = normalize(v_nrm), v = normalize(u_cam - v_pos);
  float ndv = clamp(dot(n, v), 0.0, 1.0);
  vec3 L = normalize(vec3(-0.45, 0.7, 0.55));
  float diff = 0.3 + 0.7 * max(dot(n, L), 0.0);
  float spec = pow(max(dot(n, normalize(L + v)), 0.0), 42.0);
  float rim = pow(1.0 - ndv, 2.5);
  float core = pow(ndv, 10.0);
  vec3 col = mix(v_back, v_col.rgb, smoothstep(-0.3, 0.3, v_side));
  float d = dot(v_pos - u_center, normalize(u_cam - u_center)) / u_radius;
  float depth = mix(u_depthMin, 1.2, smoothstep(-1.0, 1.0, d));
  if (v_glow > 0.5) {
    // a field, not a surface: brightest through the middle of the tube, fading to nothing at its edge
    o = vec4(col * pow(ndv, 1.6) * depth * v_col.a * u_exposure, 1.0);
    return;
  }
  vec3 c = col * diff * 0.85 + col * rim * 1.3 + vec3(spec) * 0.55 + mix(col, vec3(1.0), 0.65) * core * u_core;
  // depth cue: the far side of the object recedes into the dark
  c *= depth;
  o = vec4(c * v_col.a * u_exposure, 1.0);
}`;

const QUAD_VS = `#version 300 es
out vec2 uv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  uv = p; gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const DOWN_FS = `#version 300 es
precision highp float;
in vec2 uv; uniform sampler2D u_src; uniform vec2 u_px; out vec4 o;
void main() {
  vec2 h = u_px;
  o = (texture(u_src, uv) * 4.0
    + texture(u_src, uv + vec2(-h.x, -h.y)) + texture(u_src, uv + vec2(h.x, -h.y))
    + texture(u_src, uv + vec2(-h.x, h.y)) + texture(u_src, uv + vec2(h.x, h.y))) / 8.0;
}`;

const UP_FS = `#version 300 es
precision highp float;
in vec2 uv; uniform sampler2D u_src; uniform vec2 u_px; out vec4 o;
void main() {
  vec2 h = u_px;
  vec4 s = texture(u_src, uv + vec2(-h.x * 2.0, 0.0)) + texture(u_src, uv + vec2(h.x * 2.0, 0.0))
         + texture(u_src, uv + vec2(0.0, -h.y * 2.0)) + texture(u_src, uv + vec2(0.0, h.y * 2.0))
         + (texture(u_src, uv + vec2(-h.x, h.y)) + texture(u_src, uv + vec2(h.x, h.y))
         + texture(u_src, uv + vec2(-h.x, -h.y)) + texture(u_src, uv + vec2(h.x, -h.y))) * 2.0;
  o = s / 12.0;
}`;

const FINAL_FS = `#version 300 es
precision highp float;
in vec2 uv; uniform sampler2D u_scene, u_bloom; uniform float u_bloomAmt, u_alpha; out vec4 o;
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main() {
  vec3 c = texture(u_scene, uv).rgb + texture(u_bloom, uv).rgb * u_bloomAmt;
  vec3 g = pow(aces(c), vec3(1.0 / 2.2));
  // over a picture rather than black: light as premultiplied colour, alpha its brightest channel
  if (u_alpha < 0.5) { o = vec4(g, 1.0); return; }
  // the bloom's faint tail fills the whole frame: drop it, and fade to nothing
  // in a circle well inside the frame, so no square shows against what's behind
  float a = max(g.r, max(g.g, g.b));
  float k = smoothstep(0.08, 0.35, a) * smoothstep(0.5, 0.3, length(uv - 0.5));
  o = vec4(g, a) * k;
}`;

function compile(gl, vs, fs) {
  const p = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
  return { p, u };
}

// --- tiny mat4 (column-major) ---
function perspective(fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}
function lookAt(eye, at) {
  const z = norm(sub(eye, at)), x = norm(cross([0, 1, 0], z)), y = cross(z, x);
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
}
function mul(a, b) {
  const o = new Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  }
  return o;
}

const RADIAL = 14, BLOOM_LEVELS = 6, FOV = 28 * Math.PI / 180;

export class Renderer {
  // alpha: frames carry transparency (light over a picture), not a black backdrop
  constructor({ alpha = false } = {}) {
    this.alpha = alpha;
    this.canvas = document.createElement('canvas');
    const gl = this.gl = this.canvas.getContext('webgl2', { antialias: false, alpha, premultipliedAlpha: true });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.hdr = !!gl.getExtension('EXT_color_buffer_float');
    this.scene = compile(gl, SCENE_VS, SCENE_FS);
    this.down = compile(gl, QUAD_VS, DOWN_FS);
    this.up = compile(gl, QUAD_VS, UP_FS);
    this.final = compile(gl, QUAD_VS, FINAL_FS);
    this.quadVao = gl.createVertexArray();
    this.grids = new Map();
  }

  // tube grid: (N+1) rings × (RADIAL+1) vertices, shared by every fiber with N samples
  grid(N) {
    if (this.grids.has(N)) return this.grids.get(N);
    const gl = this.gl;
    const verts = [], idx = [];
    for (let i = 0; i <= N; i++) for (let j = 0; j <= RADIAL; j++) verts.push(i, TAU * j / RADIAL);
    for (let i = 0; i < N; i++) for (let j = 0; j < RADIAL; j++) {
      const a = i * (RADIAL + 1) + j, b = a + RADIAL + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(idx), gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    const g = { vao, count: idx.length };
    this.grids.set(N, g);
    return g;
  }

  makeTarget(w, h) {
    const gl = this.gl;
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, this.hdr ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, this.hdr ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return { tex, fb, w, h };
  }

  resize(px) {
    if (this.size === px) return;
    const gl = this.gl;
    for (const t of [this.sceneT, ...(this.levels || [])]) if (t) { gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fb); }
    for (const rb of this.msRbs || []) gl.deleteRenderbuffer(rb);
    if (this.msFb) gl.deleteFramebuffer(this.msFb);
    this.canvas.width = this.canvas.height = this.size = px;
    const samples = Math.min(4, gl.getParameter(gl.MAX_SAMPLES));
    this.msFb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.msFb);
    const col = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, col);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, this.hdr ? gl.RGBA16F : gl.RGBA8, px, px);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, col);
    const dep = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, dep);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, samples, gl.DEPTH_COMPONENT24, px, px);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, dep);
    this.msRbs = [col, dep];
    this.sceneT = this.makeTarget(px, px);
    this.levels = [];
    for (let i = 1; i <= BLOOM_LEVELS; i++) this.levels.push(this.makeTarget(Math.max(1, px >> i), Math.max(1, px >> i)));
  }

  // dest: [ctx, x, y, w, h] to draw somewhere other than the view's own canvas
  render(view, opts, dest = null) {
    opts = view.look(opts);
    const gl = this.gl, px = this.size;
    const fov = view.particle.fov ?? FOV;
    const dist = view.radius * 1.32 / Math.sin(fov / 2);
    const eye = [
      view.center[0] + dist * Math.cos(view.pitch) * Math.sin(view.yaw),
      view.center[1] + dist * Math.sin(view.pitch),
      view.center[2] + dist * Math.cos(view.pitch) * Math.cos(view.yaw),
    ];
    const vp = mul(perspective(fov, 1, dist * 0.2, dist * 3), lookAt(eye, view.center));

    // 1. scene → MSAA HDR
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.msFb);
    gl.viewport(0, 0, px, px);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // silk and ghosts: additive light with no occlusion, so hidden layers show through
    if (view.particle.additive) {
      gl.disable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
    } else {
      gl.enable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
    }
    const s = this.scene;
    gl.useProgram(s.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, view.dataTex);
    gl.uniform1i(s.u.u_data, 0);
    gl.uniformMatrix4fv(s.u.u_vp, false, vp);
    gl.uniform3fv(s.u.u_cam, eye);
    gl.uniform3fv(s.u.u_center, view.center);
    gl.uniform1f(s.u.u_radius, view.radius);
    gl.uniform1f(s.u.u_exposure, opts.exposure);
    gl.uniform1f(s.u.u_core, opts.core);
    gl.uniform1f(s.u.u_depthMin, view.particle.depthMin ?? 0.22);
    const g = this.grid(view.N);
    gl.bindVertexArray(g.vao);
    gl.uniform1i(s.u.u_first, 0);
    gl.drawElementsInstanced(gl.TRIANGLES, g.count, gl.UNSIGNED_INT, 0, view.solidCount);
    const glowCount = view.fibers.length - view.solidCount;
    if (glowCount) {
      // flux tubes: additive light, hidden behind the quarks but never hiding them
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.depthMask(false);
      gl.uniform1i(s.u.u_first, view.solidCount);
      gl.drawElementsInstanced(gl.TRIANGLES, g.count, gl.UNSIGNED_INT, 0, glowCount);
      gl.depthMask(true);
    }
    gl.bindVertexArray(this.quadVao);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);

    // 2. resolve
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.msFb);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.sceneT.fb);
    gl.blitFramebuffer(0, 0, px, px, 0, 0, px, px, gl.COLOR_BUFFER_BIT, gl.NEAREST);

    // 3. bloom: downsample chain, then tent-filtered upsample accumulated back up
    gl.useProgram(this.down.p);
    let src = this.sceneT;
    for (const dst of this.levels) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
      gl.viewport(0, 0, dst.w, dst.h);
      gl.bindTexture(gl.TEXTURE_2D, src.tex);
      gl.uniform2f(this.down.u.u_px, 1 / src.w, 1 / src.h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      src = dst;
    }
    gl.useProgram(this.up.p);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    for (let i = this.levels.length - 1; i > 0; i--) {
      const from = this.levels[i], to = this.levels[i - 1];
      gl.bindFramebuffer(gl.FRAMEBUFFER, to.fb);
      gl.viewport(0, 0, to.w, to.h);
      gl.bindTexture(gl.TEXTURE_2D, from.tex);
      gl.uniform2f(this.up.u.u_px, 1 / from.w, 1 / from.h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    gl.disable(gl.BLEND);

    // 4. composite + tone map
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, px, px);
    gl.useProgram(this.final.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.sceneT.tex);
    gl.uniform1i(this.final.u.u_scene, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.levels[0].tex);
    gl.uniform1i(this.final.u.u_bloom, 1);
    gl.uniform1f(this.final.u.u_bloomAmt, opts.bloom * 0.35);
    gl.uniform1f(this.final.u.u_alpha, this.alpha ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.activeTexture(gl.TEXTURE0);

    // copy into the particle's own canvas while the drawing buffer is still valid
    if (dest) dest[0].drawImage(this.canvas, dest[1], dest[2], dest[3], dest[4]);
    else view.ctx.drawImage(this.canvas, 0, 0, view.canvas.width, view.canvas.height);
  }
}

export class HopfView {
  constructor(renderer, canvas, particle) {
    this.renderer = renderer;
    this.canvas = canvas;
    this.ctx = canvas && canvas.getContext('2d');
    this.particle = particle;
    // a particle with make() builds its own scene and steps it each frame
    const made = particle.make ? particle.make() : null;
    this.fibers = made ? made.fibers : particle.fibers();
    this.solidCount = made ? made.solidCount : this.fibers.length;
    this.step = made && made.step;
    this.res = particle.resolution === undefined ? 0 : +(new URLSearchParams(location.search).get('res') ?? particle.resolution);
    // gluon flux tubes, re-anchored every frame (see update): straight open tubes
    this.ends = [];
    if (particle.flux) {
      const legs = particle.flux.type === 'Y' ? 3 : 1;
      for (let k = 0; k < legs; k++) {
        this.ends.push([[0, 0, 0], [0, 0, 0]]);
        const e = this.ends[k], q = this.fibers[k];
        this.fibers.push({
          open: true, glow: true, spin: 0, flat: 1,
          width: particle.flux.width ?? 0, intensity: particle.flux.intensity,
          // rounded ends, so fat tubes read as a field rather than cut pipes
          taper: u => Math.pow(Math.sin(Math.PI * u), 0.3),
          curve: u => [0, 1, 2].map(a => e[0][a] + (e[1][a] - e[0][a]) * u),
          color: particle.flux.type === 'Y' ? q.color : u => {
            const a = this.fibers[0].color(), b = this.fibers[1].color();
            return a.map((v, i) => v + (b[i] - v) * u);
          },
        });
      }
    }
    this.N = particle.N;
    this.W = this.N + 1;
    this.data = new Float32Array(this.W * this.fibers.length * ROWS * 4);
    const gl = renderer.gl;
    this.dataTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.dataTex);
    for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, k, gl.NEAREST);
    this.yaw = 0; this.pitch = particle.pitch ?? 0.4;
    this.center = null; this.radius = 1;
    if (canvas) this.bindDrag();
  }

  bindDrag() {
    let last = null;
    const c = this.canvas;
    c.addEventListener('pointerdown', e => { last = [e.clientX, e.clientY]; c.setPointerCapture(e.pointerId); c.classList.add('dragging'); this.held = true; });
    c.addEventListener('pointermove', e => {
      if (!last) return;
      this.yaw += (e.clientX - last[0]) * 0.008;
      this.pitch = Math.max(-1.4, Math.min(1.4, this.pitch + (e.clientY - last[1]) * 0.008));
      last = [e.clientX, e.clientY];
    });
    const end = () => { last = null; c.classList.remove('dragging'); this.held = false; };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
  }

  // the particle's own camera and light, unless the caller keeps its own
  look(opts) { return opts.own || !this.particle.viewOpts ? opts : { ...opts, ...this.particle.viewOpts }; }

  update(time, opts) {
    opts = this.look(opts);
    const p = this.particle;
    const planes = p.view.slice();
    if (opts.drift) for (const [i, j, amp, freq] of p.drift) planes.push([i, j, amp * Math.sin(time * freq)]);
    const M = rot4(planes);
    const flow = opts.flow ? time * 0.08 : 0;
    const radius = p.radius ? p.radius(time) : 1;
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    const all = [], curves = [];
    if (this.step) {
      this.step(time, this.res);
      for (let k = 0; k < this.fibers.length; k++) sampleFiber(this.fibers[k], M, flow, this.N, opts.width, radius, time, this.data, k * ROWS, this.W);
    }
    else for (let k = 0; k < this.solidCount; k++) {
      const pts = sampleFiber(this.fibers[k], M, flow, this.N, opts.width, radius, time, this.data, k * ROWS, this.W);
      curves.push(pts);
      for (const q of pts) { all.push(q); for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], q[a]); hi[a] = Math.max(hi[a], q[a]); } }
    }
    if (p.flux) {
      this.anchorFlux(curves, all);
      for (let k = this.solidCount; k < this.fibers.length; k++) {
        sampleFiber(this.fibers[k], M, flow, this.N, opts.width, radius, time, this.data, k * ROWS, this.W);
      }
    }
    let c, r = 0;
    if (p.frame) { c = p.frame.center; r = p.frame.radius; }
    else {
      c = scale([lo[0] + hi[0], lo[1] + hi[1], lo[2] + hi[2]], 0.5);
      for (const q of all) r = Math.max(r, Math.hypot(q[0] - c[0], q[1] - c[1], q[2] - c[2]));
    }
    // ease framing slowly, so 4D drift (and the Higgs breathing) stay visible
    // instead of being cancelled by the camera
    if (!this.center) { this.center = c; this.radius = r; }
    else {
      this.center = this.center.map((v, a) => v + (c[a] - v) * 0.02);
      this.radius += (r - this.radius) * 0.02;
    }
    const gl = this.renderer.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.dataTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, this.W, this.fibers.length * ROWS, 0, gl.RGBA, gl.FLOAT, this.data);
  }

  // The flux-tube energy is string tension × total tube length, so the field
  // settles where the tubes are shortest. Alternate between snapping each
  // anchor to its quark's nearest point and moving the junction to the point
  // of least total distance (the Fermat point, where legs meet at 120°).
  // Warm-started from last frame so the tubes slide rather than jump.
  anchorFlux(curves, all) {
    const flux = this.particle.flux;
    if (flux.anchor === 'spread') this.anchorSpread(curves, all);
    else this.anchorShortest(curves, all);
    if (flux.widthOfLength) {
      const lens = this.ends.map(([a, b]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
      const w = flux.widthOfLength * lens.reduce((x, y) => x + y, 0) / lens.length;
      for (let k = this.solidCount; k < this.fibers.length; k++) this.fibers[k].width = w;
    }
  }

  // Each quark's outermost point in its own direction, 120° apart around the
  // vertical symmetry axis (opposite directions for a pair); junction at their
  // Fermat point.
  anchorSpread(curves, all) {
    const c = scale(all.reduce((s, q) => [s[0] + q[0], s[1] + q[1], s[2] + q[2]], [0, 0, 0]), 1 / all.length);
    const n = curves.length;
    const a = curves.map((Q, k) => {
      const ang = TAU * k / n, dir = [Math.cos(ang), 0, Math.sin(ang)];
      let best = Q[0], bd = -Infinity;
      for (const q of Q) { const d = dot(sub(q, c), dir); if (d > bd) { bd = d; best = q; } }
      return best;
    });
    if (this.particle.flux.type === 'Y') {
      const J = fermatPoint(a, c);
      a.forEach((ai, k) => { this.ends[k][0] = ai; this.ends[k][1] = J; });
    } else {
      this.ends[0][0] = a[0]; this.ends[0][1] = a[1];
    }
  }

  anchorShortest(curves, all) {
    if (this.particle.flux.type === 'Y') {
      let J = this.junction || scale(all.reduce((s, q) => [s[0] + q[0], s[1] + q[1], s[2] + q[2]], [0, 0, 0]), 1 / all.length);
      let a = [];
      for (let it = 0; it < 6; it++) {
        a = curves.map(Q => closestPoint(Q, J));
        J = fermatPoint(a, J);
      }
      this.junction = J;
      a.forEach((ai, k) => { this.ends[k][0] = ai; this.ends[k][1] = J; });
    } else {
      let b = this.pairEnd || closestPoint(curves[1], curves[0][0]), a;
      for (let it = 0; it < 6; it++) { a = closestPoint(curves[0], b); b = closestPoint(curves[1], a); }
      this.pairEnd = b;
      this.ends[0][0] = a; this.ends[0][1] = b;
    }
  }
}

function closestPoint(Q, x) {
  let best = Q[0], bd = Infinity;
  for (const q of Q) {
    const d = (q[0] - x[0]) ** 2 + (q[1] - x[1]) ** 2 + (q[2] - x[2]) ** 2;
    if (d < bd) { bd = d; best = q; }
  }
  return best;
}

// Weiszfeld iteration for the point minimizing the summed distance to pts
function fermatPoint(pts, J) {
  for (let it = 0; it < 30; it++) {
    let w = 0;
    const acc = [0, 0, 0];
    for (const a of pts) {
      const d = Math.max(1e-6, Math.hypot(a[0] - J[0], a[1] - J[1], a[2] - J[2]));
      w += 1 / d;
      for (let k = 0; k < 3; k++) acc[k] += a[k] / d;
    }
    J = scale(acc, 1 / w);
  }
  return J;
}

// Chart object slug → Hopf particle, and the icon file it replaces
// (content/icons/<file>.webp holds the still fallback). Photons keep their
// wavelength pictures; the nucleons show what the probe resolves at the
// icon's on-screen size (bigger on screen = finer).
export const CHART_ICONS = {
  up: { id: 'up', file: 'up-quark' }, down: { id: 'down', file: 'down' },
  charm: { id: 'charm', file: 'charm' }, strange: { id: 'strange', file: 'strange' },
  top: { id: 'top', file: 'top' }, bottom: { id: 'bottom', file: 'bottom' },
  electron: { id: 'electron', file: 'electron' }, muon: { id: 'muon', file: 'muon' }, tau: { id: 'tau', file: 'tau' },
  'neutrino-e': { id: 'neutrino-e', file: 'neutrino-e' }, 'neutrino-mu': { id: 'neutrino-mu', file: 'neutrino-mu' },
  'neutrino-tau': { id: 'neutrino-tau', file: 'neutrino-tau' },
  w: { id: 'w-boson', file: 'w-boson' }, z: { id: 'z-boson', file: 'z-boson' }, higgs: { id: 'higgs', file: 'higgs' },
  meson: { id: 'meson-mass', file: 'meson' },
  proton: { id: 'proton-scale', file: 'proton', res: 0.45 }, neutron: { id: 'neutron-scale', file: 'neutron', res: 0.45 },
};
