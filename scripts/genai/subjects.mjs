// The big molecules drawn by an image generator from the Hopf style references
// (refs/) and a geometry diagram (diagrams/): which Protein Data Bank structure,
// how to draw its diagram, and what the prompt says about it.
//   pdb       the structure (files.rcsb.org mmCIF)
//   backbone  atom names joined into each chain's backbone line (CA protein, P nucleic acid)
//   backboneOnly  only the backbone atoms get dots (the ribosome: ~150,000 atoms)
//   chains    keep only the chains whose name matches (one copy of a structure that holds two)
//   about     what the generator should know about this subject
export const SUBJECTS = {
  dna: { pdb: "1BNA", name: "DNA", backbone: ["P"], dot: 2.4, line: 3.5,
    about: "B-form DNA, the Drew–Dickerson dodecamer: 12 base pairs, two strands wound into a right-handed double helix, one full turn every ~10.5 base pairs (3.4 nm), 2 nm across. The two backbone lines in the diagram are the sugar–phosphate strands (orange dots: phosphorus); the paired bases are the rungs between them. On the chart, DNA stands for the molecule in general, so the helix can continue past the 12 pairs shown, but keep its proportions." },
  insulin: { pdb: "4INS", name: "Insulin", backbone: ["CA"], dot: 2.2,
    about: "Insulin as stored in the pancreas: the structure holds insulin molecules (each an A chain of 21 amino acids and a B chain of 30, joined by disulfide bridges, yellow dots: sulfur) around zinc ions (grey). The coloured lines are the chains' backbones." },
  hemoglobin: { pdb: "4HHB", name: "Hemoglobin", backbone: ["CA"], dot: 1.8,
    about: "Human deoxyhemoglobin: four chains (two α, two β), each folded around a heme with an iron atom at its centre (the four large orange dots), which is where oxygen binds. About 5 nm across." },
  "antibody-igg": { pdb: "1IGT", name: "Antibody (IgG)", backbone: ["CA"], dot: 1.4,
    about: "A whole IgG antibody: a Y of three arms, two heavy and two light chains. The two arms of the Y each end in an antigen-binding tip; the stem (Fc) is what immune cells grab. About 15 nm across." },
  // 4YBB's crystal holds two ribosomes: chains A* (small subunit) and D* (large) are one,
  // B* and C* the other (paired by distance: each small subunit's centre ~100 Å from its large one)
  ribosome: { pdb: "4YBB", name: "Ribosome", backbone: ["P", "CA"], backboneOnly: true, chains: /^[AD]/, dot: 0.9, line: 1.2,
    about: "The bacterial (E. coli) 70S ribosome: a large and a small subunit, about two-thirds RNA (the orange phosphorus backbone lines) and one-third protein (the other colours), ~20 nm across. It reads messenger RNA and builds proteins. Only the backbones are drawn; the real thing is a dense, knobbly mass." },
};

export function promptFor(slug, s, { atoms, chains }) {
  return `# ${s.name}: image prompt

Attach, in this order:
1. The style references in \`scripts/genai/refs/\`: \`hydrogen.png\`, \`carbon.png\`, \`oxygen.png\`, \`water.png\`,
   \`adenine-a.png\`, \`fullerene-c60.png\` (and \`iron.png\` for hemoglobin, \`sulfur.png\` for insulin).
2. The geometry reference \`scripts/genai/diagrams/${slug}.png\` (PDB ${s.pdb}: ${atoms.toLocaleString("en")} heavy atoms, ${chains} chain${chains > 1 ? "s" : ""}).

## Prompt

> The first images are the style: atoms and small molecules drawn as electron clouds woven from
> thin glowing lines (Hopf circles), cyan with brighter streaks, on pure black; each atom's nucleus
> a small glowing dot in its element's colour (carbon pale gold, oxygen red, nitrogen blue,
> phosphorus orange, sulfur yellow, hydrogen white), bonds as faint thin lines between nuclei.
> Molecules (adenine, C₆₀) show one shared cloud hugging the whole molecule, densest along the bonds.
>
> The last image is the geometry of ${s.name}: ${s.about}
>
> Draw ${s.name} in exactly that style and that geometry: keep the overall shape, the chains'
> paths and the positions of the landmark atoms (the larger dots) from the diagram, viewed the same
> way. At this size single atoms blur together: show the molecule as a woven electron cloud
> following the backbones, with the nuclei as a fine sparkle of coloured dots, not as balls.
> No text, no labels, no axes. Square image, the molecule centred with a little black margin.

## Then

Save the result as \`scripts/genai/generated/${slug}.png\` and run \`node scripts/genai/install.mjs ${slug}\`.
`;
}
