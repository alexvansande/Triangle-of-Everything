// =============================================================
// Scene: long-02b-opening — the new opening of long video 2 (space), the author's first draft of the new script (rec74,
// 2026-11-17; video/long-02b-opening/, the script: the claude.ai doc "Long 2: Space Triangle — script"). The catalogue of
// everything on black (src/narr-catalogue.js, the author's notes in the script): the chart's pictures floating in 3D,
// the camera darting to each thing named, glowing lines between the ones of a kind, labels, then sorted (floats / sinks,
// round, alive, heavier, bigger) and laid out by size and mass on a log grid. Then the chart: everything from far away,
// the bands and the diagonal; the dance of the forces, the electric bonds (a few atoms settling, the Squeeze Lab's
// mode 1 without the squeeze), gravity pushing in, the pan up to the round worlds, the giant planets' column and the
// atoms crushed, the split, the strong force and fusion, the main sequence, the fuel running out, how stars end and the
// weak force, the neutron star; then the black-hole line up to the Schwarzschild limit, where the long cut
// (video/cuts/long-02b-space.json) hands over to the Black Hole Slope. The forces Short (short-l2b-dance-of-the-forces)
// is cut from this take. The chart's shots are the forces Short's (short-l2-dance-of-the-forces.js) and the Black Hole
// Slope's (short-04a-black-hole-slope.js), keyed to this take's words, so the pictures match across the series.
// =============================================================
// Field reference: docs/narration.md, "Scene fields". Rules: video/plans/visual-rules.md.

import S4A from "./short-04a-black-hole-slope.js";
import S4B from "./short-04b-smallest-black-holes.js";
import { W5, ML, HAW, NS_OPEN, SRC_NS } from "./short-04-black-holes.js";

// the Black Hole Slope's shots from "don't actually have a size" and the Smallest Black Holes' from "with enough
// pressure" (rec75 says them in one go, 2026-11-18): their cues, given this take's wording where it differs
const ALIAS = {
  "some people who believe": ["some scientists"],
  "with enough pressure": ["we can't turn matter"],
  "instants after the big bang": ["instance after the big bang", "instant after the big bang"],
  "when we weigh galaxies": ["when we weight galaxies", "when we wait galaxies", "when we weigh"],
  "to explain them": ["to explain it"],
  "very first moments of our history": ["very first instance of our history", "very first instant of our history"],
  "the milky way": ["our milky way"],
  "but how small": ["actually how small"],
};
// the dark-matter areas' labels moved off their hatching for the wide frame (the author, 2026-11-25, long 10:31: "label
// covers hashed area"; they were placed for the Short's tall frame): human injuries to the right of its area, the crystals
// to the left of theirs, clear of the source line under them
const WIDE_LABELS = { "ruled out by a lack of\nrandom human injuries": [13, 3.4], "ruled out by\nancient crystals": [-17, 0.8] };
// (and each survey's source line lifted to the top edge: it sat on the survey's "ruled out by" label, the author, 2026-11-25, 8:54)
const wideLabels = (c) => c.hl ? { ...c, hl: c.hl.map(q => WIDE_LABELS[q.label] ? { ...q, labelAt: WIDE_LABELS[q.label] } : q.title && q.small && q.y === 0.12 ? { ...q, y: 0.04 } : q) } : c;
const alias = (c) => { const at = [].concat(c.at ?? []); const x = at.flatMap(a => ALIAS[a] ?? []); return x.length ? { ...c, at: [...at, ...x] } : c; };
const from = (cues, at) => cues.slice(cues.findIndex(c => [].concat(c.at).includes(at)));

