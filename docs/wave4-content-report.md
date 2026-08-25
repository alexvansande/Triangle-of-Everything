# Wave 4 — Content review (REPORT ONLY — nothing changed)

Generated 2026-08-21. Every factual/mismatch claim was independently fact-checked; verdicts shown. Proposals are for discussion.

## A — Data vs prose mismatches (needs your call: move the dot or fix the text)

### 3k-bh.md  ·  high · mismatch · fact-check: **confirmed**

> At about 4.5 × 10²² kg, it's roughly the mass of our Moon.

**Issue:** The description defines a CMB-temperature (2.7 K) black hole of ~4.5×10²² kg, but the object is plotted at logM 36.78 / logR 8.95 in objects.json — that is ~6×10³³ kg (≈3,000 solar masses) with an 8,900 km Schwarzschild radius, i.e. an intermediate-mass black hole. A Moon-mass black hole would sit at logM ≈ 25.65, logR ≈ −2.2 (Schwarzschild radius ≈ 0.07 mm). Description and dot disagree by ~11 orders of magnitude in mass; the name '3K BH' reads as Kelvin in the text but as kilo-solar-masses in the data.

**Proposal:** Decide which object this is. If the CMB-equilibrium black hole (the wiki link 'Micro_black_holes' suggests so), move the dot to logR ≈ −2.17, logM ≈ 25.65. If it's meant as a ~3,000 M☉ IMBH, rewrite the description accordingly and rename to avoid the Kelvin reading.

<sub>fact-check: The prose is self-consistent (a 2.7 K Hawking-temperature BH is M = 1.227e23 kg·K / 2.725 K ≈ 4.5e22 kg, ~0.6 lunar masses), but the dot at logM 36.78 / logR 8.95 is 6.0e36 g ≈ 3,030 solar masses with an ~8,900 km Schwarzschild radius — an IMBH, not a micro BH. A CMB-equilibrium BH belongs at logM ≈ 25.65, logR ≈ −2.17 (R_s ≈ 0.067 mm). Description and plotted position disagree by ~11 orders of ma</sub>

### laniakea.md  ·  medium · mismatch · fact-check: **confirmed**

> spanning approximately 500 million light-years

**Issue:** Laniakea is plotted at logR 25.88 (radius ≈ 7.6×10²⁵ cm ≈ 80 Mly, i.e. ~160 Mly across) — about 3× smaller than the 500 Mly span in the text. The sibling large-scale entries all follow a radius convention that matches their prose (Boötes Void '330 Mly across' ↔ logR 26.19; KBC Void '2 Gly diameter' ↔ logR 26.98), so Laniakea is the outlier.

**Proposal:** The 500 Mly figure matches Tully et al. (2014), so keep the prose and raise Laniakea's logR in objects.json to ≈26.37 (radius ~250 Mly) to match the voids' convention — or, if the dot stays, adjust the text.

<sub>fact-check: logR 25.88 → 7.6e25 cm = 80 Mly radius = ~160 Mly across, ~3× smaller than the prose. The prose matches Tully et al. 2014 (~160 Mpc ≈ 520 Mly). Sibling entries confirm logR-as-radius convention: Boötes Void logR 26.19 → 164 Mly radius ↔ '330 Mly across'; KBC Void logR 26.98 → 1.01 Gly radius ↔ '2 Gly diameter'. So the dot is the outlier; raising it to logR ≈ 26.37 (250 Mly radius) reconciles it, a</sub>

### hale-bopp.md  ·  medium · mismatch · fact-check: **confirmed**

> Its nucleus is approximately 30 km across—one of the largest ever observed

**Issue:** The object is plotted at logR 6.48 = 30 km radius, i.e. ~60 km across, which matches literature estimates of 40–80 km diameter. The prose appears to quote the radius as the diameter — at 30 km across, the 'one of the largest ever observed' claim also weakens.

**Proposal:** Its nucleus is approximately 60 km across—one of the largest ever observed

<sub>fact-check: logR 6.48 → 3.02e6 cm = 30 km radius = ~60 km diameter, which matches literature estimates (40–80 km, best estimate ~60 km, Fernández 2002). The prose quotes the plotted radius as the diameter, contradicting the dot. At ~60 km across the 'one of the largest ever observed' claim also holds better (second only to Bernardinelli–Bernstein among well-measured nuclei).</sub>

### big-bang.md  ·  low · mismatch · fact-check: **confirmed**

> It is exactly one Planck mass (~20 micrograms) compressed into a single Planck length across.

**Issue:** The Schwarzschild–Compton intersection the file itself defines — and the plotted point (logM −4.813 → 15.4 µg; logR −32.641 → ≈√2 Planck lengths) — is m_P/√2 ≈ 15 µg, not 'exactly one Planck mass' (21.8 µg). The word 'exactly' turns a factor-√2 rounding into a visible contradiction with the dot.

**Proposal:** It is roughly one Planck mass (~15 micrograms) squeezed into about a Planck length across.

<sub>fact-check: The plotted Singularity (objects.json:162, logM -4.813, logR -32.641) computes to 15.38 ug = m_P/sqrt(2) (ratio 0.7067) and R = 1.414 Planck lengths — exactly the Schwarzschild-reduced-Compton intersection the file describes. One Planck mass is 21.8 ug, so 'exactly one Planck mass (~20 micrograms)' contradicts the dot by a factor sqrt(2). The word 'exactly' is the core error; 'roughly ... ~15 micr</sub>

### ton-618.md  ·  high · mismatch · fact-check: **confirmed**

> TON 618: one of the most massive black holes known, at roughly 66 billion solar masses.

**Issue:** The plotted point encodes 6.6 billion solar masses, ten times less than the prose: logM 43.12 → 1.3×10⁴³ g = 6.6×10⁹ M☉, and logR 15.29 is exactly the Schwarzschild radius of that same 6.6×10⁹ M☉ — so both coordinates consistently say 6.6 billion. Literature values are 40–66 billion, so the prose is right and the plotted point is 1 dex low (logM should be ≈44.12, logR ≈16.29). Relatedly, M87* is plotted at logM 42.61 = 2×10⁹ M☉ while the EHT-measured mass celebrated in m87.md's own text is 6.5×10⁹ M☉ (logM ≈43.11).

**Proposal:** Either move the object up 1 dex in objects.json (logM 44.12, logR 16.29) or change the prose to "roughly 6.6 billion solar masses" — currently text and dot disagree by 10×. Consider revisiting M87*'s coordinates at the same time.

<sub>fact-check: Verified 10x text/dot disagreement: logM 43.12 = 1.32e43 g = 6.63 billion M_sun, and logR 15.29 is exactly that mass's Schwarzschild radius — both coordinates encode 6.6 billion. Literature is 40-66 billion, so the prose is defensible and the dot is 1 dex low (logM ~44.12, logR ~16.29 as proposed). M87* side-note verified with one caveat: it is plotted at 2.0e9 M_sun vs the EHT-measured 6.5e9, but</sub>

### observable-universe.md  ·  high · mismatch · fact-check: **confirmed**

