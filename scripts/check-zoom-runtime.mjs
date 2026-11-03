// Guard the canonical zoom against legacy fallback/entry-point regressions.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..'),seen=new Set();
function visit(file){file=path.resolve(file);if(seen.has(file))return;assert(fs.existsSync(file),'Missing module '+file);seen.add(file);const source=fs.readFileSync(file,'utf8');assert(!/from\s*['"]\.\/(?:micro|macro)\.js['"]/.test(source),'Legacy procedural scene import '+file);for(const m of source.matchAll(/(?:from\s*|import\s*\(?\s*)['"]([^'"]+)['"]/g))if(m[1].startsWith('.'))visit(path.resolve(path.dirname(file),m[1]));}
visit(path.join(root,'tools/powers-of-ten/full-journey.js'));
const html=fs.readFileSync(path.join(root,'tools/powers-of-ten.html'),'utf8');assert(html.includes('full-journey.js'));assert(!html.includes('<iframe'),'Hidden spectrum iframe should not load');
assert(fs.readFileSync(path.join(root,'tools/powers-of-ten/main.js'),'utf8').includes('import "./full-journey.js"'));
const required=JSON.parse(fs.readFileSync(path.join(root,'video/powers-of-ten/runtime-files.json'),'utf8'));
for(const file of required)assert(fs.existsSync(path.join(root,file)),'Missing runtime dependency '+file);
console.log(`Passed: ${seen.size} modules resolve, no procedural fallback imports or hidden iframe; ${required.length} runtime dependencies exist.`);
