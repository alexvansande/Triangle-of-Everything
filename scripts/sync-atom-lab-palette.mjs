import {writeFile} from 'node:fs/promises';
import {ELEMENT_TYPES,elementType} from '../src/data.js';
const types=Object.fromEntries(ELEMENT_TYPES.map(t=>[t.id,t.color]));
const colors=Array.from({length:119},(_,z)=>z?types[elementType(z)]:null);
await writeFile(new URL('../public/hopf/periodic-palette.js',import.meta.url),'// Generated from src/data.js periodic-table colours. Run scripts/sync-atom-lab-palette.mjs after table palette changes.\nexport const ELEMENT_COLORS_BY_Z='+JSON.stringify(colors)+';\n');
