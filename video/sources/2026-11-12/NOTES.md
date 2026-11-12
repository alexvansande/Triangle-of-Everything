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
| The Observable Universe, from Earth out | `short-05d-observable-universe` | 2:31 of voice, 2:34 with the credits | `video/short-05d-observable-universe/edl.py`, 23 clips, all rec71; scene `src/narration-scenes/short-05d-observable-universe.js` |

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

### The second pass
Every clip of the edit transcribed on its own (small.en, the filler prompt): clean, no restart left (the first build's
whole-file transcription had already shown "Most of them, most of the others", cut round before this run). Two places
to listen to rather than trust a model: the galaxy line (0:59–1:04 of the voice) is heard as "leaving Africa" by
medium.en in both its passes and as "living Africa" by small.en in this one; and the join at "sent its light" (1:19),
where small.en heard "Fented slight" (its onset may be a touch close to the cut).

### Captions
Corrected in `words.json`: "The foresight of Laniakea" → far side; "how he was" → how it was. The rest came out right
(Alpha Centauri, Sirius, Laniakea, Andromeda, 380,000).

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

## rec72: "5d take 2.m4a" (5d read again whole, with the three rewritten lines and a new ending)

Uploaded 2026-11-12 after the author heard the first cut; recorded 10:55 local (13:55 UTC), ALAC 48 kHz stereo,
9:51, −29.4 LUFS, peak 0 dBFS (one clipped sample at 0:09, in the mic test). The author at the start: *"I'm going to
re-record 5d, not because it was bad, I think it can be better… it's easier to re-record everything, it's good practice
also."* The cut is now from this take alone (`video/short-05d-observable-universe/edl.py`, 29 clips); rec71's cut is
in git history. Word timings: `rec72.words.json`.

### What changed against the first cut
- The three rewritten lines: *"Everyone knows that when you look at the night sky…"*; *"Here are the nearby stars. If
  someone in Alpha Centauri has a TV, they're just now watching the Olympics, one whole tournament late"* (Alpha
  Centauri 4.4 light-years, a four-year cycle: true whenever the viewer watches); *"We live in a supercluster of
  galaxies in the form of filaments called Laniakea. The light from the far side of that filament was sent when the
  dinosaurs were still roaming around. It's only arriving now. They never got the message."*
- **A new passage at the end** (the author, on the take, 8:09–9:46: *"a phrase that I'm not saying… that the universe is
  infinite. Where would that fit? Maybe after 'this is the observable universe'"*; then the whole ending said again from
  there: *"I might keep that last part"*): *"This is the observable universe, the sum of all the light you can see.
  It's not the whole universe. As far as we've been able to measure, the universe is in practice infinite in every
  direction. We are just limited on how much of it we can see. It's not a single object either, because one side can't
  talk to the other…"* and on to the end as before.
- Small: "the light you see **now**"; "**surprisingly** younger than most people realize"; "Most of the others **you see
  on the night sky** sent their light before the internet, sometimes even electricity, was invented"; "On a **very** dark
  night… and **if** you do"; "It's not a map, but rather the history…" (the earlier "more a history" try not used).
- **Not in this take:** rec71's *"Depending where you are, most of them will be older than the country you are watching
  them from."* Left out, as the author read past it; one clip from rec71 to put back if wanted.
- Recorded for a longer video, not used (1:35–1:44): *"Light leaving the sun right now will have arrived by the time you
  finish watching this video."*

### Takes chosen
The last try unless it slipped: "But the sky you see is surprisingly younger…" is the second try (the first restarted
after "actually surprisingly younger"); "Here are the nearby stars" the fourth of five (the fifth hesitates mid-phrase);
the Alpha Centauri line the last of three; "Most of the others…" the last of five; the galaxy line the second; Andromeda
the second; Laniakea's two sentences from the one run that says "was sent" (4:44–4:53; the later runs say "were sent" and
restart); "As we look further down…" from its second start, the list "before superclusters, before clusters, before
galaxies were even formed" from its fourth try; "The present and future…" the second of four (the last two have
three-second holes inside); the ending from the second run (8:38 on) except "just as the universe became transparent for
the first time", taken from the first run (7:52): the second hangs on "the" for half a second.

### Fact check
- **Right:** as rec71's, plus the new lines: Alpha Centauri's four-year delay against the Olympic cycle; the far side
  of Laniakea's light sent in the dinosaurs' time and arriving now; the universe flat as far as we can measure, so "in
  practice infinite in every direction", and the observable universe only the part we can see of it; "before the stars
  even formed" for the CMB.
- **Imprecise, fine:** "one whole tournament late" (the Olympics are games; the point stands); "a quarter of its way
  here" (a third, for a 2:40 video); "started this journey" if that is what was said.
- Nothing wrong; nothing to re-record.
