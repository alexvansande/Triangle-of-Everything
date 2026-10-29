# Big molecules by image generator

The chart's atoms and small molecules are rendered directly from the Hopf model
(`public/hopf/hopf-core.js`: `scripts/hopf-icons.mjs --sidebar`). Molecules with
thousands of atoms (DNA, insulin, hemoglobin, the antibody, the ribosome) are too
big for that, so, as with the old spirograph atoms, an image generator draws them
from two kinds of reference:

1. **Style**: `refs/*.png`, Hopf atoms and small molecules rendered in their chart
   looks (`node scripts/genai/refs.mjs`, with the dev server up).
2. **Geometry**: `diagrams/<slug>.png`, the real structure from the Protein Data
   Bank (`subjects.mjs` names it) turned to its principal axes, every nucleus a dot
   in its element's colour, each chain's backbone a coloured line
   (`node scripts/genai/diagrams.mjs`; the mmCIF files cache in `pdb/`, not in git).

`diagrams.mjs` also writes `prompts/<slug>.md`: which images to attach, in which
order, and the prompt (the style, then what the molecule is and what to keep from
the diagram).

## Making one

1. `npm run dev`, then `node scripts/genai/refs.mjs` (only after the Hopf look changes)
2. `node scripts/genai/diagrams.mjs <slug>`
3. Give the image generator the attachments and prompt from `prompts/<slug>.md`
4. Save the result as `generated/<slug>.png`
5. `node scripts/genai/install.mjs <slug>` (sidebar picture + icon master), then `npm run process-icons`
6. Queue the videos that show it (`video/render-queue.txt`)

## Subjects

| slug | PDB | what |
| --- | --- | --- |
| `dna` | 1BNA | B-DNA dodecamer, 12 base pairs |
| `insulin` | 4INS | insulin around zinc, as stored in the pancreas |
| `hemoglobin` | 4HHB | human deoxyhemoglobin, 4 chains and 4 hemes |
| `antibody-igg` | 1IGT | a whole IgG antibody |
| `ribosome` | 4YBB | the E. coli 70S ribosome (one of the two in the crystal: chains A*, D*) |

Add one to `subjects.mjs` (its chart slug, PDB code, backbone atoms, what to say about it).