const WATER = { line: "water" };
const ON_LINE = (m) => (m - 0.62) / 3;
// marks a little ahead of the camera on the pan up the diagonal (visual-rules.md, "Marks during a glide")
const force = (m, dir, color) => ({ arrow: true, solid: true, width: 4, color, from: { r: ON_LINE(m) + dir * 1.5, m }, to: { r: ON_LINE(m) + dir * 0.2, m } });
// (named = false: the arrows alone; the words come once the narration names the force, the author, 2026-11-17, 1:35:
// "don't show the pushes out and in labels yet")
const GRAV_AT = (m, named = true) => [force(m + 0.9, 1, "#ffab40"), force(m - 0.9, 1, "#ffab40"), ...(named ? [{ text: "gravity\npushes in", at: [ON_LINE(m) + 0.85, m], size: 22, color: "#ffab40" }] : [])];
const EM_AT = (m, named = true) => [force(m + 0.9, -1, "#4fc3f7"), force(m - 0.9, -1, "#4fc3f7"), ...(named ? [{ text: "electro-\nmagnetism\npushes out", at: [ON_LINE(m) - 1.05, m], size: 22, color: "#4fc3f7" }] : [])];
const UP = (m, span = 4.6) => ({ r: ON_LINE(m), m, span, glide: true });
const COLUMN = { trend: [[9.84, 29.9], [9.84, 32.4]], color: "#ffd54f" };
const G = (r, m, span = 1.7) => ({ r, m, span });
const BD = [{ obj: "Y Brown Dwarf", label: false }, { obj: "T Brown Dwarf", label: false }];
// (two ways, living stars and dead ones, and the red giants between: the author, 2026-11-25, long, "this bifurcation here
// happens: we only show one arrow … Show two arrows and the labels will be living stars and dead stars (and if it fits
// adds the label dying stars to the red giants)")
const FORK = [
  { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "Sun" }, color: "#ffd54f" },
  { arrow: true, from: { obj: "L Brown Dwarf" }, to: { obj: "White Dwarf" }, color: "#e0e0e0", delay: 0.4 },
  { obj: "Sun", label: "living stars", place: "right", delay: 0.4 },
  { obj: "White Dwarf", label: "dead stars", place: "left", delay: 0.8 },
  { obj: "Red Giant", label: "dying stars", place: "right", delay: 1.2 },
];
const MS = { line: "mainsequence", label: "main sequence" };
// where things turn round: just under Mimas, the smallest round moon (the author, 2026-11-20, 2:35: "place the horizontal
// line near Mimas and put two labels Round and Many shapes"; it was Short 2's, between Vesta and Ceres); the shape held by
// bonds below, by gravity above
const ROUND_M = 22.45;
const ROUND_BONDS = { side: "below", mass: ROUND_M, label: "many shapes", labelX: 0.22 };
const ROUND_GRAV = { side: "above", mass: ROUND_M, label: "round", labelX: 0.22 };
// "so far our objects…": the chart with no pictures, its dots only, the places they gather looped (the author,
// 2026-11-17, 5:21: "hide all icons, keep just the dots and then use circles and ovals to highlight these areas")
const SO_FAR = { r: 4.6, m: 15, span: 22, frame: [-5, -9, 14, 41] };
const OV_WATER = { ellipse: [2.4, 7.9, 1.3, 20], label: "ordinary matter", place: "left", color: "#80deea" };
// along the water line, each group its own loop as it's named (the author, 2026-11-20: "instead of one big circle for all
// water density zoom in the line and add circles for asteroids and dwarf planets, terrestrial planets and gas giants")
const OV_ROCKS = { ellipse: [6.2, 19.5, 0.75, 6.2], label: "asteroids and dwarf planets", place: "left", color: "#80deea" };
const OV_TERR = { ellipse: [8.58, 27.15, 0.5, 1.1], label: "terrestrial planets", place: "left", color: "#80deea" };
const OV_GIANTS = { ellipse: [9.62, 29.6, 0.5, 1.0], label: "gas giants", place: "right", color: "#80deea" };
const OV_COLUMN = { ellipse: [9.85, 31.2, 0.5, 1.7], rot: 0, label: "super-Jupiters", place: "left", color: "#ffd54f" };
const OV_STARS = { ellipse: [11.1, 33.9, 0.55, 2.1], rot: 34, label: "living stars", place: "right", color: "#ffab40" };
// (each cue holds the catalogue until the next: with the default 14 s it ended at 0:26 and the chart showed through,
// the author, 2026-11-17: "0:29 dont show the chart yet just keep floating among the objects"; out: its fade into the chart)
const CAT = (phase) => ({ catalogue: { phase }, instant: true, out: 1.6 });
const CQ = (at, phase) => ({ at, hold: 999, hl: [CAT(phase)] });
// the black-hole line (the Black Hole Slope's)
const BH = (m) => ({ r: m - 27.83, m, mark: true });
const SCHW = { line: "schwarzschild" };
const KNOWN = { dust: "blackhole", sweep: 1.6 };
const LOW = { path: "stellar-low-mass" }, HIGH = { path: "stellar-high-mass" };
const CYCLE = [LOW, HIGH, { path: ["nebula-to-nursery", "remnant-to-nursery"] }];
const WD = { obj: "White Dwarf", label: false }, NS = { obj: "PSR J0030+0451", label: false }, SBH = { obj: "Stellar BH", label: false };
// a few atoms finding their distance: the Squeeze Lab's mode 1 with a roomy box that doesn't shrink and nothing popping,
// its arrows on (the author's note in the script: "electrons repel electrons", "electrons and protons attract"); the
// arrows on the line between each two neighbours' centres (the author, 2026-11-17, 1:41): blue pairs pushing them
// apart at the electron rings, purple ones from each ring to the other's nucleus (squeeze-sim.js, arrowsBonds)
// the fusion run's settings (see the cues at "the strong force")
// (in cycles, the author, 2026-11-18: the fours are only which atoms fuse together; each atom reads as its own, on a soft
// spring that lets it jostle ("keep them quite elastic"); one four fuses, its energy at once (0.2 s, the helium's ring
// just closed: the author, 2026-11-20, "there's like a second between the fusion and the release of energy"),
// throws everything out, the box closes again round the new helium, then the four beside it fuses, and again; the
// first on "capture them", its energy on "a large amount of energy", then one every 4.2 s to the end of the shot)
const FUSION_P = { groups4: true, fourAtOnce: false, count: 200, radius: 100, groupSpacing: 5.0, groupGap: 1.6, groupSpring: 4, startBox: 1.6, endBox: 1.2,
  relief: 0, jitter: 12, initSpeed: 40, damping: 1, hugRate: 1.4, bridgeTime: 0.15, neutrons: 2, arrowTime: 7,
  cycles: true, cyclePeriod: 4.2, cycleBurst: 0.2, expandTime: 1.6, contractRate: 1.6, burstBox: 2.0, burstForce: 1.5, burstTau: 0.8, burstRate: 2.5 };
