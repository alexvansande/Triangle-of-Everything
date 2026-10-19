# Recording of 2026-10-19

| Source | Raw file (Google Drive "Recordings") | Length | Setup |
|---|---|---|---|
| `rec12` | `From humans to brown dwarfs .m4a` | 6:20 | home, 48 kHz ALAC; noise floor about −78 dB, so no extra denoise |

One take of the whole of `short-03-planets`, replacing the earlier cut from
rec8 (home intro) and rec3 (office): humans, rocks and animals either side of
the diagonal, the whale and the sequoia, planes, supertankers and the Great
Pyramid, mountains, rocks, comets and small moons, round worlds, atmospheres,
gas giants and Earth between them, Saturn floating, the turn off the diagonal
into degenerate matter, the brown dwarfs, and a cliffhanger into the next video
("some take a drastic turn to the right and some to the left. What is this?").

`rec12.words.json` has its Whisper word timings (medium.en). The cut is
`video/short-03-planets/edl.py` (24 clips, 3:14 before the 1.2× tempo, 2:42
after); `cuts.csv` lists where each clip landed.

Left out: a false start in the first seconds ("so something very interesting
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
timings mapped from this transcript. Caption fixes: "short" → sort, "scene" →
chart.

Overlap: this take now ends where `short-04-stars` begins (the sharp left
turn, degenerate matter, brown dwarfs), so short 4's opening repeats it.
