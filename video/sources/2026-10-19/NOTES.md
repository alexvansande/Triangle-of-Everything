# Recording of 2026-10-19

| Source | Raw file (Google Drive "Recordings") | Length | Setup |
|---|---|---|---|
| `rec12` | `From humans to brown dwarfs .m4a` | 6:20 | home, 48 kHz ALAC; noise floor about −78 dB, so no extra denoise |
| `rec13` | `bar_do_zeca_pagodinho_4.m4a` (uploaded to the chat) | 0:51 | 48 kHz ALAC; the same noise floor (−79 dB) and a tone within ±3 dB of rec12, so no EQ |

One take of the whole of `short-03-planets`, replacing the earlier cut from
rec8 (home intro) and rec3 (office): humans, rocks and animals either side of
the diagonal, the whale and the sequoia, planes, supertankers and the Great
Pyramid, mountains, rocks, comets and small moons, round worlds, atmospheres,
gas giants and Earth between them, Saturn floating, the turn off the diagonal
into degenerate matter, the brown dwarfs, and a cliffhanger into the next video
("some take a drastic turn to the right and some to the left. What is this?").

**rec13** is a new opening for the same video ("In this chart, diagonal
lines represent density. This blue line represents the density of water…
everything to the left will sink and everything to the right will float"),
replacing rec12's, which began like `short-02-density` ("something really
interesting happens…"). rec12 takes over from "And if you start at the human
scale". rec13's own human-scale lines are left out. Caption fixes: "flow" →
float, "dressed" → drastic.

**Tempo: this batch plays at 1.1×, not 1.2×** (the narration is naturally a
little faster from here on): `python3 scripts/narration-tempo.py <take> --tempo 1.1`.

`rec12.words.json` and `rec13.words.json` have their Whisper word timings (medium.en). The cut is
`video/short-03-planets/edl.py` (25 clips: rec13 then rec12; 3:24 before the 1.1× tempo,
3:06 after); `cuts.csv` lists where each clip landed.

Left out of rec12 (its opening is now rec13's): a false start in the first seconds ("so something very interesting
happens when", hidden in a pause; the cut starts at 7.52 s), the first try at
"if we start at the human scale…" (it had the sides swapped), "we really,"
before "we will transition", repeated takes of "more and more spherical",
"behaving like liquids" and the atmosphere lines, "Venus and Earth have",
the first gas-giant pass ("when they form from the stellar remains…"), "just
massive enough to have some gravity", "that some," before "that more objects",
the first pass of the degenerate-matter lines, and the takes between 328 s
and 353 s.

Whisper often mishears "super-Jupiters" in the edit (dropping it, or writing
"super -egyptars"); `public/narration/short-03-planets/words.json` has it
fixed by hand. Check it after re-transcribing.

Overlap: this take now ends where `short-04-stars` begins (the sharp left
turn, degenerate matter, brown dwarfs), so short 4's opening repeats it.
