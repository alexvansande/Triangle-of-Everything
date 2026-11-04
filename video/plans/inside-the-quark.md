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

## The dive itself: `tools/powers-of-ten/quark-dive.html` (the author's plan, 2026-11-04, built the same day)

The author's refinement of the chain, which replaced the masked cross-fade: nothing fades. Per level, two
passes. (1) Simulate the level's rule. (2) Paint the next level inside the centre third of it, three times
finer, and show it coloured by the parent's density, so the parent's shapes turn out, on magnification, to
have always been made of the child's texture. The child isn't simulated while it is painted: it only follows
the parent. When its square fills the frame it is promoted and simulated, slowly at first, and its own centre
third gets painted. How the page does it:

- **Level 0 is SmoothLife** (Rafler's constants, outer radius 10), whose gliders and worms grow from noise with
  no hand-placed seeds: the quarks. It runs at 0.35 speed, else the gliders cross the grid in seconds.
- **Painting**: the child starts as noise and runs its own rule for 120 steps under a *density clamp* (its
  disk average over radius 6 is pulled toward a target that follows the parent's density, remapped into the
  child's own range, so the texture is denser inside the parent's creatures but never flat). That makes the
  painted seed a legal state of the child's rule, so promotion doesn't pop. Afterwards the rule is frozen and
  only the clamp runs: the texture's grain stays put, its brightness follows the parent (the author's point:
  the child must not be a different thing each frame).
- **Colour is inherited, not per level.** A level has one accent colour. At promotion the level bakes a base
  from its parent: for every cell, the colour the ancestors give that point (rgb) and how far inside their
  creatures it is (the product of the ancestors' smoothstepped densities). The level paints its accent over
  that base by its own value times that inside-ness. So: dive into a blue glider, the child is blue with red
  dots; dive into a red dot, the grandchild is red with black worms; outside every creature the texture
  stays invisible and space stays black. (Colouring a child by its parent alone made hard square edges
  wherever the grandparent said "empty".)
- **No colour jump at the reveal**: a level is drawn pre-tinted with its child's accent by the child's
  measured mean value where the level is dense, i.e. the colour the child's texture averages to. The child's
  texture is drawn only once its cells are resolvable (under two cells per pixel); the average matches on both
  sides, so the square's edge is a texture edge, never a colour edge.
- **Clocks**: the current level's clock ramps up over 2.5 s after promotion and winds down to a stop over the
  last 40% of its magnification (it's huge by then); the child doesn't run until promoted.
- **Aim**: the child's square tracks the densest blob of the parent (density × inside-ness, so it stays within
  the ancestors' creatures) until the parent stops, and the camera eases toward the square's centre.
- Three seconds to twenty per level, grids 128 to 1024, the chain as editable JSON. `window.__advance(sec)`
  steps it deterministically at 60 fps for a frame-by-frame render. Slow on a software GPU; fine on a Mac.

### The sum mode (the author's second plan, 2026-11-04, now the page's default)

Simpler, and nothing is faked. The difference between two levels is only the rule (the seed just has to be
alive and says where mass is). So: level A runs; its child B starts on A's centre third as **noise with A's
state as its amplitude**, and simulates with its own rule from the start, invisibly small until the zoom
resolves it. Every step B is **fed by A's state at each point**: where A has mass, a little noise comes in;
where it has none, B is dimmed. (Feeding by A's *change* instead let B's rule colonise empty space from a
front: dense rules spread. Dimming by state every step is what keeps B inside A's shapes.) The picture is the
**sum** of the live worlds' colours, each by its accent (a slider blends toward "child over parent", which dark
accents need: additive black is invisible). A level winds down to a trickle as it is magnified, trickles on
one level further, and is then baked into the level above and dropped: "once the larger one is so large it
barely makes a difference". No painting, no clamp, no promotion ramp, no pre-tint. The paint mode stays in the
page for comparison.

## Still to do
- Choose the chain for the video in the page (rules from the bench, accents, inness, density) and note it here.
- Render the 22 seconds frame by frame (a script around `__advance`) and cut it into the zoom at 2:14.9.
- The ending: the last world drawn as a terrain, and the field pixelating into the Planck grid.
