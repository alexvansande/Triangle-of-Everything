import sharp from 'sharp';import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../video/powers-of-ten/generated/dna-code-v3/',import.meta.url),p=f=>new URL(f,root).pathname,n=1254;
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
async function assemble(name,childName,raw){
 const size=139,left=557,child=await sharp(p(childName+'-flat.png')).resize(size,size).ensureAlpha().png().toBuffer(),mask=await sharp(child).raw().toBuffer();
 const data=await sharp(raw).resize(n,n).ensureAlpha().raw().toBuffer();
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const a=mask[(y*size+x)*4+3]/255,w=smooth((a-.005)/.12);data[((y+left)*n+x+left)*4+3]*=1-w;}
 const carrier=await sharp(data,{raw:{width:n,height:n,channels:4}}).png().toBuffer();await writeFile(p(name+'-carrier.png'),carrier);await sharp(carrier).composite([{input:child,left,top:left}]).png().toFile(p(name+'-flat.png'));
}
await assemble('hero','dna',p('hero-raw.png'));
await assemble('field','hero',p('field-raw.png'));
// The live layer carries exactly the nuclear texture underneath its parent.
const back=new URL('../canopy-test/micro/anatomy-v9/nuclear-pieces-v2/background.png',root).pathname;
await sharp(back).extract({left:604,top:604,width:46,height:46}).resize(n,n).blur(12).png().toFile(p('background.png'));
await writeFile(p('provenance.json'),JSON.stringify({coordinateSource:'https://www.rcsb.org/structure/1BNA',source:'1BNA.pdb',native:'dna-flat.png',nativeParts:['surroundings-native.png','hydrogen-native.png'],span_m:12e-6/3**7,heroSpan_m:12e-6/3**5,heroGeneration:'exec-b91bcb4d-c951-4681-84ff-ab50dcb98e8e.png',fieldGeneration:'exec-8f6f6a35-f866-4012-b579-0c6b59205b5a.png',references:['hero-guide.png','dna-flat.png'],method:'Exact code capture inserted at 1/9 native size; regenerate surrounding DNA as luminous orbs with subtle fibers. Larger nuclear background crop reused behind live 3D. Selected atom orb smoothly gives way to fine Hopf fibers on entry.',limitations:'Published heavy atom DNA geometry with the existing guanine conformer substituted at A4 to maintain target hydrogen registration. Other hydrogens omitted. Display clouds are artistic covalent-contact envelopes, not measured density.'},null,2));
