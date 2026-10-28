# Review notes waiting to be fixed

The author's notes from watching the live player, kept here until they're fixed (then move
the rule, if there is one, into `visual-rules.md` and delete the note). Check this list before
re-rendering.

## Open

- **Video 2, "the hippo can't swim"** (2026-10-27): all the pictures seem to pop up again (their
  grow-in animation replays). Reported before on "the hippo" and "you can see that on the line"
  (2026-10-26). Not reproduced: playing 100–112 s in real time in headless Chrome, only 2–4
  pictures enter or leave around the hippo (the camera moving), not all of them. The chart
  re-decides every picture when its visibility context changes (`_objectVisibility` in
  `src/main.js`: the canvas size, `dustReady()`, the scene's picture sets, labels on/off), so a
  window resize (a phone's address bar), or the catalogue finishing loading, would do it. Need:
  where it was watched (site or local, phone or Mac) and what the pop looks like. The author:
  on the Mac, on the local videos page. Driving video 2 in real time at 1280×800 and logging
  every picture by name: around the hippo nothing re-grows; at 75–76 s ("made of stone… and
  metal") 7 pictures leave and come straight back, growing in again from a dot. Possible fix:
  a picture that comes back while it's still fading out reverses its fade instead of
  re-growing (the icon join in `src/main.js` makes a new node, starting from a dot).

## Fixed

- **Video 2, "this creates a diagonal line, the density of water"** (2026-10-27): the camera
  made a sudden hop. The "draw a diagonal line" glide point was reached by a 1.4 s flight, which
  left 0.3 s before the next glide point ("density of water"): 6.4 screen widths a second.
  That point is gone; the glide runs on to "denser than water" (peak 1.9).
- **Labels on the diagonal lines jumped in steps** (2026-10-27, the density of air and black hole
  lines): `clipMid` in `src/narration.js` found the visible middle of the line from 200 samples
  along its whole length, which are hundreds of pixels apart when zoomed in. Now the line is
  clipped exactly (Liang–Barsky): the air label's 19 px hops on 10 frames are gone.
