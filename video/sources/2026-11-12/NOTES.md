# Recordings, 2026-11-12

## rec71: "5d take.m4a" (The Observable Universe, from Earth out: the author's new script for 5c)

Uploaded to the session 2026-11-12; recorded 08:48 local (11:48 UTC), ALAC 48 kHz stereo (used as mono), 11:14,
−26.3 LUFS, peak −0.5 dBFS. The author at the start: *"Video 5D is actually a new script for video 5C, which I wasn't
very happy with"*, then the script of 2026-11-11 (`recording-scripts.md`, "5d") read through with retakes, two lines
left open on the take (below). Word timings (medium.en, the filler prompt): `rec71.words.json`; three stretches that
Whisper had merged are re-timed from a transcription of the stretch alone (small.en): the Moon's last try
(63.8–72.5 s), "As we look further down" (576.8–590) and "We can see the light emitted…" (641–650).

| Video | Take | Plays | Made from |
|---|---|---|---|
| The Observable Universe, from Earth out | `short-05d-observable-universe` | see the build | `video/short-05d-observable-universe/edl.py`, 23 clips, all rec71; scene `src/narration-scenes/short-05d-observable-universe.js` |

The same treatment as the 2026-11-11 takes (`enhance.py --plain`, natural speed, the breaths out of the pauses, the
room in the gaps), then every clip of the edit transcribed on its own (the second pass). 5c stays as it is.

### What's said against the script
Read as written, with these changes: the Sun's line is the one worked out in the session (*"Light leaving the sun
right now will be a quarter of the way here by the time you finish watching this video"*: right for a video of about
two minutes, the light takes 8.3 minutes), in place of "less than 10 minutes old" and "For how long have you been
watching videos now?"; Jupiter as *"If you can see Jupiter, you're looking at it how it was one hour ago"*; "Most of
the others sent their light before the internet was invented, **or even electricity**"; "**Depending where you are,
most of them** will be older than the country you are watching them from"; "the supercluster of galaxies **in which
we are part of**"; "It's not a single thing **because** one side can't talk to the other"; "Light that **had** been
traveling toward us".

### Left open on the take (the author's words)
- **The Olympics line** (4:55–6:02): after "You are seeing them as they were one or two Olympics ago" the author tried
  a second image five ways (*"someone sitting there watching the transmission of the Olympic Games, it's going to be
  one game old… they are one whole cycle later. Not sure how to say that. I'm going to think about it"*). Not in the
  cut. A version that works: *"If someone there is watching our broadcast of the Olympics right now, it's the
  Olympics before last."* (Sirius, 8.6 light-years: two cycles; Alpha Centauri, 4.4: one.)
- **Venus** (3:03–3:50): *"You see Venus in the sunset… the light from Venus is probably like 15 minutes ago. No, I
  don't think that works. Forget that."* Right to drop: Venus is 2 to 14 light-minutes away, and "the inner planets,
  less than half an hour" already covers it.
- **Saturn** (4:10): after Jupiter, *"Saturn, roughly one and a half"*, a fragment (hours, unsaid). Not in the cut:
  Saturn's light is 67 to 89 minutes old, so "roughly an hour and a half" is right only at its farthest; "over an
  hour" would always be. One clause to say if wanted: *"Saturn, well over an hour."*

### Takes chosen
The last try unless it slipped. The Moon: the last try, from its second "the moon" (1:06; the first "The moon you're
looking at," restarts). Mars: the fourth start (2:43). Jupiter: the last of five starts (4:06; Whisper placed its "if"
two seconds early, the clip's start set by hand). "Most of the others…": the fourth of five (7:22; the fifth slurs
"or at sometimes electricity"). "The light from the other side of the galaxy…": **the first try (6:21)**, because it
is the one both models hear as "first **leaving** Africa"; the four later tries (6:57–7:20) are heard as "first living
(in) Africa", which would be wrong (humans have lived in Africa for 300,000 years; they left it about 60,000 years ago,
which is the far side of the galaxy's 50,000 to 75,000 light-years). If the author did say "living" there, the first
try is the right one anyway. Laniakea: the last of five starts to "in which we are part of" (9:08), joined to the
second "sent its light when the dinosaurs were still around, they never got the message" (9:20; the third has a
four-second hole before "they never"). "As we look further down…": from its second "as" (9:41; "…the past of our –"
restarted, merged by Whisper). "Space expands so fast…": the first (9:51; the second restarts "The present –").

### Captions
(filled in after the build)

### Fact check
- **Right:** the night sky as the past; the Moon 1.3 light-seconds ("a second ago, younger than this phrase"); light
  leaving the Sun a quarter of the way here after a two-minute video (8.3 light-minutes); Mars and the inner planets
  under half an hour (Mars at most 22 light-minutes); Jupiter about an hour (33 to 54 minutes); Alpha Centauri 4.4 and
  Sirius 8.6 light-years, "one or two Olympics ago"; most naked-eye stars hundreds of light-years away, so before the
  internet, and many before electricity (1880s, 140 light-years) and older than most countries; the far side of the
  galaxy 50,000 to 75,000 light-years, when modern humans were leaving Africa; Andromeda 2.5 million light-years,
  before controlled fire (about a million years ago); the far side of Laniakea 150 to 250 million light-years, in the
  age of the dinosaurs (230 to 66 million years ago); looking further is looking earlier, before superclusters,
  clusters and galaxies; beyond the cosmic event horizon nothing sent now ever arrives, so those galaxies' present and
  future are unknowable; the observable universe as the sum of the light that has reached us, a history not a map, its
  far sides out of contact; the CMB 380,000 years after the Big Bang, when the universe became transparent.
- **Wrong, not in the cut:** "when humans were first **living** in Africa" (the later tries of the galaxy line, if
  that is what was said; the cut has the try heard as "leaving").
- **Imprecise, not in the cut:** "Saturn, roughly one and a half" (above); "the light from Venus is probably like 15
  minutes" (2 to 14; dropped by the author).
- **Imprecise, fine:** "light that **had** been traveling toward us" (has); "the past of our very universe".

### The scene
No chart: the take is the powers-of-ten zoom from the first word, so the scene is a set of marks for the zoom's script
(`timeline-05d.js`, to be written in the zoom's checkout): earth, moon, sun, planets, jupiter, stars, farstars, galaxy,
andromeda, laniakea, past, horizon, obs, cmb, each at the first word of the thing named. Until that script exists the
live player holds the chart on our universe under the voice; the take is not queued for the render.
