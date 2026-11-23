# Recordings, 2026-11-23

## rec77: "Dance of forces.m4a" (the forces Short, recorded on its own)

Google Drive "Recordings", ALAC 48 kHz stereo (used as mono), 24:08, the car. The author recorded from the script page
(the forces Short's 3-minute script), improvising around it, with many tries and long pauses; a mic test and an aside to
start ("I'm going to do a recording for the video short number two"). Word timings: `rec77.words.json` (Whisper
medium.en, verbatim settings) and `rec77.ctc.json` (the CTC pass, every try; the edit list is built on these).

The edit: `video/short-l2c-dance-of-the-forces/edl.py`, 48 clips, the last clean try of each line, 4:57 after
`enhance.py --plain` (no breath removal yet, natural speed). The CTC check on the edit finds no try left twice. Sent to
the author as audio for approval before any scene work (the author, 2026-11-23: "send me the file for approval before
putting any animations on it. I might have to cut it again or change it more depending on the final length").

Left out: the asides ("I think I already said the part where it's the answer, right?", "I see why you said not to say
that"); the plot line's earlier tries ("you can see that equilibrium point…"); "Gravity is weaker than
electromagnetism, but unlike it…" (unfinished); the escape-velocity tries in tens or hundreds of thousands of km/s;
"In the very early moments … gravity just won everything" and the "90% / 80% of all mass" tries (the last ending kept).

### Fact check
Right: electrons attracted to the next atom's protons, the layers pushing back, bonds as electromagnetism; no negative
gravity, so it adds up; round from dwarf planets and small moons to Jupiter, then denser, not bigger (loose nuclei in a sea
of electrons); a proton and an electron squeezed into a neutron; a neutron star held up against gravity, not held
together by the strong force; escape speed over 100,000 km/s (about 0.3–0.6 c); an asteroid's mass inside the size of a
virus (a black hole of about 10^20 kg, a large asteroid, is about 150 nm across); the dark-matter ending, framed as a maybe.

Wrong (worth re-recording):
- **"Neutrons, unlike protons, don't mind being squeezed together, so the core stays put"** (2:58): the core stays put
  *because* the neutrons resist being squeezed (their degeneracy pressure is what holds a neutron star up); "don't mind"
  says the opposite. Suggested: *"Neutrons have no charge pushing them apart, so they pack shoulder to shoulder, and then
  refuse to be squeezed any further. So the core stays put: a neutron star…"*

Imprecise:
- "And the larger the star, the faster you need to be" (3:25): escape speed grows with mass over radius; a heavier
  neutron star is smaller, not larger. *"And the more massive the star, the faster you need to be."*
- "When that happens, a very massive star can undergo a catastrophic core collapse" (2:38) follows "once [hydrogen] runs
  out, it goes haywire": the collapse comes much later, once the core is iron. Fine for a Short.
- "the nuclei get so close that the strong force captures them" (1:55): in a star it's the heat that drives nuclei
  together hard enough, not the electrons giving way (that's the giant planets). As in the earlier takes.
- "makes them into one atom" (2:02): one nucleus. "they form under the collapsing core" (3:49): in. "reaches no longer
  than a nuclei", "a loose nuclei": nucleus.
