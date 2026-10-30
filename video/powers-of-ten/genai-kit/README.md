# Image-generation kit: from a dew drop on a ladybug to the General Sherman tree

This folder is everything an image model (first test: ChatGPT's image generation) needs to
paint the stretch of the powers-of-ten zoom that has no real photographs: from a 2 mm dew drop
on a ladybug's back up to 40 m above the General Sherman tree, where real aerial photos take
over (`../photos/`, NAIP, 0.3 m a pixel). Built by `scripts/powers-of-ten-genai-kit.mjs`.

## The zoom, in one paragraph

Video 7 of *The Triangle of Everything* is a powers-of-ten zoom (like the Eameses' film): one
continuous fall from the Planck length to the cosmic microwave background, always centred on
the same point. That point is a hydrogen atom in the DNA of an amoeba, swimming in a drop of
dew on a ladybug's wing case. The ladybug sits on a sprig of the General Sherman tree in
Sequoia National Park, California (36.58165° N, 118.75144° W), the largest tree on Earth by
volume. **We look straight down on it, north up.** The zoom page is `tools/powers-of-ten.html`.

## How the tiles work

- **Levels.** Level *k* is a square 40 m ÷ 3^k across (L0 = 40 m … L9 = 2 mm), centred on the
  zoom's centre. Each level is 3× the one inside it.
- **Tiles.** Each level is a 3×3 grid of square tiles, named by compass direction:
  `NW N NE / W C E / SW S SE`. A tile is a third of its level across.
- **The centre tile is never generated.** `C` of level *k* is exactly the whole of level *k*+1,
  shrunk 3×. So each level needs **8 new tiles**: 72 in all for L1 to L9. (`C` files are
  included only as context.)
- **Overlap.** Every reference file is the tile **plus 12.5% on each side** (1,280 px for a
  1,024 px tile), so neighbouring tiles overlap and the seams can be blended. Generate the whole
  1,280 px square; the middle 1,024 px is the tile.
- **Scale.** 1,024 px across a tile: L1 is 4.3 mm a pixel, L9 0.66 µm a pixel.

## The files

```
L0-39.8m/   the real photo (NAIP): level-photo.jpg and its 9 tiles (*-photo.jpg). Don't generate: it's the truth to match.
L1-13.3m/   … L9-2.02mm/
  level-drawing.png   the whole level as the zoom draws it now (rough), 1,536 px
  level-names.jpg     the same with names on (what each thing is)
  NW-drawing.png …    each tile with its overlap, 1,280 px: the composition to keep
  NW-photo.jpg …      (L1 and L2 only) the real NAIP photo of the same ground, enlarged: soft, but true
manifest.json         every level and tile: width in metres, tile centre (metres east and north of the centre)
```

## What's at each level

| Level | Across | Tile | What's there (from the outside in) | Reference |
| --- | --- | --- | --- | --- |
| L0 | 40 m | 13.3 m | The top of the General Sherman tree's crown and its neighbours in the Giant Forest, from 40 m up: sequoia crowns, dark gaps, sunlit ground between. **Real photo.** | photo |
| L1 | 13.3 m | 4.4 m | The crown's top: clumps of foliage a few metres wide, gaps of shadow between them | photo (soft) + drawing |
| L2 | 4.4 m | 1.5 m | One part of the crown: clumps of foliage, the limbs under them in shadow | photo (very soft) + drawing |
| L3 | 1.5 m | 49 cm | One foliage clump: the twig and the sprays of branchlets on it | drawing |
| L4 | 49 cm | 16 cm | Sprays of branchlets, a thicker twig crossing | drawing |
| L5 | 16 cm | 5.5 cm | A few branchlets, each a cord of scale leaves; the ladybug a red dot near the middle | drawing |
| L6 | 5.5 cm | 1.8 cm | The ladybug (9.5 mm) on one branchlet | drawing |
| L7 | 1.8 cm | 6 mm | The ladybug filling the middle, on the scale leaves | drawing |
| L8 | 6 mm | 2 mm | The ladybug's wing cases close up; the dew drop on the right one | drawing |
| L9 | 2 mm | 0.7 mm | The dew drop (1.5 mm across), the red wing case through and around it, the amoeba (0.3 mm) inside the drop | drawing |

Inside L9 the zoom carries on in code (the amoeba, its nucleus, DNA, the atom); this kit stops
at the dew drop.

## What's true, so it looks right

- **Giant sequoia foliage** (*Sequoiadendron giganteum*): no needles in sprays like a fir. The
  branchlets are cords, about 3 mm thick, wrapped in small, sharp, awl-shaped scale leaves 3–6 mm
  long, overlapping in a spiral; blue-green to grey-green. Seen from above, the crown is billowy
  clumps of these cords, with rounded masses of foliage on big limbs.
- **The tree**: 84 m tall, crown about 30 m across, in a forest of other giant sequoias, sugar
  pines and firs (L0 shows them). The ground far below, between crowns, is sunlit, reddish-brown
  litter.
- **The ladybug** in the drawing is a red, black-spotted one (a seven-spot ladybird look). A
  species truer to the place is the **convergent lady beetle** (*Hippodamia convergens*), the
  one that gathers in huge numbers in the Sierra Nevada: orange-red wing cases with up to 13
  small black spots, two white converging dashes on the black-and-white pronotum. Either is fine
  for the test; say which you used.
- **The dew drop**: a clear, round bead of water 1.5 mm across sitting on the wing case, a bright
  highlight, the red shell seen through it a little magnified. The amoeba is a translucent,
  grainy blob 0.3 mm across, inside the drop.
- **Light**: match the photo. In L0 the crowns are lit from the **left (west)** and cast long
  shadows to the **right (east)**: the photo was taken in the afternoon, the sun fairly low.
  Every level should keep that light, from the left.
- **Looking straight down**, no perspective, no horizon, no sky. Natural colour, photographic,
  sharp to the edges (no depth-of-field blur, no vignette), **no text, no labels, no frames**.

## How to generate (a suggested order)

Work **from the outside in**: L1 first (it has to meet the real photo), then L2, and so on.
Within a level do the four sides (`N E S W`) first, then the corners, each time giving the
model the neighbours you've already made.

For each tile, give the model:
1. `<tile>-drawing.png`: the composition to keep (what goes where, how big).
2. `<tile>-photo.jpg` if there is one (L1, L2): the real ground, soft but true. Follow it over
   the drawing where they disagree.
3. The level above's tile around it, so the outer edge carries on: for an L*k* tile, the L*k*−1
   tile it sits in (for L1, that's `L0-39.8m/level-photo.jpg`).
4. Any neighbouring tiles of the same level already made.
5. `level-names.jpg`, so it knows what each shape is.

A starting prompt (fill in the brackets from the table above):

> This is one tile of a seamless, nested aerial-to-macro zoom, looking straight down, north up.
> The tile is [1.5 m] across and shows [one foliage clump of a giant sequoia: the twig and the
> sprays of branchlets on it]. Re-render the first image as a photograph: keep its composition
> exactly (every shape, its size and its place in the square), but make it real, with the
> detail a [1,280 px] photo of something [1.9 m] across would have. [The second image is a real
> photo of the same ground, enlarged: follow its colours, shadows and the positions of things.]
> Giant sequoia foliage is cords of small, sharp, overlapping scale leaves, blue-green, no
> needles. Light from the left (west), afternoon, shadows to the right. It must continue
> seamlessly into the neighbouring images I gave you at the shared edges. Square, 1,280 px,
> no text, no labels, no border, no vignette, no blur.

## Where to put the results

Save each one as `generated/L<k>-<width>/<tile>.png` (for example `generated/L3-1.47m/NE.png`),
the full 1,280 px square with its overlap. Note at the top of `generated/NOTES.md` which model
and settings you used, and anything you changed in the prompt. The zoom doesn't read them yet:
once a few levels exist, they'll be stitched into one image per level (blending the overlaps)
and shown as plates like the photos.

## Credits

The L0–L2 photos are NAIP (USDA Farm Service Agency / USGS The National Map), public domain.
The drawings are the zoom's own code. The ladybug and amoeba pictures in the drawings are the
chart's icons (`content/icons/`).
