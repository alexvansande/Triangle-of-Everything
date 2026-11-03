import sharp from 'sharp';import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../video/powers-of-ten/generated/dna-code-v3/',import.meta.url),p=f=>new URL(f,root).pathname,pack=JSON.parse(await readFile('/private/tmp/dna-code-pack.json'));
for(const [name,data]of Object.entries(pack.renders))await writeFile(p(name+'-native.png'),Buffer.from(data.split(',')[1],'base64'));
await sharp(p('surroundings-native.png')).composite([{input:p('hydrogen-native.png')}]).png().toFile(p('dna-flat.png'));
await writeFile(p('capture.json'),JSON.stringify({...pack,renders:undefined,source:'1BNA, aligned guanine N1-bound H at origin',orbDominant:true},null,2));
const old=new URL('../video/powers-of-ten/generated/guanine-bridge-v2/',import.meta.url);
const bg=await sharp(new URL('../video/powers-of-ten/generated/canopy-test/micro/anatomy-v9/nuclear-pieces-v2/background.png',import.meta.url).pathname).extract({left:604,top:604,width:46,height:46}).resize(1254,1254).blur(12).png().toBuffer();
await sharp(bg).composite([{input:new URL('hero-carrier.png',old).pathname},{input:await sharp(p('dna-flat.png')).resize(139,139).png().toBuffer(),left:557,top:557}]).png().toFile(p('hero-guide.png'));