> a sphere of radius ~46.5 billion light-years containing all known matter (~10⁵⁶ g). Remarkably, it sits almost exactly on its own Schwarzschild radius.

**Issue:** The object is plotted at logR 28.14 = 1.4×10²⁸ cm ≈ 14.4 billion light-years — the Hubble radius (the axis label at logR 28.14 in data.js is literally "Hubble R") — not the 46.5 Gly comoving radius the prose states. The Schwarzschild claim only works for the plotted point: R_s of 9.3×10⁵⁵ g is 1.38×10²⁸ cm = exactly logR 28.14; at 46.5 Gly the sphere would be ~3.2× larger than its Schwarzschild radius, so the two sentences contradict each other as written.

**Proposal:** Tie the numbers to what is plotted, e.g.: "Everything we can observe — plotted here at the Hubble radius (~14 billion light-years), containing all known matter (~10⁵⁶ g). Remarkably, that sphere sits almost exactly on its own Schwarzschild radius. (Accounting for expansion, the light we see left regions now 46.5 billion light-years away.)"

<sub>fact-check: Verified: plotted logR 28.14 = 1.38e28 cm = 14.6 billion ly, the Hubble radius — and data.js:143 labels logR 28.14 'Hubble R'. The Schwarzschild radius of the plotted mass (10^55.97 g) is logR 28.1418, matching the dot exactly, so the 'sits on its own Schwarzschild radius' claim is true only for the plotted point; at 46.5 Gly the sphere would be 3.17x its Schwarzschild radius. As written the two s</sub>

### primordial-black-hole.md  ·  medium · mismatch · fact-check: **confirmed**

> they weigh as much as an asteroid but are the size of a single atom

**Issue:** The plotted "Smallest Primordial BH" (logR −13.13, logM 14.70) is 5×10¹⁴ g — asteroid-mass, correct — but its radius is 7.4×10⁻¹⁴ cm, which is proton-sized, about 70,000× smaller than an atom (10⁻⁸ cm). On the chart it actually sits just left of the Proton (logR −13.06), so "size of a single atom" contradicts its own plotted position by ~5 orders of magnitude. ("Atom-sized" would be true only for a much heavier ~10¹⁹ g PBH.)

**Proposal:** "they weigh as much as an asteroid but are smaller than a proton"