const BONDS = { squeeze: { mode: 1, from: 0, P: { count: 34, startBox: 1.12, endBox: 1.12, shrinkTime: 999, threshold: 9, centreFirst: 0, initSpeed: 140, arrowTime: 30, arrowsIn: false, arrowsOut: false, arrowsBonds: true,
  // each kind of arrow as it's named (rec75: "attracted to protons of the atom next door", then "the electron layers also push back"), s into the run
  bondPullFrom: 0.8, bondPushFrom: 4.0 },
  labels: [["electrons and protons attract", "#b39ddb", 0.8], ["electrons repel electrons", "#4fc3f7", 4.0]] } };

// back on the window, the part neutron stars might still rule out marked, with its source (the author, 2026-11-20,
// 9:30: "that window might close more in the future: show the part that might be ruled out by neutron star studies and
// cite it"); "they'd be invisible" moves on as before
const WINDOW_NS = { at: ["window might close", "might close more"], cam: { r: -8.6, m: 19.4, span: 12 }, dur: 2.5, clear: true, forceIcons: null,
  hl: [{ window: W5, cuts: [ML, HAW, NS_OPEN], label: "still open?", dist: 40, instant: true }, SRC_NS] };

const SCENE = {
  title: "The Triangle of Everything: space (the new opening)",
  blurb: "A map of every single thing: the catalogue, sorted and laid out by mass and size; then the dance of the forces up the diagonal, from chemical bonds to the neutron star, and the black-hole line.",
  // the chart's first frame, behind the catalogue until it hands over (bare: the painting comes back from 1:20)
  start: { r: 5.5, m: 14, span: 30 },
  bgStart: 0,
  // and bare of its edges, regions and names until the diagonal is named (the author, 2026-11-17, 1:19: "first move the
  // objects, then show the grid and the axis. Dont show the edges yet nor the quark gluon plasma label, then after a
  // second or so, slowly fade in the background")
  edgesStart: 0,
  iconBoost: { from: 21.2, k: 0.6, slugs: { "laniakea-galaxy-supercluster": 0.55 } },
  icons: "all",
  forceIcons: ["Sun", "L Brown Dwarf", "T Brown Dwarf", "Y Brown Dwarf", "Ton 618"],
  captionFixes: { true: "two", balance: "balances", hair: "here", nucleon: "nucleus", nebulas: "nebulae", shard: "chart", weight: "weigh", store: "star", "store's": "star's", rhenium: "uranium", depth: "death" },

  backing: "Immersed",
  sound: [
    { at: "something magical happens", fx: "ignite", offset: 0.3 },
    { at: "catastrophic core collapse", fx: "boom", offset: 0.2 },   // (the boom on the supernova itself, not on "goes haywire": the author, 2026-11-25)
    { at: "become a black hole", fx: "drop", atEnd: true, offset: -0.3 },
    { at: "pool big enough", fx: "bubble", offset: 0.2 },
  ],

  cues: [
    // ── A map of every single thing: the catalogue on black ──
    { t: 0, hold: 999, hl: [{ catalogue: { phase: "start" }, out: 1.6 }] },
    CQ("every star", "sun"),
    CQ("every planet", "earth"),
    CQ("galaxy", "milky-way"),
    CQ("animal", "elephant"),
    CQ("rock", "big-rock-okotoks"),
    CQ("car", "benz-patent-motorwagen"),
    CQ("microbe", "bacteria"),
    CQ("atom", "hydrogen"),
    CQ(["connect to each other", "relate to each other"], "links"),
    CQ(["numbers", "features"], "labels"),
    CQ("rainbow", "light"),
    CQ("float in", "float"),
    CQ("some are round", "round"),
    CQ(["heavier or lighter", "heavy or light"], "heavy"),
    CQ(["bigger, smaller", "big or small"], "big"),
    // to the chart: each picture flies to where the chart has it (the author, 2026-11-17, 1:10), then the chart takes over
    CQ("organize them", "chart"),

    // ── The chart: everything from far away, then the bands and the diagonal ──
    // the catalogue fades into the chart as it is, the painting off (bgStart); then one slow pan and zoom down to the human,
    // the painting fading back in from "this particular diagonal" (the author, 2026-11-17: "from now on its a slow pan and
    // zoom", "1:20 now slowly fade the background as we zoom towards the macro scale")
    { at: "each square", cam: { r: 5.5, m: 14, span: 30, glide: true }, dur: 0.05, bg: { to: 1, dur: 7, after: 1.4 }, hl: [] },
    { at: "fall in bands", cam: { r: 4.0, m: 11.0, span: 21, glide: true }, hl: [WATER, { ...COLUMN, delay: 1.2 }] },
    { at: "particular diagonal", cam: { r: 3.0, m: 9.3, span: 13, glide: true }, edges: { to: 1, dur: 3 }, hl: [{ line: "water", label: "the diagonal" }] },
    // the forces Short's own opening (the "intro" clips, after "What is it?"; the long cut leaves it out): the bands, then
    // the diagonal
    { at: "if you try to map", cam: { r: 4.0, m: 11.0, span: 21, glide: true }, clear: true, hl: [WATER, { ...COLUMN, delay: 1.2 }] },
    { at: "diagonal band", cam: { r: 3.0, m: 9.3, span: 13, glide: true }, hl: [{ line: "water", label: "the diagonal" }] },
    // the four forces: on the human, the tug of war marked on the line
    { at: "delicate dance", cam: { obj: "Human", span: 4.6, glide: true }, clear: true, hl: [WATER, { obj: "Human" }] },
    { at: "tug of war", hl: [WATER, ...GRAV_AT(3.6, false), ...EM_AT(6.2, false)] },
    // the chemical bonds: a few atoms on black, settling at their distance
    // (on until "…the electromagnetic force", the author, 2026-11-17: "the bond animation can last until 1:50")
    { at: ["electrons are attracted", "electrons repel"], hold: 999, hl: [BONDS] },
    { at: "electromagnetic force", offset: 0.2, cam: { obj: "Human", span: 6 }, dur: 0.05, clear: true, hl: [WATER, { obj: "Human", label: "held by chemical bonds" }, ...EM_AT(6.2)] },
    { at: ["gravity keeps pulling", "gravity works"], hl: [WATER, ...EM_AT(6.2, false), ...GRAV_AT(3.6)] },
    // one pan up the line (visual-rules.md: one pan, one direction), the rings ahead of the camera
    { at: "make something too big", cam: UP(6), clear: true, hl: [WATER, { ellipse: [ON_LINE(7.5) + 1.2, 7.5, 0.6, 0.6], rot: 0, label: false, color: "#ffab40" },
      { arrow: true, solid: true, width: 4, color: "#ffab40", from: { r: ON_LINE(7.5) + 1.2, m: 7.5 }, to: { r: ON_LINE(7.5), m: 7.5 }, padEnd: 0, delay: 0.4 },
      { text: "crushes\nunder its\nown weight", at: [ON_LINE(7.5) + 1.0, 8.75], size: 22, color: "#ffab40", delay: 0.5 }] },
    // (the arrows' tips on the line itself: "the blue arrow seems to be placed before the line ends", the author, 2026-11-17)
    { at: "squeeze it too hard", cam: UP(10), clear: true, hl: [WATER, { ellipse: [ON_LINE(12.5) - 1.2, 12.5, 0.6, 0.6], rot: 0, label: false, color: "#4fc3f7" },
      { arrow: true, solid: true, width: 4, color: "#4fc3f7", from: { r: ON_LINE(12.5) - 1.2, m: 12.5 }, to: { r: ON_LINE(12.5), m: 12.5 }, padEnd: 0, delay: 0.4 },
      { text: "its atoms\npush back", at: [ON_LINE(12.5) - 1.2, 11.4], size: 22, color: "#4fc3f7", delay: 0.5 }] },
    { at: "density of atoms", cam: UP(16), clear: true, hl: [{ line: "water", label: "the density of atoms" }] },
    { at: ["stronger than gravity", "gravity is very weak"], cam: UP(19), hl: [WATER, ...GRAV_AT(20.5)] },
    // (no Burj Khalifa: ten decades below the camera, the frame grew to take it in, a slow zoom out before the pan; the
    // author, 2026-11-17, 2:29: "just keep the pan and zoom together so we end up in the same place with a single movement")
    // the line where things turn round already on the way up, as gravity starts to tell (2:35)
    { at: ["the more massive something", "more massive something is"], cam: UP(20.5), hl: [WATER, ROUND_BONDS, { ...ROUND_GRAV, delay: 0.4 }] },
    { at: "very tall buildings", cam: UP(22), hl: [WATER, ROUND_BONDS, ROUND_GRAV] },
    // "we are just panning up now, seeing the round moons" (the author's note); where things turn round marked as in
    // Short 2 (the author, 2026-11-17: "highlight the moment things start getting round, like we do in the other short"):
    // the line between Vesta, lumpy, and Ceres, round, the bonds holding the shape below it and gravity above
    { at: ["at some point", "becomes round"], cam: { r: 7.75, m: 24.1, span: 4.6, glide: true }, hl: [ROUND_BONDS, ROUND_GRAV, { obj: "Mimas" }, { obj: "Ceres", label: "Ceres · round", delay: 0.4 }, { obj: "Pluto", label: false, delay: 0.7 }] },
    { at: "gravity shapes everything", cam: { r: 8.6, m: 27.0, span: 4.6, glide: true }, hl: [ROUND_GRAV, { obj: "Earth", label: "shaped by gravity" }, { obj: "Moon", label: false }] },
    // the giant planets' column
    { at: "atomic scale", cam: { ...G(9.85, 30.9, 2.4), glide: true }, dur: 3.4, ease: "gentle", clear: true, hl: [{ obj: "Jupiter", label: "Jupiter", place: "left" }] },
    { at: ["go up a column", "go up on a column"], hl: [{ obj: "Jupiter", label: false, place: "left" }, ...BD, COLUMN] },
    { at: "not made of ordinary matter", hl: [{ obj: "Jupiter", label: "not ordinary matter inside", place: "left" }, ...BD, { ...COLUMN, draw: 0.01 }] },
    // the atoms crushed: the Squeeze Lab's mode 1 ("show that sim of the degenerate matter forming")
    // (its arrows pointing at each other, as in the bonds: blue between the shells, purple to the other nucleus; red from
    // the edges, the squeeze; the author, 2026-11-17, 3:30)
    // (its last 7 s a slow push in on the nucleus nearest the middle, the fusion opening on the same nuclei at the same size and
    // spacing: the author, 2026-11-20; the nuclei a quarter of the atom, not a tenth, so a close look shows them)
    { at: "these planets are massive", hold: 14, hl: [{ squeeze: { mode: 1, from: 13.2, zoom: [[7, 1], [14.6, 3.2]], follow: [0, 99], boxFollow: true, P: { nucleus: 0.25, arrowsOut: false, arrowsBonds: true, arrowTime: 30, bondPushFrom: 13.4, bondPullFrom: 14.5, bondShare: 0.25,
      // (on "stripped" every shell left pops and the box squeezes the bare nuclei on: the author, 2026-11-22)
      popAllAt: 20.9, popAllSpread: 0.8, endBox2: 0.6, shrink2Time: 4 } } }] },
    { at: "don't get bigger", cam: G(9.85, 31.4, 2.6), clear: true, hl: [{ obj: "Jupiter", label: false, place: "left" }, ...BD, { ...COLUMN, draw: 0.01 }] },
    // "show the super jupiters and brown dwarf branching"
    { at: "bifurcation", cam: { r: 9.9, m: 33.0, span: 3.8 }, dur: 3, drift: 0.02, hl: [{ obj: "L Brown Dwarf", label: false }, ...FORK] },
    // the strong force: the brown dwarfs and Proxima, then the fusion diagram
    { at: "even more mass", cam: { r: 9.85, m: 32.6, span: 3 }, clear: true, hl: [{ obj: "L Brown Dwarf", label: false }, { obj: "Proxima Cen", label: "fusion starts", delay: 0.6 }] },
    // fusion as a simulation (the lab's mode 2, src/squeeze-sim.js; the author, 2026-11-18: "it must be physics-based"):
    // protons in diamonds of four, pushing each other apart, squeezed by the shrinking box (gravity); on "capture them"
    // every four joins at once into one ring that wobbles round, two of each four turning into neutrons; on "large
    // amount of energy" the view centres on one helium and the box flies open, its energy streaming out and throwing the
    // rest off screen; gravity's arrows come back on "counterbalances"
    // (from "a new force", the protons alone first; the strong force's reach on "doesn't reach very far"; the push out from
    // "so strong": the author, 2026-11-20, 3:35–3:50)
    ...[["a new force", "start"], ["doesn't reach very far", "reach"], [["gravity will be so strong", "will be so strong"], "push"], ["capture them", "capture"], ["large amount of energy", "energy"], ["counterbalances", "balance"], ["that's fusion", "fusion"]]
      // (the last fades over 2.4 s, closing in on the helium: the author, 2026-11-20, "zoom in closer at the resulting
      // helium nucleus in the end for 2 more seconds while you fade")
      .map(([at, phase], i) => ({ at, hold: 999, hl: [{ fusionSim: { phase, P: FUSION_P }, instant: i > 0, out: phase === "fusion" ? 2.4 : 0.8 }] })),
    // the main sequence: one slow push in (the author, 2026-11-17, 4:11: "I don't like static cameras")
    { at: ["changes that delicate", "changes the delicate dance"], cam: { r: 10.9, m: 33.1, span: 4.2, glide: true }, dur: 0.05, clear: true, hl: [] },
    { at: "called the main sequence", cam: { r: 11.0, m: 33.15, span: 3.5, glide: true }, hl: [{ obj: "Sun" }, MS, { obj: "Sirius A", delay: 0.4 }] },
    { at: "most of their lives", cam: { r: 11.1, m: 33.2, span: 3.0, glide: true }, hl: [MS, { obj: "Sun", label: "billions of years" }, { obj: "Sirius A", delay: 0.3 }, { obj: "Vega", delay: 0.6 }] },
    { at: "once it runs out", cam: { r: 11.3, m: 33.25, span: 2.8, glide: true }, hl: [{ line: "mainsequence" }, { obj: "Sun", label: "out of hydrogen" }] },
    { at: "goes haywire", cam: { r: 11.85, m: 33.4, span: 3.6, glide: true }, hl: [{ obj: "Sun" }, { arrow: true, from: { obj: "Sun" }, to: { obj: "Red Giant" }, color: "#ff8a50" }, { obj: "Red Giant", label: "the fire goes out", delay: 1 }] },   // (the swelling circle moved to the supernova: the author, 2026-11-25)
    // how stars end: the small ones (the white dwarf and the nebula), the big ones (the supernova), then the weak force
    // (closer, and higher, so the super-Jupiters' column is out of the frame: the author, 2026-11-20, 4:30)
    { at: "small stars", cam: { r: 12.7, m: 35.0, span: 5 }, dur: 3, clear: true, hl: [{ ...LOW, from: "Sun" }, { obj: "White Dwarf", label: "the core left", place: "left", delay: 0.8 }, { obj: "Planetary Nebula", label: "a nebula", delay: 1.6 }] },
    { at: "more massive stars", hl: [HIGH, { obj: "Crab Nebula", label: "supernova", delay: 0.8 }] },
    { at: "catastrophic core collapse", hl: [HIGH, { swing: [{ obj: "Crab Nebula" }, { obj: "Crab Nebula" }], period: 1.2, core: true }, { obj: "Crab Nebula", label: "supernova" }, { obj: "PSR J0030+0451", label: "the core", delay: 0.8 }] },   // (the swelling circle and its boom here only: the author, 2026-11-25, "only on the proper catastrophic core collapse")
    // the weak force, the lab's mode 3, its first ring clenching on "squeeze a proton"; the neutrons settle into a hexagonal
    // grid as soon as the last core has turned to neutrons (hexAt; the author, 2026-11-22, and 2026-11-23: "as soon as the
    // cores transform into all neutrons")
    { at: ["a new player enters", "a new player force"], cam: { r: 8.0, m: 33.5, span: 7 }, dur: 2, hold: 34, hl: [{ squeeze: { mode: 3, from: 11.5, P: { helium: true, hexAt: 21.6, hexTime: 1.6 }, zoom: [[0, 2.4], [34, 3.0]] } }] },   // (the clench still on "if you squeeze": 6.9 s after the cue here since the restart on "what decides what" was cut, 10.2 before, 7.9 in rec74)
    // then no fade: a powers-of-ten zoom out on a square grid, from the neutrons up to the whole neutron star (the author,
    // 2026-11-20, 5:10: "keep a square grid and zoom out, from the atomic scale to the size of a neutron star", src/narr-p10.js);
    // the chart comes back on the neutron star for its collisions
    { at: "this forms a neutron star", cam: { obj: "PSR J0030+0451", span: 3.4 }, dur: 0.05, clear: true, hold: 999, hl: [{ p10: {}, instant: true, out: 1.0 }] },

    // ── The black-hole line (the Black Hole Slope's shots) ──
    // the heavy elements, forged where neutron stars collide
    { at: "the death of massive stars", cam: { r: 8.4, m: 33.7, span: 7.5 }, dur: 3, clear: true, hl: [{ obj: "Crab Nebula", label: "supernova" }, { obj: "PSR J0030+0451", label: "neutron stars colliding", place: "right", delay: 1.4 }] },
    // a cut to black, the three atoms side by side, then uranium alone, the battery (the author, 2026-11-20, 5:30)
    { at: "like gold", hold: 999, hl: [{ atoms: { phase: "start" }, instant: true, out: 0.8 }] },
    { at: "like a battery", hold: 999, hl: [{ atoms: { phase: "battery" }, instant: true, out: 0.8 }] },
    // escape velocity: the tug of war against gravity, half the speed of light on a neutron star
    // the escape speed as the forces Short has it (src/narration.js drawEscape; the author, 2026-11-24: "port the same changes
    // to the long video", and later "it deserves it on the neutron star and orbital part"): the neutron star's model close
    // from "they are thrown out … they escape", its escape speed ring by ring as we pull out with dots in orbit on each, back
    // in on the speed limit with the rings kept, squeezed and shaking till its escape speed is light's, a flash, a black disk
    { at: "they are thrown out", cam: { obj: "PSR J0030+0451", span: 3.4 }, dur: 0.05, clear: true, hold: 999, hl: [{ escape: { phase: "start", intro: 3.2 }, instant: true }] },   // (instant, and the uranium flying out of the star first: no flash of the chart, the author, 2026-11-25, 5:40)
    ...[["works as a universal", "limit"], ["universal speed limit", "light"], ["if you add even more", "dense"], ["will be faster than", "c"], ["strangest of objects", "hole"]]
      .map(([at, phase]) => ({ at, hold: 999, hl: [{ escape: { phase }, instant: true, out: phase === "hole" ? 0.8 : 0.6 }] })),
    { at: "so far our", cam: SO_FAR, dur: 2.6, ease: "gentle", icons: false, forceIcons: [], clear: true, hl: [] },
    { at: "around bands", hl: [WATER] },
    // then in along the line to its groups, up to the super-Jupiters, on to the stars (the author, 2026-11-20)
    { at: "scattered around", cam: { r: 7.3, m: 22.6, span: 12 }, dur: 2.2, hl: [WATER, { ...OV_ROCKS, delay: 0.6 }, { ...OV_TERR, delay: 1.3 }, { ...OV_GIANTS, delay: 2.0 }] },
    { at: "jupiter planets", cam: { r: 9.6, m: 30.6, span: 4.4 }, dur: 1.8, hl: [OV_TERR, OV_GIANTS, OV_COLUMN] },
    { at: "living stars", cam: { r: 10.7, m: 32.8, span: 5 }, dur: 1.8, hl: [OV_COLUMN, OV_STARS] },
    { at: "where stars go to die", cam: { r: 12.6, m: 34, span: 15 }, dur: 4, hl: [OV_STARS, ...CYCLE] },
    { at: "cemetery of dead stars", cam: { r: 7.6, m: 33.8, span: 5 },   // (closer, Jupiter out of the frame: the author, 2026-11-25)
      dur: 3, clear: true, icons: true, forceIcons: null,
      hl: [WD, NS, SBH, { ellipse: [7.45, 33.75, 2.3, 1.15], rot: 0, label: "dead stars", place: "above", color: "#e0e0e0", delay: 1.4 }] },
    { at: "white dwarfs", hl: [{ obj: "White Dwarf", place: "left" }, NS, SBH] },
    { at: "neutron stars", hl: [WD, { obj: "PSR J0030+0451", label: "neutron star", place: "right" }, SBH] },
    { at: ["our weird one", "black holes"], hl: [WD, NS, { obj: "Stellar BH", label: "black hole" }] },
    { at: "not scattered around", cam: { obj: "Sgr A*", span: 15 }, dur: 4, drift: 0.02, clear: true, hl: [KNOWN] },
    { at: "lives exactly on this line", hl: [KNOWN, { ...SCHW, label: "black holes" }] },
    { at: ["this line is special", "this line is very special"], cam: { r: 11, m: 38.6, span: 20 }, dur: 5, hl: [{ line: "triangle" }, { ...SCHW, label: "the first limit" }] },
    { at: "for every object you can see", cam: { r: 4.2, m: 26.6, span: 16 }, dur: 3, hl: [SCHW, { obj: "Moon" }] },
    { at: "if you squeeze them", hl: [SCHW, { obj: "Moon" }, { arrow: true, from: { obj: "Moon" }, to: BH(25.87), label: "squeeze", delay: 0.2 }] },
    { at: "become a black hole", hl: [SCHW, { obj: "Moon" }, { arrow: true, from: { obj: "Moon" }, to: BH(25.87), delay: 0 },
      { cross: BH(25.87), size: "the Moon: 0.2 mm wide", delay: 0.3 }] },
    { at: "never cross this line", cam: { obj: "Sgr A*", span: 15 }, dur: 6, drift: 0.02, clear: true, hl: [{ ...SCHW, label: "nothing crosses it" }] },
    { at: "called the schwarzschild radius", hl: [{ ...SCHW, label: "schwarzschild radius" }] },
    { at: ["the limit of how small", "upper limit in which"], hl: [{ ...SCHW, label: "schwarzschild radius" }, { side: "left", of: "schwarzschild" }] },

    // ── The slope, the black holes we know, how small (the Black Hole Slope's shots) ──
    ...from(S4A.cues, "don't actually have a size").filter(c => ![].concat(c.at).includes("according to relativity")).map(alias),
    // ── The smallest black holes and dark matter (the Smallest Black Holes' shots) ──
    ...(() => { const L = from(S4B.cues, "with enough pressure").map(alias).map(wideLabels), i = L.findIndex(c => [].concat(c.at).some(a => /invisible/.test(a)));
      return [...L.slice(0, i), WINDOW_NS, ...L.slice(i)]; })(),
  ],
};
export default SCENE;
