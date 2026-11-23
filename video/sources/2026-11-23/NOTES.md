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

## rec78: "O2 Corporate Offices 5" (the forces Short again, tighter)

An iPhone voice memo sent in the chat, ALAC 48 kHz stereo (used as mono), 13:32, recorded from the marked script (the
doc "Dance of the Forces · Short script"): tighter and more energetic, the fixes in (the neutrons, the shorter giant
planets, fusion and main sequence lines). The author: *"I really want to try to include the final bit about dark matter
in the 3 minute mark."* Words: `rec78.ctc.json` only (the CTC pass, every try; no Whisper pass on the raw take, to save
time on a loaded machine).

The edit: `video/short-l2d-dance-of-the-forces/edl.py`, 24 clips, **2:56** after `enhance.py --plain`, pauses capped at
0.4 s and gaps of 0.3 / 0.5 s (tighter than rec77's 0.75). To fit the dark-matter ending, these lines are out (each marked
in the edit list, easy to put back): "This diagonal is the density of things made of ordinary matter…", "The chemical
bonds can try to shape things, but gravity will eventually win", "So gravity adds up, and at this point everything just
looks like spheres", "That energy creates a new balance, which is the main sequence…", "and only quantum effects prevent
them from being squeezed any further", the escape velocity in km/s, "All the black holes we know of have been formed by
dying stars", and "something like the mass of an asteroid compressed to the size of a virus". The CTC check on the edit
finds no try left twice.

### Fact check
Nothing wrong as cut. The neutrons are fixed ("no charge pushing them apart, so they pack shoulder to shoulder").
Imprecise, as in rec77: fusion's "gravity squeezes the nuclei so close" (it's the heat), and the core collapse straight
after the hydrogen runs out (it comes later, at iron); "no longer than the nuclei" (a nucleus). Left out but worth a
note: "an orbit of velocity measured over a hundred thousand km/s" (said for the escape velocity; both are over 100,000
km/s at a neutron star's surface, so it's right either way, but the word is escape velocity).

### Re-cut after the author's review (2026-11-23, afternoon)
The author on the first draft: "heavier still" read as a splice; "that equilibrium" had nothing before it; "But our
universe does have a speed limit" had no line before it either; and too much was packed into 3:00, so the dark matter
should come down to one phrase. Re-cut from the same take, 2:54 + 3 s credits: "And heavier still" out (the clip now starts
"Gravity squeezes…"); the main sequence line back ("That energy creates a new balance…"); the escape speed back ("In order
to escape the gravity of a neutron star, you need to have an orbital velocity measured over a hundred thousand
kilometers per second"); "So gravity adds up…" back; the primordial black holes' lines and "We found none so far" out, so
"formed by dying stars" goes straight into "but I find it fascinating…". Pauses a little longer (0.45/0.5 s, gaps 0.35/0.65).

### Fact check (the re-cut)
Wrong word, back in with the escape line: "an orbital velocity" (it's the escape velocity; both are over 100,000 km/s at a
neutron star's surface, so the number holds). Re-word for a re-record: "To escape a neutron star, you'd need to go faster
than a hundred thousand kilometers per second." Imprecise, as before: "gravity squeezes the nuclei so close" (it's the
heat too), and the collapse straight after the hydrogen. The ending no longer names dark matter; "turning most of the
matter in the universe into black holes" stands for it. The take-3 script (Script Word Counter artifact) fixes all three.
