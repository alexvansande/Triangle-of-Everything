// =============================================================
// sources.mjs — catalogue definitions for the "dust" layer
// =============================================================
// Every dust dot is a REAL, NAMED object pulled from a published
// catalogue. Each source below declares:
//
//   id        short key (stored per dot so the tooltip can say where
//             it came from)
//   label     human-readable source line for the tooltip / docs
//   cat       chart category (colour) — same keys as objects.json
//   cite      the paper / database the numbers come from
//   radius    WHICH radius we plot. Physical objects rarely have one
//             unambiguous "size", so this is written down per source.
//   anchors   textbook values the parsed data must reproduce. A wrong
//             unit conversion or column shift fails the build instead
//             of silently shipping 5,000 misplaced dots.
//   load()    async (fetchText) => [{ name, logR, logM }]   (CGS, log10)
//
// Conventions match objects.json: logR = log10(radius / cm),
// logM = log10(mass / g). Particles sit at their reduced Compton
// wavelength ħ/mc, exactly like the hand-placed "Meson" etc.
// =============================================================

// --- constants (CGS) ---
const G = 6.674e-8;
const C = 2.998e10;
const HBAR = 1.055e-27;
const M_SUN = 1.989e33, R_SUN = 6.957e10;
const M_EARTH = 5.972e27, R_EARTH = 6.3781e8;      // pscomppars uses equatorial R⊕
const AMU = 1.66053906660e-24, M_E = 9.1093837e-28;
const GEV = 1.78266192e-24;                          // g per GeV/c²
const PC = 3.0857e18, KPC = 3.0857e21, MPC = 3.0857e24;
const COMPTON_C = Math.log10(HBAR / C);
const SCHW_C = Math.log10(2 * G / (C * C));

const log = Math.log10;
const num = (s) => {
  if (s == null) return NaN;
  const t = String(s).trim();
  if (t === "" || t === "-" || t === "-999" || t === "-999.00" || t === "NaN") return NaN;
  return Number(t);
};
const ok = (...xs) => xs.every((x) => Number.isFinite(x) && x > 0);
const clean = (s) => String(s).replace(/\s+/g, " ").trim();

// VizieR asu-tsv → array of {col: value}. Skips the #-comment block,
// the units row and the dashes row.
function vizier(text) {
  const lines = text.split("\n").filter((l) => l && !l.startsWith("#"));
  const head = lines[0].split("\t").map((s) => s.trim());
  const rows = [];
  for (const l of lines.slice(3)) {
    const cells = l.split("\t");
    if (cells.length < head.length - 1) continue;
    const o = {};
    head.forEach((h, i) => (o[h] = (cells[i] ?? "").trim()));
    rows.push(o);
  }
  return rows;
}
const VIZ = "https://vizier.cds.unistra.fr/viz-bin/asu-tsv";
const viz = (source, cols, extra = "", max = 100000) =>
  `${VIZ}?-source=${source}&-out=${cols.join(",")}&-out.max=${max}${extra}`;

