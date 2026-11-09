# Recordings, 2026-11-09

The Whisper word timings (medium.en, `scripts/narration-take.py`'s settings) are `rec59.words.json`.

## rec59: "The Black Hole Slope.aifc" (the first black holes Short, recorded on its own)

In iCloud `Projects/triangle/recordings`, so recorded at home: 11:13, PCM 16-bit 48 kHz stereo (used as mono), about
−30 LUFS, peak −7 dBFS, no clipping. A mic test and a note (0:02–0:17: *"I want to try out a new recording for the black
hole [part] one"*), then one take said freely with many retakes (the labyrinth line six times, "because for any object…"
about fifteen starts, the relativity line seven), and from 9:06 the old part 1's lines read once ("Squeeze the Sun…" to
"…Pluto's orbit") and a new ending. The author: "Use that to edit the new clip. Keep the old version so we can compare",
and "The final cut must be under 3 minutes - preferably less".

| Video | Take | Plays | Made from |
|---|---|---|---|
| The Black Hole Slope | `short-04a-black-hole-slope` | 2:47 of voice, 2:51 with the credits | `video/short-04a-black-hole-slope/edl.py`, 19 clips, all rec59; scene `src/narration-scenes/short-04a-black-hole-slope.js` |
| The Black Hole Line, part 1 (the earlier version, kept to compare) | `short-04a-black-hole-line` | 1:54 at 1.1× | `video/cuts/short-04a-black-hole-line.json`, from video 4's take (rec48, in the car), untouched |

Natural speed, `enhance.py --plain` (−16.8 LUFS, as the other takes measure), the speaker's own pauses (caps 0.25 s after
a word, 0.55 after a comma, 1.0 after a sentence; 0.55 s between clips, 1.1 between beats, the take's room tone in the
gaps), the breaths in the pauses replaced by room tone (14). Music: Mesmerize, as video 4; the drop on "become a black
hole" and the bubble on "pool big enough", as before.

### Takes chosen
The last try everywhere, except where it would have left the line unnamed: the author's last run at the limit (7:28 on:
"see, the thing is, for every object you can see there's a size…") goes straight on to "black holes don't actually have
a size" and never says "Schwarzschild", so the cut takes the try before it for those two sentences ("Because for every
object you can see, there is some size… they will become a black hole." and "So this line, called the Schwarzschild
radius, represents the upper limit in which anything can be.", 6:48–7:19) and joins the last run at "And black holes
don't actually have a size". Starts given where the long-form pass had folded a restart into the words: "I've been
exploring this surprisingly useful tool" (after "I've been explore–"), "they can go anything from" (after "They can go
from,"), "because there are actually some people" (its third start). "Squeeze" given its start by hand: the snap had
clipped the "S" (the clip pass heard "Quiff").

### The second pass
Every clip of the edit transcribed on its own with a filler-friendly prompt, twice (after each rebuild): it found the two
hidden restarts above ("I've been exploring, I've been exploring", "Because, because there are, because there are
actually") and the clipped "Squeeze", all fixed; the second run reads clean. A word Whisper keeps putting before "It
means that according to relativity" ("But", "So", 0.08–0.09) is the soft onset of "It": nothing is said there.

### Left out
- For length and because they repeat the line before or after: "And every black hole lives precisely on this line, never
  crossing it." (7:04) and "…that represents the upper limit of our chart" (8:06, the end of the slope sentence). With
  both in, the Short would run about three minutes with the credits.
- Whole tries that were said again: "but for any object larger than a pebble, there's a size in which if you squeeze
  them too much, they will become a black hole, and every black hole lives exactly on the Schwarzschild radius. That
  means that no object can exist that goes beyond it." (5:03–5:22, a complete version of the limit, a little shorter
  than the one used); "…which you can see in the last video" on the labyrinth; "and when stars do die they will leave
  behind something on this"; the two earlier endings ("because it's possible that everything we know is mostly made of
  them", "because there is a chance that actually most of the things in the universe are just tiny black holes").
- The mic test and the note; "Now I think we need to…" (5:28).

