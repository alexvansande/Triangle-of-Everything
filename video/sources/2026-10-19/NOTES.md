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

**rec13** is a new intro for the same video, through the sequoia ("In this
chart, diagonal lines represent density. This blue line represents the
density of water…"). It replaces rec12's opening, which began like
`short-02-density` ("something really interesting happens…"). Its false start
"Starting with animals and humans and whales," is left out. Caption fix:
"flow" → float.

`rec12.words.json` and `rec13.words.json` have their Whisper word timings (medium.en). The cut is
`video/short-03-planets/edl.py` (24 clips: rec13 then rec12; 3:25 before the 1.2× tempo,
2:51 after); `cuts.csv` lists where each clip landed.

Left out of rec12 (its opening, up to the sequoia, is now rec13's): a false start in the first seconds ("so something very interesting
happens when", hidden in a pause; the cut starts at 7.52 s), the first try at
"if we start at the human scale…" (it had the sides swapped), "we really,"
before "we will transition", repeated takes of "more and more spherical",
"behaving like liquids" and the atmosphere lines, "Venus and Earth have",
the first gas-giant pass ("when they form from the stellar remains…"), "just
massive enough to have some gravity", "that some," before "that more objects",
the first pass of the degenerate-matter lines, and the takes between 328 s
and 353 s.

The edit's own transcript dropped "super-Jupiters, and now we are"; those
words are put back in `public/narration/short-03-planets/words.json` with
timings mapped from this transcript.

Overlap: this take now ends where `short-04-stars` begins (the sharp left
turn, degenerate matter, brown dwarfs), so short 4's opening repeats it.