export const SOURCES = [
  // ---------------------------------------------------------------
  {
    id: "hadron",
    label: "Hadron · PDG 2024",
    cat: "particle",
    cite: "Particle Data Group, Review of Particle Physics (2024) — mass_width_2024.txt",
    url: "https://pdg.lbl.gov/2024/mcdata/mass_width_2024.txt",
    radius: "reduced Compton wavelength ħ/mc (same convention as the hand-placed particles)",
    anchors: [{ name: "pi+", logM: log(0.13957039 * GEV), tol: 0.002 }],
    async load(fetchText) {
      const txt = await fetchText(this.url, "pdg.txt");
      const out = [];
      for (const l of txt.split("\n")) {
        if (!l.trim() || l.startsWith("*")) continue;
        const ids = l.slice(0, 32).trim().split(/\s+/).map(Number);
        const mass = num(l.slice(33, 51));
        // cols 108–128: name left-justified, charge states right-justified
        const m = l.slice(107).trim().match(/^(\S+)\s+(\S+)$/);
        if (!m) continue;
        const name = m[1];
        const charges = m[2].split(",").filter(Boolean);
        // hadrons only: leptons (11–16) and gauge/Higgs bosons (21–25)
        // are already hand-placed in objects.json
        if (!ids.length || Math.abs(ids[0]) < 100 || !ok(mass)) continue;
        const logM = log(mass * GEV);
        charges.forEach((q, i) => {
          if (i > 0 && ids[i] === undefined) return;
          const qs = q.replace(/\+\+/, "⁺⁺").replace(/\+/, "⁺").replace(/-/, "⁻").replace(/0/, "⁰");
          out.push({ name: `${name}${q ? qs : ""}`, logR: COMPTON_C - logM, logM, _key: `${name}${q}` });
        });
      }
      // anchor lookup uses the raw ascii key
      out.forEach((o) => (o._anchor = o._key));
      return out;
    },
  },
  // ---------------------------------------------------------------
  {
    id: "nucleus",
    label: "Atomic nucleus · IAEA charge radii",
    cat: "composite",
    cite: "IAEA Nuclear Data Services, LiveChart ground states (charge radii: Angeli & Marinova 2013; masses: AME2020)",
    url: "https://nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all",
    radius: "measured RMS nuclear charge radius (proton: 0.84 fm, as hand-placed)",
    anchors: [{ name: "Iron-56 nucleus", logR: log(3.7377e-13), logM: log(55.9349 * AMU - 26 * M_E), tol: 0.002 }],
    async load(fetchText) {
      const txt = await fetchText(this.url, "iaea.csv");
      const [head, ...lines] = txt.trim().split("\n");
      const H = head.split(",");
      const iz = H.indexOf("z"), in_ = H.indexOf("n"), isym = H.indexOf("symbol");
      const ir = H.indexOf("radius"), iam = H.indexOf("atomic_mass");
      const ELEM = await elementNames(fetchText);
      const out = [];
      for (const l of lines) {
        const c = l.split(",");
        const z = +c[iz], n = +c[in_], r = num(c[ir]), am = num(c[iam]);
        if (!ok(r, am) || z < 1) continue;
        const a = z + n;
        // atomic mass (µu) minus the electrons → bare-nucleus mass
        const m = (am * 1e-6) * AMU - z * M_E;
        const el = ELEM[z] || c[isym];
        out.push({ name: `${el}-${a} nucleus`, logR: log(r * 1e-13), logM: log(m) });
      }
      return out;
    },
  },
  // ---------------------------------------------------------------
  {
    id: "element",
    label: "Element · Guerra+ (2017) Dirac–Fock radius",
    cat: "atomic",
    cite: "Masses: PubChem periodic table (IUPAC standard atomic weights; mass of the longest-lived isotope where none exists). Radii: Guerra, Amaro, Santos & Indelicato, Atomic Data and Nuclear Data Tables 117–118, 439 (2017), doi:10.1016/j.adt.2017.01.001 — subshell radii of maximum charge density, Z = 1–118, as transcribed in github.com/VictorNorman/orbital-energy-angular (scripts/data/081425-element-data.csv); checked against Waber & Cromer, J. Chem. Phys. 42, 4116 (1965) for Z = 1–102",
    url: "https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON",
    radiiUrl: "https://raw.githubusercontent.com/VictorNorman/orbital-energy-angular/c5bd73606940b9b5f41a9dc4fe0b20b4dcb3869f/scripts/data/081425-element-data.csv",
    radius: "calculated atomic radius: radius of maximum radial charge density of the outermost occupied subshell (largest r_max among occupied subshells), relativistic Dirac–Fock (MCDFGME) ground-state calculation — same definition as Clementi (1967), now relativistic and complete to Z = 118",
    anchors: [
      { name: "Hydrogen", logR: log(52.9e-10), logM: log(1.008 * AMU), tol: 0.01 },
      { name: "Iron", logM: log(55.845 * AMU), tol: 0.002 },
      // independent Dirac–Slater r_max of the same orbitals (Waber & Cromer 1965);
      // Guerra sits a near-constant +0.04 dex above it across Z = 1–102
      { name: "Gold", logR: log(118.7e-10), tol: 0.07 },
      { name: "Francium", logR: log(244.7e-10), tol: 0.07 },
    ],
    async load(fetchText) {
      const pc = JSON.parse(await fetchText(this.url, "pubchem-periodic.json")).Table;
      const cols = pc.Columns.Column;
      const iZ = cols.indexOf("AtomicNumber"), iName = cols.indexOf("Name"), iM = cols.indexOf("AtomicMass");
      // Spreadsheet: row 1 = block titles, row 2 = subshell labels, row 3 = units,
      // then one row per element. The block "Atomic Radius (Rp) - Guerra" holds
      // r_max (pm) for 1s … 7p; only subshells occupied in the ground state are filled.
      const split = (l) => {
        const out = []; let cur = "", q = false;
        for (const ch of l) {
          if (ch === '"') q = !q;
          else if (ch === "," && !q) { out.push(cur); cur = ""; }
          else cur += ch;
        }
        out.push(cur);
        return out;
      };
      const rows = (await fetchText(this.radiiUrl, "guerra2017-radii.csv"))
        .replace(/^\uFEFF/, "").split(/\r?\n/).map(split);
      const start = rows[1].findIndex((s) => s.trim().startsWith("Atomic Radius (Rp) - Guerra"));
      const shells = ["1s", "2s", "2p", "3s", "3p", "3d", "4s", "4p", "4d", "4f", "5s", "5p", "5d", "5f", "6s", "6p", "6d", "7s", "7p"];
      if (start < 0 || shells.some((s, k) => rows[2][start + k].trim() !== s)) throw new Error("element: Guerra radius block not found");
      const rmax = {};
      for (const r of rows.slice(4)) {
        const z = parseInt(r[2], 10);
        if (!(z >= 1 && z <= 118)) continue;
        const v = shells.map((_, k) => num(r[start + k])).filter((x) => ok(x));
        if (v.length) rmax[z] = Math.max(...v);
      }
      const out = [];
      for (const row of pc.Row) {
        const c = row.Cell;
        const z = +c[iZ], mass = num(c[iM]), pm = rmax[z];
        if (!ok(mass, pm)) continue;
        out.push({ name: c[iName], logR: log(pm * 1e-10), logM: log(mass * AMU) });
      }
      return out;
    },
  },
  // ---------------------------------------------------------------
  {
    id: "mammal",
    label: "Mammal species · PanTHERIA",
    cat: "macro",
    cite: "Jones et al. (2009) PanTHERIA, Ecology 90:2648 (Ecological Archives E090-184) — adult body mass & head-body length",
    url: "https://esapubs.org/archive/ecol/E090/184/PanTHERIA_1-0_WR05_Aug2008.txt",
    radius: "half the adult head-body length (as for “Human”: 1.7 m tall → 85 cm)",
    anchors: [{ name: "Balaenoptera musculus", logR: log(3048 / 2), logM: log(1.543213e8), tol: 0.01 }],
    async load(fetchText) {
      const txt = await fetchText(this.url, "pantheria.txt");
      const [head, ...lines] = txt.trim().split("\n");
      const H = head.split("\t");
      const iN = H.indexOf("MSW05_Binomial"), iM = H.indexOf("5-1_AdultBodyMass_g"), iL = H.indexOf("13-1_AdultHeadBodyLen_mm");
      const out = [];
      for (const l of lines) {
        const c = l.split("\t");
        const m = num(c[iM]), len = num(c[iL]);
        if (!ok(m, len)) continue;
        out.push({ name: c[iN], logR: log(len / 10 / 2), logM: log(m) });
      }
      return out;
    },
  },
  // ---------------------------------------------------------------
  {
    id: "smallbody",
    label: "Asteroid · JPL SBDB (measured mass)",
    cat: "planet",
    cite: "NASA/JPL Small-Body Database — bodies with a measured GM and diameter",
    url: "https://ssd-api.jpl.nasa.gov/sbdb_query.api?fields=full_name,GM,diameter&sb-cdata=%7B%22AND%22%3A%5B%22GM%7CDF%22%2C%22diameter%7CDF%22%5D%7D",
    radius: "half the measured mean diameter",
    anchors: [{ name: "1 Ceres", logM: log(62.6284e15 / G), tol: 0.002 }],
    async load(fetchText) {
      const j = JSON.parse(await fetchText(this.url, "sbdb.json"));
      return j.data
        .map(([full, gm, d]) => ({ name: clean(full).replace(/\s*\(.*\)$/, ""), gm: num(gm), d: num(d) }))
        .filter((o) => ok(o.gm, o.d))
        .map((o) => ({ name: o.name, logR: log(o.d * 1e5 / 2), logM: log(o.gm * 1e15 / G) }));
    },
  },
  {
    id: "moon",
    label: "Moon · JPL satellite parameters",
    cat: "planet",
    cite: "NASA/JPL Solar System Dynamics — Planetary Satellite Physical Parameters",
    url: "https://ssd.jpl.nasa.gov/sats/phys_par/",
    radius: "mean radius",
    anchors: [{ name: "Moon", logM: log(4902.8e15 / G), tol: 0.003 }],
    async load(fetchText) {
      const html = await fetchText(this.url, "jpl-sats.html");
      const body = html.slice(html.indexOf("<tbody"), html.indexOf("</tbody>"));
      const out = [];
      for (const tr of body.split("<tr").slice(1)) {
        // the page leaves most <td>s unclosed — split on the opening tag
        const cells = tr.split(/<td[^>]*>/).slice(1).map((s) =>
          s.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").trim());
        if (cells.length < 9) continue;
        const [, sat, , gm, , , r] = cells;
        const GM = num(gm), R = num(r);
        if (!ok(GM, R)) continue;
        out.push({ name: sat, logR: log(R * 1e5), logM: log(GM * 1e15 / G) });
      }
      return out;
    },
  },
  // ---------------------------------------------------------------
  {
    id: "exoplanet",
    label: "Exoplanet · NASA Exoplanet Archive",
    cat: "planet",
    cite: "NASA Exoplanet Archive, Planetary Systems Composite Parameters (pscomppars) — planets with a measured true mass and radius, both to ±25%",
    url: "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?format=csv&query=" + encodeURIComponent(
      "select pl_name,pl_bmasse,pl_bmasseerr1,pl_bmasseerr2,pl_rade,pl_radeerr1,pl_radeerr2,pl_bmassprov,pl_rade_reflink,pl_bmasse_reflink from pscomppars where pl_bmasse is not null and pl_rade is not null"),
    radius: "measured (transit) radius",
    anchors: [{ name: "HD 209458 b", logR: log(1.39 * 7.1492e9), logM: log(0.73 * 1.898e30), tol: 0.06 }],
    async load(fetchText) {
      const rows = csv(await fetchText(this.url, "exoplanets.csv"));
      return rows
        .filter((r) => r.pl_bmassprov === "Mass")
        // pscomppars fills gaps with a mass–radius relation; those are
        // marked "Calculated" — drop them, we want measurements only.
        .filter((r) => !/calculated/i.test(r.pl_rade_reflink) && !/calculated/i.test(r.pl_bmasse_reflink))
        .filter((r) => relErr(r.pl_bmasse, r.pl_bmasseerr1, r.pl_bmasseerr2) < 0.25 &&
                       relErr(r.pl_rade, r.pl_radeerr1, r.pl_radeerr2) < 0.25)
        .map((r) => ({ name: r.pl_name, logR: log(+r.pl_rade * R_EARTH), logM: log(+r.pl_bmasse * M_EARTH) }));
    },
  },
  // ---------------------------------------------------------------
  {
    id: "debcat",
    label: "Star · eclipsing binary (DEBCat)",
    cat: "star",
    cite: "Southworth (2015) DEBCat — detached eclipsing binaries with masses and radii measured to ≲2%",
    url: "https://www.astro.keele.ac.uk/jkt/debcat/debs.dat",
    radius: "measured stellar radius",
    anchors: [{ name: "CM Dra A", logM: -0.6478 + log(M_SUN), tol: 0.001 }],
    async load(fetchText) {
      const txt = await fetchText(this.url, "debcat.dat");
      const out = [];
      for (const l of txt.split("\n")) {
        if (!l.trim() || l.startsWith("#")) continue;
        const c = l.trim().split(/\s+/);
        const sys = c[0].replace(/_/g, " ");
        const [lm1, , lm2, , lr1, , lr2] = c.slice(6, 13).map(Number);
        if (Number.isFinite(lm1) && Number.isFinite(lr1) && lm1 > -9)
          out.push({ name: `${sys} A`, logR: lr1 + log(R_SUN), logM: lm1 + log(M_SUN) });
        if (Number.isFinite(lm2) && Number.isFinite(lr2) && lm2 > -9)
          out.push({ name: `${sys} B`, logR: lr2 + log(R_SUN), logM: lm2 + log(M_SUN) });
      }
      return out;
    },
  },
  {
    id: "host",
    label: "Star · exoplanet host (NASA Exoplanet Archive)",
    cat: "star",
    cite: "NASA Exoplanet Archive pscomppars — host-star mass & radius, both to ±10%",
    url: "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?format=csv&query=" + encodeURIComponent(
      "select distinct hostname,st_mass,st_masserr1,st_masserr2,st_rad,st_raderr1,st_raderr2 from pscomppars where st_mass is not null and st_rad is not null"),
    radius: "stellar radius",
    anchors: [],
    async load(fetchText) {
      const rows = csv(await fetchText(this.url, "hosts.csv"));
      const seen = new Set();
      return rows
        .filter((r) => relErr(r.st_mass, r.st_masserr1, r.st_masserr2) < 0.1 &&
                       relErr(r.st_rad, r.st_raderr1, r.st_raderr2) < 0.1)
        .filter((r) => !seen.has(r.hostname) && seen.add(r.hostname))
        .map((r) => ({ name: r.hostname, logR: log(+r.st_rad * R_SUN), logM: log(+r.st_mass * M_SUN) }));
    },
  },
  {
    id: "gaia",
    label: "Star · Gaia DR3 FLAME",
    cat: "star",
    cite: "Gaia Collaboration (2023), Gaia DR3 astrophysical parameters (FLAME mass & radius), VizieR I/355/paramp",
    radius: "FLAME stellar radius",
    anchors: [],
    // Two slices so the giants are not drowned by the dwarfs; VizieR
    // returns rows in sky order, which is a fair random sample of type.
    async load(fetchText) {
      const out = [];
      for (const [tag, cut, n] of [["dwarfs", "&Rad-Flame=%3C3", 2500], ["giants", "&Rad-Flame=%3E%3D3", 2500]]) {
        const rows = vizier(await fetchText(
          viz("I/355/paramp", ["Source", "Rad-Flame", "Mass-Flame"], `&Mass-Flame=%3E0${cut}`, n), `gaia-${tag}.tsv`));
        for (const r of rows) {
          const R = num(r["Rad-Flame"]), M = num(r["Mass-Flame"]);
          if (ok(R, M)) out.push({ name: `Gaia DR3 ${r.Source}`, logR: log(R * R_SUN), logM: log(M * M_SUN) });
        }
      }
      return out;
    },
  },
  // ---------------------------------------------------------------
  {
    id: "wd",
    label: "White dwarf · Gaia EDR3 (Gentile Fusillo 2021)",
    cat: "remnant",
    cite: "Gentile Fusillo et al. (2021) MNRAS 508, 3877 — VizieR J/MNRAS/508/3877; H-atmosphere fits, P(WD) > 0.9, σM < 0.03 M☉",
    radius: "R = √(GM/g) from the fitted mass and surface gravity",
    anchors: [],
    async load(fetchText) {
      const rows = vizier(await fetchText(
        viz("J/MNRAS/508/3877/maincat", ["WDJname", "MassH", "e_MassH", "loggH", "Pwd"], "&Pwd=%3E0.9&e_MassH=%3C0.03&MassH=%3E0", 3000),
        "wd.tsv"));
      return rows
        .map((r) => ({ name: r.WDJname, M: num(r.MassH), lg: num(r.loggH) }))
        .filter((r) => ok(r.M) && Number.isFinite(r.lg))
        .map((r) => {
          const m = r.M * M_SUN;
          return { name: r.name, logR: 0.5 * log(G * m / 10 ** r.lg), logM: log(m) };
        });
    },
  },
  // ---------------------------------------------------------------
  {
    id: "gw",
    label: "Black hole · LIGO–Virgo–KAGRA merger remnant",
    cat: "blackhole",
    cite: "GWOSC event catalogue (GWTC) — final (remnant) source-frame mass",
    url: "https://gwosc.org/eventapi/json/GWTC/",
    radius: "Schwarzschild radius 2GM/c² (exact, by definition)",
    anchors: [{ name: "GW150914", logM: log(62 * M_SUN), tol: 0.03 }],
    async load(fetchText) {
      const j = JSON.parse(await fetchText(this.url, "gwosc.json"));
      const out = [];
      const seen = new Set();
      for (const ev of Object.values(j.events)) {
        const m = num(ev.final_mass_source);
        if (!ok(m) || seen.has(ev.commonName)) continue;
        seen.add(ev.commonName);
        const logM = log(m * M_SUN);
        out.push({ name: ev.commonName, logR: logM + SCHW_C, logM });
      }
      return out;
    },
  },
  {
    id: "smbh",
    label: "Supermassive black hole · van den Bosch (2016)",
    cat: "blackhole",
    cite: "van den Bosch (2016) ApJ 831, 134 — dynamical & reverberation BH masses, VizieR J/ApJ/831/134",
    radius: "Schwarzschild radius 2GM/c² (exact, by definition)",
    anchors: [],
    async load(fetchText) {
      const rows = vizier(await fetchText(viz("J/ApJ/831/134/table2", ["Name", "logBHMass"]), "smbh.tsv"));
      return rows
        .filter((r) => Number.isFinite(num(r.logBHMass)))
        .map((r) => {
          const logM = num(r.logBHMass) + log(M_SUN);
          return { name: `${clean(r.Name)} BH`, logR: logM + SCHW_C, logM };
        });
    },
  },
  // ---------------------------------------------------------------
  {
    id: "cloud",
    label: "Molecular cloud · Miville-Deschênes (2017)",
    cat: "remnant",
    cite: "Miville-Deschênes, Murray & Lee (2017) ApJ 834, 57 — 8,107 Milky Way CO clouds, VizieR J/ApJ/834/57",
    radius: "cloud equivalent radius at the adopted (near/far) distance",
    anchors: [],
    async load(fetchText) {
      const rows = vizier(await fetchText(
        viz("J/ApJ/834/57/table1", ["Cloud", "INF", "Rnear", "Rfar", "Mnear", "Mfar"]), "clouds.tsv"));
      return rows.map((r) => {
        const far = r.INF === "1";
        const R = num(far ? r.Rfar : r.Rnear), M = num(far ? r.Mfar : r.Mnear);
        return ok(R, M) ? { name: `MD17 cloud ${r.Cloud}`, logR: log(R * PC), logM: log(M * M_SUN) } : null;
      }).filter(Boolean);
    },
  },
  {
    id: "oc",
    label: "Open cluster · Hunt & Reffert (2024)",
    cat: "galaxy",
    cite: "Hunt & Reffert (2024) A&A 686, A42 — Gaia DR3 cluster masses, VizieR J/A+A/686/A42",
    radius: "half-member radius r50",
    anchors: [],
    async load(fetchText) {
      const rows = vizier(await fetchText(
        viz("J/A+A/686/A42/clusters", ["Name", "Type", "r50pc", "MassJ"], "&Type=o"), "oc.tsv"));
      return rows
        .map((r) => ({ name: clean(r.Name).replace(/_/g, " "), R: num(r.r50pc), M: num(r.MassJ) }))
        .filter((r) => ok(r.R, r.M))
        .map((r) => ({ name: r.name, logR: log(r.R * PC), logM: log(r.M * M_SUN) }));
    },
  },
  {
    id: "gc",
    label: "Globular cluster · Baumgardt & Hilker (2018)",
    cat: "galaxy",
    cite: "Baumgardt & Hilker (2018) MNRAS 478, 1520 — VizieR J/MNRAS/478/1520",
    radius: "3-D half-mass radius",
    anchors: [{ name: "NGC 104", logM: log(7.79e5 * M_SUN), tol: 0.01 }],
    async load(fetchText) {
      const rows = vizier(await fetchText(viz("J/MNRAS/478/1520/table2", ["Cluster", "Mass", "rnm"]), "gc.tsv"));
      return rows
        .map((r) => ({ name: clean(r.Cluster), R: num(r.rnm), M: num(r.Mass) }))
        .filter((r) => ok(r.R, r.M))
        .map((r) => ({ name: r.name, logR: log(r.R * PC), logM: log(r.M * M_SUN) }));
    },
  },
  {
    id: "galaxy",
    label: "Galaxy · Updated Nearby Galaxy Catalog",
    cat: "galaxy",
    cite: "Karachentsev, Makarov & Kaisina (2013) AJ 145, 101 — VizieR J/AJ/145/101; mass within the Holmberg radius",
    radius: "Holmberg radius (half the 26.5 mag/arcsec² isophote diameter A26)",
    anchors: [],
    async load(fetchText) {
      const rows = vizier(await fetchText(viz("J/AJ/145/101", ["Name", "A26", "M26"]), "ungc.tsv"));
      return rows
        .map((r) => ({ name: clean(r.Name), D: num(r.A26), lm: num(r.M26) }))
        .filter((r) => ok(r.D) && Number.isFinite(r.lm))
        .map((r) => ({ name: r.name, logR: log(r.D / 2 * KPC), logM: r.lm + log(M_SUN) }));
    },
  },
  {
    id: "cluster",
    label: "Galaxy cluster · MCXC",
    cat: "largescale",
    cite: "Piffaretti et al. (2011) A&A 534, A109 — MCXC X-ray cluster meta-catalogue, VizieR J/A+A/534/A109",
    radius: "R500 (radius enclosing 500× the critical density — so M500 and R500 are tied by definition)",
    anchors: [],
    async load(fetchText) {
      const rows = vizier(await fetchText(viz("J/A+A/534/A109/mcxc", ["MCXC", "OName", "M500", "R500"]), "mcxc.tsv"));
      return rows
        .map((r) => ({ name: clean(r.OName) || clean(r.MCXC), R: num(r.R500), M: num(r.M500) }))
        .filter((r) => ok(r.R, r.M))
        .map((r) => ({ name: r.name, logR: log(r.R * MPC), logM: log(r.M * 1e14 * M_SUN) }));
    },
  },
];

// --- helpers ---
function csv(text) {
  const lines = text.trim().split("\n");
  const split = (l) => {
    const out = []; let cur = "", q = false;
    for (const ch of l) {
      if (ch === '"') q = !q;
      else if (ch === "," && !q) { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return out;
  };
  const H = split(lines[0]);
  return lines.slice(1).map((l) => {
    const c = split(l); const o = {};
    H.forEach((h, i) => (o[h] = c[i] ?? ""));
    return o;
  });
}
function relErr(v, e1, e2) {
  const x = Math.abs(num(v)), a = Math.abs(num(e1)), b = Math.abs(num(e2));
  if (!ok(x) || !Number.isFinite(a) || !Number.isFinite(b)) return Infinity;
  return Math.max(a, b) / x;
}
let _elem = null;
async function elementNames(fetchText) {
  if (_elem) return _elem;
  const pc = JSON.parse(await fetchText("https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON", "pubchem-periodic.json")).Table;
  const cols = pc.Columns.Column;
  _elem = {};
  for (const r of pc.Row) _elem[+r.Cell[cols.indexOf("AtomicNumber")]] = r.Cell[cols.indexOf("Name")];
  return _elem;
}