<sub>fact-check: Plotted Smallest Primordial BH: logM 14.7 → 5×10¹⁴ g (asteroid-mass, and self-consistent — the Schwarzschild radius of 5×10¹⁴ g is 7.4×10⁻¹⁴ cm, exactly the plotted logR −13.13). That radius is proton-scale (proton charge radius 8.4×10⁻¹⁴ cm; the chart's Proton sits at logR −13.06, just right of it) and ~135,000× smaller than an atom (10⁻⁸ cm). Reviewer's parenthetical also checks out: an atom-siz</sub>

### red-blood-cell.md  ·  low · mismatch · fact-check: **confirmed**

> a biconcave disc about 7 micrometers across

**Issue:** The prose figure is correct (RBCs are ~7.5 μm in diameter), but the object is plotted at logR −3.1, and the chart's logR is radius (Earth logR 8.80 = 6,300 km radius; Sun 10.84 = solar radius). 10⁻³·¹ cm = 7.9 μm as a radius means ~16 μm across — the diameter appears to have been entered as the radius, plotting the cell twice its stated size.

**Proposal:** In objects.json change Red Blood Cell logR from −3.1 to ≈ −3.4 (radius 3.75 μm), keeping the prose as is.

<sub>fact-check: The radius convention is verified across anchors: Earth logR 8.8 = 6.31×10⁸ cm (Earth radius 6.371×10⁸), Sun 10.84 = solar radius, Proton −13.06 ≈ proton charge radius. Red Blood Cell at logR −3.1 = 7.9 μm radius = ~16 μm across, twice the (correct) prose figure of ~7 μm diameter — the diameter was evidently entered as the radius. Correct logR for a 3.75 μm radius is −3.43, so the proposed ≈ −3.4 </sub>

### content/tour-content.md  ·  high · mismatch · fact-check: **confirmed**

> The horizontal scale measures the width (or diameter) of objects.

**Issue:** The plotted data is radius, not diameter: Earth sits at logR 8.8 (6,371 km — its radius), the Sun at 10.84 (696,000 km radius), the Observable Universe at the Hubble radius 28.14, and the axis ticks are absolute lengths ("1 meter", "1000 km"). So every astronomical object sits at half the width the copy promises. intro.md says "width", the og/meta description in index.html says "by mass and size", and this step says "width (or diameter)" — three surfaces, and the explicit "(or diameter)" is the one the data contradicts by a factor of 2.

**Proposal:** Either reword to "The horizontal scale measures the size of objects" (dropping the factor-2 claim "(or diameter)"), or — if "width" is the brand — shift astronomical objects' logR to diameters. Author's call; the copy and the data should agree.

<sub>fact-check: The plotted data is radius, not diameter. src/data.js line 111 states logR is 'cm for radius', and objects.json confirms: Earth logR 8.8 = 6,310 km (Earth's radius is 6,371 km), Sun 10.84 = 692,000 km (solar radius 696,000 km), Moon 8.24 = 1,738 km (exactly the lunar radius), Jupiter 9.84 = 69,200 km (equatorial radius 69,911 km), Observable Universe 28.14 = 1.38x10^26 m (the Hubble radius). Axis </sub>

### src/data.js  ·  low · mismatch · fact-check: **confirmed**

> label: "atomic density line"

**Issue:** The microscopic tour step tells the reader "The blue density line is not just the density of water — it is also the density of atoms", but the chart draws a completely different line (green, logDensity −24 ≈ one hydrogen atom per cm³) labeled "atomic density line". Two different lines are both being called the density of atoms, and a reader following the tour will look at the wrong one.

**Proposal:** Rename the −24 line label to what it actually marks, e.g. "interstellar gas (~1 atom/cm³)" — or, if the label stays, reword the tour sentence to "it is also the density of individual atoms themselves" so the two claims can't be confused.

<sub>fact-check: Verified label collision. src/data.js:93 defines a green (#a5d6a7) reference line at logDensity −24 labeled "atomic density line"; 10⁻²⁴ g/cm³ ≈ 0.6 hydrogen atoms per cm³ (m_H = 1.67×10⁻²⁴ g), i.e. interstellar-gas density — not the density of atoms themselves. Meanwhile the microscopic tour step (content/tour-content.md:58) tells the reader "The blue density line is not just the density of water</sub>

### src/tour-data.js  ·  low · mismatch · fact-check: **confirmed**

> nextLabel: "The First Stars",

**Issue:** The recombination step's next button promises "The First Stars", but the step it leads to (atomic-era) is titled "Stars and Galaxies". Every other next-button in the tour matches its destination's title.

**Proposal:** Change the nextLabel to "Stars and Galaxies" — or retitle the atomic-era step "The First Stars" if that's the preferred name.

<sub>fact-check: Verified. src/tour-data.js:240 gives the Recombination step nextLabel "The First Stars", but the destination step (id "atomic-era", line 248) is titled "Stars and Galaxies". Checked all 26 nextLabels: every other one is identical to or an obvious shortening of its destination's title (e.g. "Black Holes" → "The Upper Limit: Black Holes", "Heat Death" → "The Heat Death of the Universe"); this is the</sub>

## B — Broken wiki-links & orphaned files (mechanical once approved)

### electroweak-era.md  ·  medium · mismatch · fact-check: **confirmed**

> the [[Higgs Boson\|Higgs field]] acquires its vacuum expectation value

**Issue:** The object is named 'Higgs' (slug 'higgs'), so '[[Higgs Boson]]' resolves to slug 'higgs-boson', which matches no object and no description file — clicking opens an empty panel instead of flying to the Higgs. The same broken link appears in electroweak.md ('the observation of the [[Higgs Boson]]') and large-hadron-collider.md ('the 2012 discovery of the [[Higgs Boson]]').

**Proposal:** Use [[Higgs|Higgs field]] here, and [[Higgs|Higgs Boson]] in electroweak.md and large-hadron-collider.md (or add a 'higgs-boson' slug/alias).

<sub>fact-check: Verified in code: nameToSlug('Higgs Boson') → 'higgs-boson' (src/main.js:71); objects.json has only 'Higgs' (slug 'higgs', no alias — only water-h2o, big-bang, primordial-black-hole carry explicit slugs) and no higgs-boson.md exists. navigateToObject (main.js:2703) finds no object and falls back to openInfoPanel, which renders DESC_BY_SLUG[slug] || '' — an empty 'Unit reference' panel instead of f</sub>

### big-bang-nucleosynthesis.md  ·  medium · mismatch · fact-check: **confirmed**

> [[Proton & Neutron\|protons and neutrons]] begin fusing into light elements

**Issue:** '[[Proton & Neutron]]' resolves to slug 'proton-neutron', which matches no object and no description file (the objects are 'Proton' and 'Neutron' separately). The link renders but opens an empty panel.

**Proposal:** [[Proton|protons]] and [[Neutron|neutrons]] begin fusing into light elements

<sub>fact-check: nameToSlug('Proton & Neutron') → 'proton-neutron'; no object or description file has that slug (Proton and Neutron are separate objects at logR −13.06). Clicking opens the empty info-panel fallback. Note the same link also appears in quantum-chromodynamics-era.md ('[[Proton & Neutron|protons, neutrons]]'), which the fix should cover too.</sub>

### 1-liter-of-water-sphere.md  ·  medium · mismatch · fact-check: **confirmed**

> navigate: Tonne of Water

**Issue:** No object is named 'Tonne of Water' — the slug resolves to 'tonne-of-water', not the plotted '1 Tonne of Water' (slug '1-tonne-of-water'). The 'Scale up: a tonne of water' button therefore opens the tonne-of-water.md panel — an older duplicate of 1-tonne-of-water.md ('we're not solid cubes', links [[Water Drop]]) — without flying to the object. The sibling 1-liter-of-water.md gets it right with 'navigate: 1 Tonne of Water'.

**Proposal:** Change the frontmatter to 'navigate: 1 Tonne of Water', and consider merging or removing the near-duplicate tonne-of-water.md.

<sub>fact-check: Verified in code: nameToSlug('Tonne of Water') = 'tonne-of-water' (src/main.js:71-83); objects.json has only '1 Tonne of Water' (slug '1-tonne-of-water'), so navigateToObject (main.js:2703) finds no object and falls back to openInfoPanel, which renders tonne-of-water.md as a 'Unit reference' panel without flying to the plotted object. tonne-of-water.md is indeed a near-duplicate of 1-tonne-of-wate</sub>

### hedgehog.md  ·  low · staleness

> Hedgehog: a small spiny mammal with about 5,000–7,000 quills.

**Issue:** There is no 'Hedgehog' object in src/objects.json and no reference to the slug anywhere in src/ or other content files — the description is unreachable, likely left behind when the object was removed or renamed.

**Proposal:** Delete the file, or restore a Hedgehog entry in objects.json if it was dropped accidentally.

### whats-this.md  ·  high · factual · fact-check: **confirmed**

> [[Jupiter]], on the other hand, is actually as dense as a pool noodle and would float in water — if you had a big enough pool!

**Issue:** Jupiter's mean density is 1.33 g/cm³ — denser than water; it sinks. The floats-in-water planet is Saturn (0.69 g/cm³), and saturn.md itself correctly says 'less dense than water'. The claim also contradicts the chart's own plotted point: Jupiter (logR 9.84, logM 30.28) sits on the sink side of the water-density diagonal this very file teaches the reader to use. A pool noodle (~0.03 g/cm³) is nowhere near even Saturn's density. Note this file also appears orphaned (see the stale-files finding), but the error should not survive if it is ever rewired.

**Proposal:** "[[Saturn]], on the other hand, is less dense than water and would float — if you had a big enough pool!" (drop the pool-noodle comparison, or move it to something genuinely that light)

<sub>fact-check: Jupiter's mean density is 1.33 g/cm3 (from its own plotted coordinates logR 9.84 / logM 30.28: 1.37 g/cm3) — denser than water; it sinks, on the sink side of the water diagonal this very file explains. Saturn is the floater (plotted density 0.66 g/cm3), and saturn.md correctly says 'less dense than water'. A pool noodle (~0.03 g/cm3) is far lighter than even Saturn, so dropping or relocating that </sub>

### x-boson.md  ·  high · mismatch · fact-check: **confirmed**

> Hypothetical gauge bosons predicted by [[Grand Unification Theory]] models such as $SU(5)$ and $SO(10)$, with estimated masses of $\sim 10^{15}$ GeV/$c^2$

**Issue:** The plotted object is named "X & Y Bosons*", which nameToSlug() turns into "x-y-bosons" — but this file's slug is "x-boson", so clicking the plotted object (or magnetic-monopole.md's [[X & Y Bosons]] link) opens a sidebar with an EMPTY description. The text is only reachable via grand-unification-theory.md's [[X Boson]] link. (ICON_SLUG_MAP in main.js has the same bug: it maps the icon to "x--y-bosons", double hyphen, which also matches nothing.) Separately, the prose says ~10¹⁵ GeV but the plotted logM −7.75 → 1.78×10⁻⁸ g ≈ 10¹⁶ GeV, 1 dex apart.

**Proposal:** Add "slug": "x-boson" to the "X & Y Bosons*" entry in objects.json (or rename the file x-y-bosons.md), fix the icon-map key, and align the mass wording with the plot, e.g. "$\sim 10^{15}$–$10^{16}$ GeV/$c^2$".

<sub>fact-check: All three sub-claims verified in code. (a) nameToSlug (src/main.js:71) turns "X & Y Bosons*" into "x-y-bosons" ('&' collapses into a single hyphen after '*' is stripped); the objects.json entry has no slug override, and DESC_BY_SLUG is keyed by filename (src/assets.js:112), so the object's sidebar renders DESC_BY_SLUG["x-y-bosons"] || "" — empty. x-boson.md is reachable only via grand-unification-</sub>

### wimp.md  ·  medium · mismatch · fact-check: **confirmed**

> the neutralino of [[Supersymmetry]], and entire generations of underground experiments — [[XENON1T]], LUX, PandaX

**Issue:** Four wiki-links in this file — [[Supersymmetry]], [[XENON1T]], [[Axion]]s, [[Macro Dark Matter|macro dark matter]] — resolve to slugs with no object and no description file, so clicking them opens a blank sidebar panel mislabeled "Unit reference". Same dead-link class elsewhere in my range: matter-era.md and photon-epoch.md link [[Cosmic Microwave Background|recombination]] (slug cosmic-microwave-background: nothing), and quantum-chromodynamics-era.md links [[Proton & Neutron|protons, neutrons]] (slug proton-neutron: nothing).

**Proposal:** Unlink the terms or retarget to pages that exist: e.g. point the dark-matter terms at [[Dark Matter Search|...]]-style targets (dark-matter-search.md exists), split [[Proton & Neutron|protons, neutrons]] into [[Proton|protons]], [[Neutron|neutrons]], and either unlink "recombination" or create a cosmic-microwave-background.md.

<sub>fact-check: Verified by enumerating all object slugs (via nameToSlug) and all description filenames: supersymmetry, xenon1t, axion, macro-dark-matter, cosmic-microwave-background, and proton-neutron each match no object and no .md file. Click path confirmed: navigateToObject (main.js:2703) finds no object, falls through to openInfoPanel → openSidebar isLabel branch (main.js:2874), which hardcodes the category</sub>

### tonne-of-water.md  ·  medium · staleness

> One cubic meter of pure water — exactly one metric tonne. Notice that a [[Human]] is roughly the same width but much lighter: we're not solid cubes

**Issue:** This file is an orphaned older draft: the live object "1 Tonne of Water" resolves to 1-tonne-of-water.md, which contains a rewritten version of this same text ("not solid spheres", hippo aside, [[1 mL of Water]] link). Nothing in the app references slug "tonne-of-water". Same orphan cluster: water-drop.md (older draft of 1-ml-of-water.md, near-identical first sentence), whats-this.md (referenced nowhere; its navigate target "Water Drop" and water-drop.md's navigate target "1 Liter of Water (sphere)" match no object), and supercluster.md (referenced nowhere — "Supercluster" is not an object or label slug).

**Proposal:** Delete tonne-of-water.md, water-drop.md, whats-this.md, and supercluster.md, or rewire them (e.g. give whats-this.md an entry point and retarget its navigate to "1 mL of Water") — as-is they are dead weight that will silently drift out of date.

### nickel.md  ·  medium · staleness

> A US nickel coin: 5 grams of copper-nickel alloy, 21 mm across.

**Issue:** The plotted coin object is a "Penny" (logM 0.40 → 2.5 g; logR −0.02 → ~19 mm — exactly a US penny), and slug "penny" has no description file at all, so clicking the Penny on the chart shows an empty panel. nickel.md is reachable only via the [[Nickel|coin]] link inside the orphaned water-drop.md. It looks like the object was switched from nickel to penny without moving the description.

**Proposal:** Either add a penny.md ("A US penny: 2.5 grams of copper-plated zinc, 19 mm across...") and retire nickel.md, or rename the object back to Nickel so the existing file and its manifest image attach.

## C — Plain factual / grammar / staleness fixes (batch-approvable)

### grand-unification-theory.md  ·  high · factual · fact-check: **confirmed**

> corresponding to length scales of $\sim 10^{-32}$ cm

**Issue:** The Compton wavelength ħ/mc at 10¹⁶ GeV is ≈2×10⁻³⁰ cm, not 10⁻³² cm — off by two orders of magnitude. The chart itself agrees with the correct value: the X & Y bosons are plotted at logR −29.7 (≈2×10⁻³⁰ cm) in objects.json, so the prose contradicts the plotted position it describes.

**Proposal:** corresponding to length scales of $\sim 10^{-30}$ cm

<sub>fact-check: ħc/E = 1.97e-14 GeV·cm / 1e16 GeV ≈ 2e-30 cm. The correct figure is ~10⁻³² m = ~10⁻³⁰ cm; the text pasted the meters value with cm units. The site's own data agrees: X & Y bosons are plotted at logR −29.7 (2e-30 cm) in src/objects.json, so the prose contradicts the plotted position by two orders of magnitude.</sub>

### grain-of-sand.md  ·  medium · factual · fact-check: **confirmed**

> There are roughly as many grains of sand on Earth as there are stars in the observable universe.

**Issue:** Estimates put Earth's beach-and-desert sand at ~10¹⁸–10¹⁹ grains and stars at ~10²²–10²⁴ — stars win by three to five orders of magnitude. On a map whose whole point is orders of magnitude this stands out, and the site's own bacterium.md handles the analogous comparison correctly ('more than all the stars in the observable universe').

**Proposal:** For every grain of sand on Earth's beaches, there are thousands of stars in the observable universe.

<sub>fact-check: Standard estimates: ~7.5e18 grains on Earth's beaches and deserts vs ~1e22–1e24 stars — stars win by roughly 3–5 orders of magnitude. Even generous all-sand estimates don't close the gap. The site's own bacterium.md handles the analogous comparison correctly ('roughly 5 × 10³⁰ bacteria ... more than all the stars in the observable universe'), so this line is both wrong and internally inconsistent </sub>

### iceberg-a-23a.md  ·  medium · factual · fact-check: **confirmed**

> remained grounded on the seafloor for 37 years before drifting free around 2020

**Issue:** Internally inconsistent: 1986 + 37 years = 2023, not 'around 2020'. A-23a began stirring around 2020 but only broke free of the Weddell Sea grounding in 2023.

**Proposal:** remained grounded on the seafloor for more than three decades before finally breaking free in 2023

<sub>fact-check: Internally inconsistent: 1986 + 37 years = 2023, not 'around 2020'. Historically, A-23a began shifting around 2020 but only broke free of its Weddell Sea grounding in 2023 and drifted north from late 2023 onward. Either date choice requires fixing the sentence; the proposed rewrite ('more than three decades ... breaking free in 2023') is accurate.</sub>

### iron.md  ·  low · factual · fact-check: **confirmed**

> beyond iron, stars must explode as supernovae to forge heavier elements

**Issue:** Roughly half the elements heavier than iron form via slow neutron capture inside AGB stars with no explosion — as the site's own agb-star.md says ('heavy elements forged in its interior'), and gold.md credits neutron star collisions. The three files quietly contradict each other.

**Proposal:** beyond iron, fusion stops paying — heavier elements are forged in supernovae, merging neutron stars, and the slow simmer of aging giant stars

<sub>fact-check: Wrong as an absolute: roughly half of trans-iron elements form by slow neutron capture (s-process) in AGB stars with no explosion, and r-process gold is now credited mainly to neutron star mergers. The site's own agb-star.md ('heavy elements forged in its interior') and gold.md ('forged in neutron star collisions') contradict iron.md. The file's preceding clause about fusion ending at iron is fine</sub>

### jupiter.md  ·  low · factual · fact-check: **confirmed**

> It contains enough hydrogen and helium that it nearly qualifies as a small companion to the Sun.

**Issue:** Overstates the 'failed star' myth: Jupiter would need roughly 13× its mass to fuse deuterium (brown dwarf) and ~80× to shine as a star — 'nearly qualifies' isn't close. Also in this file, '95 moons' is a moving count already superseded.

**Proposal:** It is made of the same ingredients as the Sun — hydrogen and helium — but would need about 80 times more mass to shine as a star. And soften the count: 'nearly a hundred known moons'.

<sub>fact-check: Overstated: Jupiter is ~1/1048 the Sun's mass; it would need ~13x its mass to fuse deuterium (brown dwarf) and ~80x to shine as a star — 'nearly qualifies' is not close. The secondary point also holds: Jupiter's recognized moon count passed 95 in 2025-2026 (101 numbered as of March 2026, ~115 including newly announced), so '95 moons' is stale.</sub>

### bennu.md  ·  low · factual · fact-check: **confirmed**

> visited by NASA's OSIRIS-REx spacecraft in 2020

**Issue:** OSIRIS-REx arrived at Bennu in December 2018; October 2020 was the touch-and-go sample collection, not the visit.

**Proposal:** visited by NASA's OSIRIS-REx spacecraft, which arrived in 2018 and snatched a sample from its surface in 2020

<sub>fact-check: OSIRIS-REx arrived at Bennu on December 3, 2018 and surveyed it for nearly two years; October 20, 2020 was the touch-and-go sample collection, not the visit. The proposed fix (arrived 2018, sampled 2020) is accurate; the rest of the sentence (Sept 2023 return, first U.S. asteroid sample return) is correct.</sub>

### ngc-1277.md  ·  medium · staleness

> the supermassive black hole weighs about 17 billion solar masses

**Issue:** The 17-billion-M☉ figure is the original 2012 van den Bosch estimate, which was famously revised down to roughly 5 billion M☉ (Walsh et al. 2016, ~4.9×10⁹). The revised value still supports the paragraph's point (an outsized black hole for a compact galaxy), but the number as printed is a decade stale.

**Proposal:** "the supermassive black hole weighs roughly 5 billion solar masses — an outsized fraction of the galaxy's total mass" (or hedge: "early estimates ran as high as 17 billion; current measurements put it near 5 billion")

### sirius-b.md  ·  medium · factual · fact-check: **confirmed**

> a teaspoon would weigh about a tonne

**Issue:** Sirius B's plotted values (logR 8.77, logM 33.31 → ~1 M☉ in an Earth-sized sphere) give a mean density of ~2.4×10⁶ g/cm³, so a 5 mL teaspoon weighs ~12 tonnes, not ~1. It also contradicts white-dwarf.md's own "A teaspoon of white dwarf material would weigh several tonnes" — Sirius B is denser than a typical white dwarf, yet this file gives it the lighter teaspoon.

**Proposal:** "a teaspoon would weigh over ten tonnes" (or match white-dwarf.md's "several tonnes" if you prefer one consistent figure)

<sub>fact-check: Plotted values (logR 8.77, logM 33.31) give R = 5,890 km, M = 1.03 M☉, mean density 2.4×10⁶ g/cm³ — matching Sirius B's real parameters — so a 5 mL teaspoon is ~12 tonnes, an order of magnitude above "about a tonne". Also confirmed the internal inconsistency: white-dwarf.md line 6 says "A teaspoon of white dwarf material would weigh several tonnes", yet the denser-than-typical Sirius B gets the li</sub>

### planck-energy.md  ·  medium · factual · fact-check: **confirmed**

> The Planck energy represents an amount so large that it has only occurred once in our universe—the very beginning.

**Issue:** The Planck energy is ~1.96×10⁹ J — about the chemical energy in a car's tank of gasoline — so as an *amount* it occurs constantly; what is unique is that energy concentrated in a single quantum or collision. As written the sentence is wrong, and it is boilerplate repeated verbatim (two full paragraphs) in four files: planck-energy.md, planck-length.md, planck-mass.md, planck-time.md — any fix must be applied to all four.

**Proposal:** "The Planck energy is, in everyday terms, about a tank of gasoline's worth — but concentrated into a single particle, it has occurred only once in our universe: the very beginning." (and consider deduplicating the shared intro rather than maintaining four copies)

<sub>fact-check: Planck energy = 1.96×10⁹ J ≈ 543 kWh ≈ the chemical energy in ~57 L of gasoline — as an amount it is mundane and occurs constantly; only its concentration into a single quantum is unique. The sentence as written is wrong. Boilerplate duplication verified: the sentence appears verbatim in all four files (planck-energy.md, planck-length.md, planck-mass.md, planck-time.md), so any fix must touch all </sub>

### planck-mass.md  ·  low · factual · fact-check: **confirmed**

> It is roughly the mass of a grain of dust (~22 μg)

**Issue:** Internal contradiction: paragraph 2 of the same file (the shared boilerplate) says the Planck mass is "about the mass of a grain of sand". Sand is the better comparison — a fine sand grain is tens of μg, and the chart's own Grain of Sand (logM −3.8 ≈ 160 μg) is within one order of magnitude of 22 μg, while dust grains are orders of magnitude lighter.

**Proposal:** "It is roughly the mass of a fine grain of sand (~22 μg)" — matching the boilerplate two paragraphs up.

<sub>fact-check: Internal contradiction verified: planck-mass.md line 3 (shared boilerplate) says "about the mass of a grain of sand", line 5 says "grain of dust". Physics favors sand: a 0.25 mm quartz grain is ~22 μg — essentially exactly the Planck mass — and the chart's own Grain of Sand (logM −3.8 = 158 μg) is within one decade, while typical dust grains (<10 μm) are nanograms or less, 3+ orders of magnitude t</sub>

### mars.md  ·  low · factual · fact-check: **confirmed**

> the tallest volcano in the Solar System at 21.9 km, nearly three times the height of Mount Everest

**Issue:** 21.9 km ÷ 8.849 km (mt-everest.md's own figure) = 2.5×, which is "about two and a half times", not "nearly three times".

**Proposal:** "at 21.9 km, about two and a half times the height of Mount Everest"

<sub>fact-check: By the file's own numbers: 21.9 / 8.849 (mt-everest.md states 8,849 m) = 2.47×, which is "about two and a half times", not "nearly three". Minor caveat for the author: "three times Everest" claims in the wild use Olympus Mons's ~26 km base-to-peak relief figure — but with the 21.9 km datum height the text itself cites, the multiplier is 2.5×, so as written the sentence is internally inconsistent.</sub>

### content/tour-content.md  ·  high · factual · fact-check: **confirmed**

> When energy levels reach ten trillion trillion kelvin, a new particle is believed to emerge, called the X & Y boson

**Issue:** Ten trillion trillion is 10^25 — that is the GUT scale in electron-volts, not kelvin. The chart's own conversion (src/data.js: GRAND UNIFICATION band at logM −7.75; log T = logM + 36.81) puts the GUT temperature at ~10^29 K. The number matches the eV value but the unit says kelvin, an error of four orders of magnitude on the very quantity this step is about.

**Proposal:** When energy levels reach ten trillion trillion electron-volts, a new particle is believed to emerge, called the X & Y boson (or keep kelvin and write "a hundred thousand trillion trillion kelvin")

<sub>fact-check: Ten trillion trillion is 10^25, which is the GUT scale in eV, not kelvin. Verified against the chart's own data: src/data.js line 791 puts GRAND UNIFICATION at logM -7.75, and data.js's conversions (log E/eV = logM + 32.75; log T/K = logM + 36.81) give exactly 10^25.0 eV but 10^29.06 K. Independently, the GUT scale ~10^16 GeV = 10^25 eV corresponds to ~10^29 K (1 eV = 11,605 K). The number is righ</sub>

### content/tour-content.md  ·  medium · factual · fact-check: **confirmed**

> photons start being able to freely flow for the first time and the first light appears

**Issue:** The recombination step reverses cause and effect: it has photons flowing free first, and only afterwards "Left behind in this condensation are electrons that combine with nuclei to form the first true atoms." Physically it is the other way around — electrons bind into atoms first, and the disappearance of free electrons is what lets photons stream freely. Also the electrons are not "left behind" by the condensation; they are consumed by it.

**Proposal:** Reorder: "Electrons combine with nuclei to form the first true atoms. With the free electrons gone, photons can flow freely for the first time and the first light appears — the universe is expanding so fast that some of that light is only now reaching us."

<sub>fact-check: The recombination step (tour-content.md line 121) does reverse cause and effect: it has photons flowing free first, with electrons combining into atoms mentioned afterward as 'left behind'. Physically, electrons bind to nuclei first (recombination), and the resulting disappearance of free electrons — which had been Thomson-scattering the photons — is what allows photons to decouple and stream free</sub>

### content/tour-content.md  ·  medium · factual · fact-check: **confirmed**

> Many end in supernovae, leaving a remnant behind, depending on their size: from white dwarfs to neutron stars to black holes.

**Issue:** White dwarfs are not supernova remnants — Sun-like stars shed their envelopes gently (planetary nebulae) and leave white dwarfs without exploding; only massive stars go supernova, leaving neutron stars or black holes. Also the remnant type depends on mass, not size — and on this chart mass and size are different axes, so the distinction matters.

**Proposal:** "What remains depends on their mass: most stars leave white dwarfs behind, while the largest end in supernovae, leaving neutron stars or black holes."

<sub>fact-check: White dwarfs are not supernova remnants. Stars below ~8 solar masses (the large majority) shed their envelopes as planetary nebulae and leave white dwarfs without exploding; only massive stars undergo core-collapse supernovae, leaving neutron stars or black holes. As written, the sentence folds white dwarfs into the supernova outcome. The secondary point also stands: remnant type depends on mass, </sub>

### content/tour-content.md  ·  medium · factual · fact-check: **confirmed**

> Eventually the pressure is so large that atoms themselves break, releasing an enormous amount of energy

**Issue:** Star ignition is fusion — atomic nuclei joining together — not atoms breaking apart. "Atoms themselves break" reads as ionization or fission, neither of which is the energy source that makes it "now a star".

**Proposal:** "Eventually the pressure is so large that atomic nuclei begin to fuse, releasing an enormous amount of energy and expanding the object again — it's now a star!"

<sub>fact-check: Star ignition is nuclear fusion — hydrogen nuclei joining into helium — not atoms breaking apart. 'Atoms themselves break' describes ionization (which absorbs energy) or fission (which is not what powers stars), so the phrase misstates the energy source of the sentence's own payoff ('it's now a star!'). The matter in the run-up is already ionized/degenerate per the preceding sentence, making 'atom</sub>

### content/tour-content.md  ·  medium · factual · fact-check: **confirmed**

> a theoretical particle so dense and heavy that their Compton wavelength reaches the Schwarzschild radius, meaning both quantum physics and special relativity forbid it from existing

**Issue:** The Schwarzschild radius belongs to general relativity, not special relativity — it's gravity, not just high speed, doing the forbidding here. Secondary grammar slip in the same sentence: "a theoretical particle ... their Compton wavelength ... forbid it" mixes singular and plural.

**Proposal:** "a theoretical particle so dense and heavy that its Compton wavelength reaches its Schwarzschild radius, meaning both quantum physics and general relativity forbid it from existing"

<sub>fact-check: The Schwarzschild radius comes from general relativity (Schwarzschild's 1916 solution to Einstein's field equations); gravity, not special-relativistic kinematics, is what forbids the object here. The correct pairing at the Planck scale is quantum mechanics vs general relativity. The grammar slip is also real: 'a theoretical particle ... their Compton wavelength ... forbid it' mixes singular and p</sub>

### content/intro.md  ·  medium · grammar

> too small and quantum effects turns it into a particle-antiparticle pair; and too big then the expansion of spacetime is faster than the speed of light

**Issue:** Two grammar slips in the landing text, the first thing every visitor reads: "quantum effects turns" (subject–verb disagreement) and "and too big then the expansion..." (breaks the "too X and Y happens" parallel structure of the other two clauses).

**Proposal:** "too small and quantum effects turn it into a particle-antiparticle pair; and too big and the expansion of spacetime is faster than the speed of light, preventing us from ever knowing about it"

### content/tour-content.md  ·  low · factual · fact-check: **confirmed**

> For a fraction of a fraction of a second — a few billion Planck time units — it was still incomprehensibly hot and dense.

**Issue:** The GUT epoch runs to ~10^-36 s (matching this era's hubbleLogR of −25.5 in src/tour-data.js), which is about 2×10^7 Planck times — tens of millions, not "a few billion". Off by roughly 100×.

**Proposal:** "— a few tens of millions of Planck time units —"

<sub>fact-check: The chart's own GUT-era timestamp (src/tour-data.js: gut hubbleLogR -25.5, with the file's stated formula hubbleLogR = 10.48 + log10(t)) gives t = 10^-36.0 s. Dividing by the Planck time (5.39x10^-44 s) yields 1.9x10^7 — about twenty million Planck times, not billions. Even the label in data.js ('GUT 10^-36 s') agrees. 'A few billion' (10^9) would correspond to ~5x10^-35 s, roughly 100x too long. </sub>

### content/tour-content.md  ·  low · factual · fact-check: **confirmed**

> One liter of water is, by its own metric definition, a cube 10cm wide and weighs exactly 1 kilogram.

**Issue:** A liter is the volume of such a cube, not the cube itself; and "weighs exactly 1 kilogram" is the original 1795 definition, not the current one (the kilogram is now defined via Planck's constant, and a liter of water weighs about 0.998 kg at room temperature). "Exactly" overclaims.

**Proposal:** "One liter of water fills a cube 10 cm wide and, by the original metric definition, weighs one kilogram."

<sub>fact-check: Confirmed, though minor in severity. Two genuine inaccuracies: (1) a liter is the volume of a 10 cm cube (a cubic decimeter), not the cube itself — a category slip, if a forgivable one; (2) 'by its own metric definition ... weighs exactly 1 kilogram' is the 1795 definition, not the current one — since 2019 the kilogram is defined via Planck's constant, and a liter of water masses ~0.9982 kg at 20 </sub>

### content/tour-content.md  ·  low · clarity

> The very first force to separate at the Big Bang was gravity, leading to the very emergence of time.

**Issue:** The previous step (the-beginning) already narrated this moment: "Gravity separates from the others, and the universe starts creating space between itself." Read as one continuous story, the gut step re-introduces the same event as if new. Also "the very first ... the very emergence" doubles "very" in one sentence.

**Proposal:** Open the gut step from where the last one left off, e.g. "With gravity gone its own way, all remaining forces were still one." — dropping the re-telling.

### content/tour-content.md  ·  low · clarity

> The more energetic the element, the smaller the area it can occupy.

**Issue:** "Element" reads as chemical element — which the tour discussed two steps earlier ("most of the periodic table lies along it") — but this sentence is about particles and photons on the Compton line.

**Proposal:** "The more energetic the particle, the smaller the area it can occupy."

### content/tour-content.md  ·  low · typo

> The last black hole will evaporate in roughly 10^100 years.

**Issue:** The tour renderer (markdownToHtml in src/tour.js) has no superscript handling, so this displays literally as "10^100" with a caret — breaking the typographic style used elsewhere ("E=mc²" in the compton step, "10¹³ s" on chart labels).

**Proposal:** Use Unicode superscripts: "roughly 10¹⁰⁰ years".

---

## Images — 67 of 180 objects have no sidebar photo

Inventory: 180 objects in src/objects.json; 113 (63%) have a sidebar photo in content/images/*.webp (matched via nameToSlug in src/main.js:167); 67 (37%) have none. Recommendations: 22 "wikipedia" with a verified Commons candidate (21 unique files — the Hubble Sirius frame serves both sirius-a and sirius-b; all licenses confirmed CC-BY/CC-BY-SA/PD by fetching each Commons file page, except alpha-centauri-a which was confirmed via search-result summary only), 24 "wikipedia" with empty candidate (exemplar suggestions in notes), 14 "generate" (quarks, neutrinos, hypothetical particles, primordial/3K black holes, cosmic voids, heat death — matching the existing spirograph art already used for top/charm/higgs/electron/neutrino-mu), and 7 "skip" (water reference quantities, generic duplicates like Heaviest NS/Massive WD/Horizontal Branch). Manifest problems (content/images/manifest.json, 110 entries): (1) 20 entries have license "Unknown" — 19 are the app's own generated particle/EM-band art (higgs, top, electron, gamma-ray, x-ray, ultraviolet, visible-light, infrared, microwave, fm-radio, am-radio, proton, neutron, neutrino-mu, z, w, tau, charm, meson) and should presumably say "Generated Image / Public Domain" like the dna/glucose/atp entries; the 20th is nickel. (2) nickel.webp matches NO object in objects.json (the object is "Penny") — orphaned file with credit/license "Unknown" sourced from an en-wiki file (US_Nickel_Obverse.jpeg) that may be non-free. (3) muon is licensed "Fair use" from an en.wikipedia file (Moon's shadow in muons.gif) — not an allowed license; should be replaced. (4) helium is "GFDL 1.2" only — not in the allowed set (Alchemist-hp images are normally dual FAL/GFDL; the iron entry correctly says FAL). (5) oxygen is "PD-US" sourced from en.wikipedia, worth re-verifying. (6) tobacco-mosaic credit is the duplicated string "Unknown authorUnknown author"; supertanker and oganesson have credit "Unknown". (7) earth and stellar-nursery use the vague label "Attribution". (8) Four webp files have no manifest entry at all: carbon, gold, hydrogen, water-h2o.

### Ready to fetch (verified Commons candidates + licenses)

| object | candidate | license |
|---|---|---|
| M87* (m87) | https://commons.wikimedia.org/wiki/File:Black_hole_-_Messier_87_crop_max_res.jpg | CC BY 4.0 |
| Ton 618 (ton-618) | https://commons.wikimedia.org/wiki/File:TON_618_SDSS9.jpg | CC BY-SA 4.0 |
| Betelgeuse (betelgeuse) | https://commons.wikimedia.org/wiki/File:Betelgeuse_captured_by_ALMA.jpg | CC BY 4.0 |
| Sirius A (sirius-a) | https://commons.wikimedia.org/wiki/File:Sirius_A_and_B_Hubble_photo.editted.PNG | Public domain |
| Sirius B (sirius-b) | https://commons.wikimedia.org/wiki/File:Sirius_A_and_B_Hubble_photo.editted.PNG | Public domain |
| Proxima Cen (proxima-cen) | https://commons.wikimedia.org/wiki/File:New_shot_of_Proxima_Centauri,_our_nearest_neighbour.jpg | CC BY 4.0 |
| Alpha Centauri A (alpha-centauri-a) | https://commons.wikimedia.org/wiki/File:Best_image_of_Alpha_Centauri_A_and_B.jpg | CC BY 4.0 |
| TRAPPIST-1 (trappist-1) | https://commons.wikimedia.org/wiki/File:Artist%E2%80%99s_impression_of_the_TRAPPIST-1_planetary_system.jpg | CC BY 4.0 |
| Kepler-22b (kepler-22b) | https://commons.wikimedia.org/wiki/File:Kepler22b-artwork.jpg | Public domain |
| Beta Pictoris b (beta-pictoris-b) | https://commons.wikimedia.org/wiki/File:Beta_Pictoris_b_(artist%E2%80%99s_impression).jpg | CC BY 4.0 |
| Barnard 68 (barnard-68) | https://commons.wikimedia.org/wiki/File:Barnard_68.jpg | CC BY 4.0 |
| Bubble Nebula (bubble-nebula) | https://commons.wikimedia.org/wiki/File:The_Bubble_Nebula_-_NGC_7635_-_Heic1608a.jpg | Public domain |
| Wolf-Rayet (wolf-rayet) | https://commons.wikimedia.org/wiki/File:WR_124_(MIRI)_(52752549831).png | CC BY 2.0 |
| Observable Universe (observable-universe) | https://commons.wikimedia.org/wiki/File:Observable_universe_logarithmic_illustration.png | CC BY-SA 3.0 |
| Laniakea (laniakea) | https://commons.wikimedia.org/wiki/File:07-Laniakea_(LofE07240).png | CC BY-SA 4.0 |
| Hemoglobin (hemoglobin) | https://commons.wikimedia.org/wiki/File:1GZX_Haemoglobin.png | CC BY-SA 3.0 |
| Insulin (insulin) | https://commons.wikimedia.org/wiki/File:InsulinHexamer.jpg | CC BY 2.5 |
| Antibody (IgG) (antibody-igg) | https://commons.wikimedia.org/wiki/File:Antibody_IgG2.png | Public domain |
| Neutron Star (neutron-star) | https://commons.wikimedia.org/wiki/File:Neutron_star_illustrated.jpg | Public domain |
| Magnetar (magnetar) | https://commons.wikimedia.org/wiki/File:SGR_1806-20_108536main_NeutronStar-Print1.jpg | Public domain |
| Penny (penny) | https://commons.wikimedia.org/wiki/File:US_One_Cent_Obv.png | Public domain |

### Wikipedia-sourceable, candidate TBD

- **Ribosome** (ribosome) — Pick a PDB-based molecular render to match the hemoglobin/antibody style (Commons Category:Ribosomes has several 70S/80S renders); the top search hit File:Ribosome_Structure.png is a labeled textbook diagram, not a render — avoid it.
- **Stellar BH** (stellar-bh) — No real photo exists, but Commons hosts good gravitational-lensing simulations (e.g., Alain Riazuelo's black hole in front of the LMC) and NASA artist impressions of Cygnus X-1; any of these beats generating from scratch.
- **Dwarf Galaxy** (dwarf-galaxy) — Use an exemplar photo — e.g., the Fornax or Sculptor dwarf spheroidal (ESO/DSS images on Commons).
- **NGC 1277** (ngc-1277) — Hubble imaged this galaxy (the 'relic galaxy' releases); a Commons copy of the NASA/ESA image should exist.
- **Galaxy Cluster** (galaxy-cluster) — Any iconic Hubble cluster image works — Abell 1689 or SMACS 0723 (JWST first deep field, PD/CC on Commons).
- **Eridanus Supervoid** (eridanus-supervoid) — Its wiki link is the CMB Cold Spot — the WMAP/Planck cold-spot map (NASA versions are PD) is real data and would fit.
- **Soccer Ball** (soccer-ball) — Plenty of CC/PD ball photos on Commons; any clean product-style shot works.
- **Proto-PN** (proto-pn) — Exemplar: the Egg Nebula (CRL 2688), Hubble, on Commons as public domain.
- **NGC 7538** (ngc-7538) — Amateur and Herschel/Spitzer images exist on Commons; check Category:NGC 7538.
- **Millisecond Pulsar** (millisecond-pulsar) — NASA artist impressions of recycled/accreting pulsars (GSFC) are PD on Commons.
- **White Dwarf** (white-dwarf) — Could reuse the Sirius B Hubble frame or an ESA/Hubble white-dwarf artist impression; avoid duplicating the exact sirius-b crop.
- **Procyon B** (procyon-b) — Hubble imaged the Procyon A/B pair; a Commons copy should exist (NASA PD).
- **T Tauri** (t-tauri) — Real object; images with Hind's Variable Nebula (NGC 1555) exist on Commons.
- **Subgiant (Procyon A)** (subgiant-procyon-a) — Same Hubble Procyon field as procyon-b would serve.
- **Vega** (vega) — Real photos exist (amateur CC shots; Spitzer debris-disk image is PD).
- **Massive Star** (massive-star) — Exemplar: Zeta Puppis or a Tarantula Nebula O-star field (ESO/Hubble).
- **V. Massive Star** (v-massive-star) — Exemplar: R136a1 in the Tarantula Nebula (Hubble/JWST crops on Commons).
- **Blue Supergiant** (blue-supergiant) — Exemplar: Rigel photo (amateur CC images on Commons).
- **Red Giant** (red-giant) — Exemplar photo (Aldebaran/Arcturus) or an ESO artist impression.
- **AGB Star** (agb-star) — Exemplar: ALMA/SPHERE images of R Sculptoris or W Hydrae (ESO CC BY 4.0).
- **Mira Variable** (mira-variable) — Hubble's resolved UV image of Mira itself, or GALEX's Mira-with-tail image (NASA PD).
- **Red Supergiant** (red-supergiant) — Exemplar: VY Canis Majoris Hubble image — distinct from the Betelgeuse ALMA pick.
- **T Brown Dwarf** (t-brown-dwarf) — No real resolved photos exist; NASA/JPL WISE artist impressions of T dwarfs are PD on Commons. Alternatively generate all three brown-dwarf classes as a matched set.
- **L Brown Dwarf** (l-brown-dwarf) — Same as t-brown-dwarf; artist impression (PD NASA) or matched generated set.
- **Y Brown Dwarf** (y-brown-dwarf) — WISE Y-dwarf artist impressions (NASA PD) exist; or matched generated set.
- **Red Dwarf** (red-dwarf) — Generic class; an artist impression (ESO/NASA) works — the Proxima Hubble photo is taken by the proxima-cen entry.

### Generate (no photograph can exist — spirograph-style illustration)

- **Up** (up) — Spirograph particle art matching the existing generated quark set (top, charm already have images).
- **Down** (down) — Spirograph particle art matching the existing quark set.
- **Strange** (strange) — Spirograph particle art matching the existing quark set.
- **Bottom** (bottom) — Spirograph particle art matching the existing quark set.
- **Neutrino (e)** (neutrino-e) — Match the existing generated neutrino-mu image; neutrino-tau shares its icon per ICON_SLUG_MAP in main.js.
- **Neutrino (tau)** (neutrino-tau) — Same treatment as neutrino-e; could share one generated image across all three flavors.
- **Magnetic Monopole*** (magnetic-monopole) — Hypothetical particle — depict a single-pole field-line burst in the spirograph style (asterisk in name already marks it speculative).
- **X & Y Bosons*** (x-y-bosons) — Hypothetical GUT bosons — paired spirograph figures.
- **WIMP*** (wimp) — Dark-matter candidate; nothing to photograph — a ghostly, barely-there spirograph would suit the text.
- **Smallest Primordial BH** (primordial-black-hole) — Theoretical object — tiny event horizon with Hawking-radiation glow, in the app's generated style.
- **3K BH** (3k-bh) — Conceptual black hole (Hawking temperature = CMB); no image can exist — generate in house style.
- **Bootes Void** (bootes-void) — A void is defined by absence — no photograph exists. Generate a sparse star/galaxy field with a conspicuous dark region.
- **KBC Void** (kbc-void) — Same reasoning as Bootes Void — no image exists; generate.
- **Heat Death** (heat-death) — Far-future concept (note its plotted logM=-65.6 — it is a concept marker, not an object). A fading, near-black generated piece would suit.

### Skip (icon carries the visual)

- **1 mL of Water** (1-ml-of-water) — Abstract reference quantity; the icon carries it.
- **1 Liter of Water** (1-liter-of-water) — Abstract reference quantity; the icon carries it.
- **1 Tonne of Water** (1-tonne-of-water) — Abstract reference quantity; the icon carries it.
- **Heaviest NS** (heaviest-ns) — Generic record-holder entry; would duplicate the neutron-star visual. Icon suffices.
- **Massive WD** (massive-wd) — Generic near-Chandrasekhar entry; would duplicate the white-dwarf visual.
- **Horizontal Branch** (horizontal-branch) — Evolutionary stage, not a distinct-looking object; a star photo would be indistinguishable from other entries. Icon suffices.