### Captions
Corrected: "lives in this line" → "on this line", "on or short of everything" → "on our chart of everything", "they are
singularity" → "they're a singularity", "one to one 45 degrees slope" → "one-to-one, 45 degree slope", "plutus orbits" →
"Pluto's orbit", "sun"/"earth" → "Sun"/"Earth", "the [life] and death of stars" (the word dropped at a join) put back,
Whisper's "But" before "It means that" taken out, and the commas of the long sentences. In the raw transcript:
"shard"/"short" → chart, "triad side/child radius" → Schwarzschild radius, "swelling gas" → swallowing gas, "Plan 618"
→ TON 618, "lobe" → slope, "math" → mass.

### Fact check
- **Right:** every object on one log chart of size and mass; the ranges things fall in (the diagonal of water's
  density, the column of super-Jupiters at Jupiter's size, the paths of the stars' lives); what dead stars leave: a
  white dwarf for stars like ours, a neutron star after a supernova for larger ones, a black hole for larger still;
  every black hole on the one line, the first limit of the chart; any object squeezed small enough becomes a black
  hole; the Schwarzschild radius as the limit; the event horizon as where light can't get out; its size growing with
  the mass, so a one-to-one, 45° slope on a log chart; by relativity nothing beyond the line; the Sun as a black hole
  about 6 km wide (5.9), the Earth a marble (1.8 cm); black holes from collapsing cores, grown by gas and mergers; "from
  a few Sun masses to billions of them" (better than rec48's "billions of stars"; TON 618 is tens of billions); Sgr A*
  4 million; the supermassive ones less dense than water (above about 140 million Suns; M87* is 6.5 billion); M87* the
  first photographed (2019); TON 618 among the largest, its horizon (radius 800–1,300 AU) far beyond Pluto's orbit
  (40 AU).
- **Wrong, left out of the cut:** "They can go from like a few billion suns" (a slip, said again right); "Larger stars
  will leave probably a white dwarf" (a slip); "there are no objects that can exist larger or smaller than a black
  hole" (the relativity line's first tries). Nothing wrong is in the cut.
- **Imprecise: "black holes don't actually have a size, they're a singularity"** (the editor's note of 2026-11-08 on
  video 4, the same point): the size on the chart is the event horizon's, a real size; the singularity is what
  relativity predicts *inside*. The scene's label says "inside: a singularity". *"A black hole has no surface. What it
  has is an event horizon, the distance from which light cannot escape, and that is the size we plot."*
- **Imprecise: "that event horizon is dependent on the mass, so it creates this… 45 degrees slope"**: what makes it one
  to one is that the horizon is *proportional* to the mass (twice the mass, twice the size), not only dependent on it.
  rec48's "grows in step with its mass" was exact. *"…and that event horizon grows in step with the mass: twice the
  mass, twice the size. So it draws this one-to-one, 45-degree slope."*
- **Imprecise: "some people who believe that most of the things in the universe are just tiny black holes"**: most of the
  *matter* (dark matter is about 85% of it), and it's a hypothesis with one mass window still open (around an
  asteroid's mass). *"Because there's a chance that most of the matter in the universe is just tiny black holes."* (The
  second try, left out, has "there is a chance", which is closer.)
- **Imprecise, fine: "this whole left side… a big cemetery of dead stars"**: true of the stars' left side (white
  dwarfs, neutron stars, stellar black holes); the supermassive black holes further up the same line aren't dead stars.
  **"the point in which light cannot escape"**: a distance, not a point. **"the upper limit in which anything can be"**:
  the most mass a size can hold. **"for every object you can see"**: for any mass at all.

### The scene
New shots for the new words, the rest the old part 1's keyed to this take: a push in on the triangle and the axes named;
the list of ranges as whips at one zoom (the water diagonal at human scale, the gold trend up the super-Jupiter column,
the stars' paths lit) and one slow zoom out over the stars; the remnants ringed as "dead stars", then the Sun's path to
the white dwarf, the neutron star, the path into the stellar black hole; the real black holes on the line; "the first
limit" on the triangle; the Moon squeezed straight across onto the line ("the Moon: 0.2 mm wide"; the Sun and the Earth
come later, as before); "Schwarzschild radius" along the line and the side beyond it shaded; the stellar black hole for
"don't have a size" ("inside: a singularity", "size = event horizon", "no light gets out"), "twice the mass, twice the
size", "1 : 1 · 45°"; then video 4's shots from "Squeeze the Sun" to TON 618 (the two dives too); the end goes down the
line to where the tiny ones could be ("tiny black holes?"). The high-mass path isn't lit for the neutron star: its last
leg runs past the Sun's picture and read as the Sun making it. Every cue resolves; stills checked at 42 times.
