# Powers of ten: what has to be on screen, and when

For the zoom's timeline (`tools/powers-of-ten/zoom-timeline.js`, in the zoom source on the author's Mac). The
times are the narration as cut (rec52, 2026-11-03, `video/short-00-powers-of-ten/edl.py`): at each **From**
time the thing in **On screen** has to be framed, because that's the moment the voice names it. Between keys,
one smooth zoom (no stops); the zoom stops on the Planck grid at 2:37.4 and holds the gliders to 3:00. The voice
ends at 2:55.5. Machine-readable: `zoom-keys.json`. Frame widths are rough, for keys the
timeline doesn't have yet.

| From–to | On screen | Frame width | The line over it |
|---|---|---|---|
| 0:00.0–0:11.8 | the CMB shell, turning (the opening) | ~1e+27 m | As far as we've been able to measure… |
| 0:11.8–0:26.9 | the CMB shell | ~1e+27 m | The largest thing we can see is the cosmic microwave background… |
| 0:26.9–0:39.4 | the cosmic event horizon bubble | ~4e+26 m | The smaller bubble inside is the cosmic event horizon… |
| 0:39.4–0:44.5 | superclusters, filaments and voids | ~1e+25 m | Inside them are the largest structures of all: superclusters… |
| 0:44.5–0:53.6 | Laniakea | ~6e+24 m | We live in one such small filament called the Laniakea supercluster… |
| 0:53.6–0:56.0 | the Local Group | ~1e+23 m | And in here, we see our local neighbourhood of galaxies. |
| 0:56.0–0:57.1 | Andromeda | ~1e+23 m | Here's Andromeda… |
| 0:57.1–1:01.1 | the Milky Way | ~2e+21 m | …and here's the Milky Way: that's us. |
| 1:01.1–1:04.1 | the Sun in its arm | ~1e+20 m | And in one of its arms, one star among hundreds of billions is the Sun. |
| 1:04.1–1:08.6 | Sirius, Proxima Centauri | ~2e+17 m | Here are the nearby stars, Sirius and Proxima Centauri. |
| 1:08.6–1:14.9 | the Oort Cloud | ~3e+16 m | The Sun is surrounded by billions of icy comets that make up the Oort cloud. |
| 1:14.9–1:17.4 | the planets' orbits | ~1e+13 m | Now we can see the orbits of planets… |
| 1:17.4–1:20.0 | Earth (the third rock) | ~4e+11 m | …and the third rock from the Sun: that's home. |
| 1:20.0–1:23.1 | Earth and the Moon going by | ~1e+09 m | We see the Moon zoom by. |
| 1:23.1–1:24.1 | North America | ~6e+06 m | And in North America, |
| 1:24.1–1:25.2 | California | ~2e+06 m | California, |
| 1:25.2–1:27.0 | the Sierra Nevada | ~4e+05 m | in the Sierra Nevada, |
| 1:27.0–1:30.3 | the forest of giant sequoias | ~2e+03 m | …lives the forest of giant sequoias. |
| 1:30.3–1:35.1 | the General Sherman | ~2e+02 m | And there lives the General Sherman, the largest tree on Earth. |
| 1:35.1–1:37.4 | the ladybug on a branch | ~2e-02 m | And on one of its branches, a ladybug… |
| 1:37.4–1:42.3 | the drop of morning dew | ~3e-03 m | …is drinking a little bit of morning dew. |
| 1:42.3–1:43.6 | the amoeba | ~6e-04 m | And we find our first single-celled organism: an amoeba. |
| 1:43.6–1:49.6 | the cell's nucleus, then its DNA | ~2e-05 m | Inside it, we find its nucleus, and its DNA, wound tight around proteins. |
| 1:49.6–1:53.2 | the double helix | ~2e-08 m | The double helix is two millionths of a millimetre wide. |
| 1:53.2–2:03.9 | the atom | ~3e-10 m | Atom is Greek for uncuttable… |
| 2:03.9–2:09.0 | the atom's empty space, the electron cloud | ~1e-11 m | They're made of electrons, protons and neutrons, and they're mostly empty space. |
| 2:09.0–2:14.9 | the nucleus: one proton | ~3e-15 m | And the proton and neutron, in turn, are made of smaller things, like quarks and gluons. |
| 2:14.9–2:19.8 | the quark patterns | ~1e-18 m | And what are quarks made of? Well, truly, we don't know. |
| 2:19.8–2:26.9 | the quark patterns into the grey terrain | ~1e-22 m | But now, instead of searching for the smallest building block… |
| 2:26.9–2:37.4 | the grey terrain (fields) | ~1e-27 m | Quantum field theory describes the universe as simply numbers at every point… |
| 2:37.4–2:40.1 | the Planck grid (the zoom stops) | ~5e-34 m | Our journey ends at the Planck length. |
| 2:40.1–2:44.0 | the Planck grid, held | ~5e-34 m | At this point, relativity clashes with quantum mechanics. |
| 2:44.0–3:00.0 | the gliders (held to the end) | ~5e-34 m | Is that the limit? … it's all one big game of life. |

## Gaps in the picture (the narration says these; the zoom must show them)
- **The cosmic event horizon bubble** (0:27): a sphere about a third of the CMB's radius (16 billion
  light-years). It wasn't drawn in the 2026-11-02 zoom; add it, or the line plays over nothing.
- **Laniakea** (0:45) named and outlined, if the zoom can: the line says "one such … Laniakea supercluster".
- **Andromeda, then the Milky Way** (0:56, 0:57): one second apart, so both in one frame, Andromeda first.
- **The Moon going by** (1:20): the Moon has to pass through the frame ("we see the Moon zoom by"), not only
  its orbit.
- **North America → California → the Sierra Nevada** (1:23, 1:24, 1:25): three names in two seconds, then
  the sequoias at 1:27.
- **No pollen**: the narration goes ladybug → dew → amoeba (the pollen line was left out).
- **The atom's empty space** (2:04): the zoom between the electron cloud and the nucleus.

## When this opens long video 3
The plan (the author, 2026-11-03): the CMB-to-Planck zoom opens long video 3 (now videos 6 and 7 joined,
`video/cuts/long-03-small.json`, which starts "In this series, we've been drawing everything in the universe in
one chart…"). It needs a bridge line after "…it's all one big game of life", recorded as *Long only* (see
`video/scripts/recording-scripts.md`), and the zoom then hands over to the chart.
