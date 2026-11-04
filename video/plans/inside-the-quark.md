# Inside the quark: the dive from the quark patterns to the Planck grid

For the Powers of Ten zoom (`video/short-00-powers-of-ten/ON-SCREEN.md`), 2:14.9 ("And what are quarks made
of?") to 2:37.4 (the Planck grid). The author's brief (2026-11-04): it should feel like zooming into an unknown
abstract region, "not made of things but made of rules": you dive into a blue creature, and the next world is
mostly blue with some red worms; dive into a red worm, and the next is mostly red with a little black. The
author tried fractals, Lenia and an "infinite terrain" of both, and wasn't happy with any.

## The approach (the session of 2026-11-04)

Not a true multiscale automaton (multi-kernel Lenia, Flow Lenia and MNCA make structure at two or three
scales, a factor of 3 to 5 apart; the dive needs ten orders of magnitude and a colour story). Instead a
**chain of ordinary automata, composited**:

- Four or five independent simulations ("worlds"), each with its own rule so each looks different: cells, coral,
  worms, labyrinth, soup. Each has a two- or three-colour palette: background, middle, creature.
- **World k+1's background colour is world k's creature colour.** That one rule carries the story.
- World k+1 is drawn multiplied by world k's (blurred) density, so it only exists inside the shape being
  entered; the mask fills the frame as the zoom goes on, and world k is dropped. Let the parent's interior
  show through faintly as a large-scale gradient in the child's background: it hides the seam and reads as
  inheritance.
- Each world runs its clock **proportional to 1 over its on-screen magnification**: as a world is blown up it
  slows and effectively freezes (so the camera needn't chase a moving creature), while the world inside it runs
  fast. Smaller means faster, which matches the physics and gives depth.
- About 8 to 16× of magnification per world before the handover. Pick the dive point by hand per world (four
  handovers; the render is offline). The bench below showed that at about 10× any of these worlds is just soft
  colour fields, which is where the next one fades in.
- **The ending**: make the last world the grey "terrain" by drawing its density as a heightmap ("a number at
  every point of space and time", 2:27), then let the zoom go on until the field pixelates into cells: that is
  the Planck grid (2:37), and the gliders run on it. Game of Life at the end is then earned: the smooth field
  turns out to be a lattice with a rule.

## Which automata (they must fill the plane)

Classic Lenia is solitons on empty space by design, so not that. Three families fill the plane:

- **MNCA** (multiple-neighbourhood cellular automata, after Slackermanz): ring averages over two to four annuli,
  each rule adds or subtracts when an average falls in an interval. Dense coral, cells, fingerprints, ribbed
  worms, no empty space. Binary-ish, so its edges are ragged up close: soften them when magnified.
- **Lenia in its dense regimes** (growth centre `mu` 0.3 to 0.45, wide `sigma` 0.05 to 0.1, started from
  uniform noise): labyrinths, dot lattices and a churning "soup" of rings and worms. Continuous, so it magnifies
  smoothly.
- **Gray-Scott reaction-diffusion** (Pearson's regimes: coral, mitosis, worms, mazes, holes, chaos, waves):
  the most reliable dense textures, and literally two coupled fields, which suits the fields line.

`tools/powers-of-ten/dense-automata.html` is the bench: all three families in WebGL, 48 presets, world
palettes, a magnifier (drag to pan, wheel to zoom), soften, relief, and the rule as JSON to carry into the zoom
tool. "Randomize" draws a new rule with the generator the search used; "Mutate" nudges the current one. The
Lenia and MNCA presets came from a random search (128² periodic grid, 300 to 400 steps, scored for mean in
0.12 to 0.88, structure under about 16 cells, and still changing at the end) and were then named by eye.
Open it through the dev server (`npm run dev`, then `/tools/powers-of-ten/dense-automata.html`) or straight
from the file; it needs WebGL2 with float textures (any recent Mac browser). It is slow on a software GPU.

## Still to do
- Pick the four or five worlds and their palettes in the bench; note the rule JSON and seed here.
- Build the chain (the masked handover, the clocks) in the zoom tool on the author's Mac
  (`tools/powers-of-ten/zoom-timeline.js`), or as a separate page that renders the 22 seconds to frames.
- Decide the terrain world and how the field pixelates into the Planck grid.
