# Ribosome: image prompt

Attach, in this order:
1. The style references in `scripts/genai/refs/`: `hydrogen.png`, `carbon.png`, `oxygen.png`, `water.png`,
   `adenine-a.png`, `fullerene-c60.png` (and `iron.png` for hemoglobin, `sulfur.png` for insulin).
2. The geometry reference `scripts/genai/diagrams/ribosome.png` (PDB 4YBB: 144,495 heavy atoms, 53 chains).

## Prompt

> The first images are the style: atoms and small molecules drawn as electron clouds woven from
> thin glowing lines (Hopf circles), cyan with brighter streaks, on pure black; each atom's nucleus
> a small glowing dot in its element's colour (carbon pale gold, oxygen red, nitrogen blue,
> phosphorus orange, sulfur yellow, hydrogen white), bonds as faint thin lines between nuclei.
> Molecules (adenine, C₆₀) show one shared cloud hugging the whole molecule, densest along the bonds.
>
> The last image is the geometry of Ribosome: The bacterial (E. coli) 70S ribosome: a large and a small subunit, about two-thirds RNA (the orange phosphorus backbone lines) and one-third protein (the other colours), ~20 nm across. It reads messenger RNA and builds proteins. Only the backbones are drawn; the real thing is a dense, knobbly mass.
>
> Draw Ribosome in exactly that style and that geometry: keep the overall shape, the chains'
> paths and the positions of the landmark atoms (the larger dots) from the diagram, viewed the same
> way. At this size single atoms blur together: show the molecule as a woven electron cloud
> following the backbones, with the nuclei as a fine sparkle of coloured dots, not as balls.
> No text, no labels, no axes. Square image, the molecule centred with a little black margin.

## Then

Save the result as `scripts/genai/generated/ribosome.png` and run `node scripts/genai/install.mjs ribosome`.
