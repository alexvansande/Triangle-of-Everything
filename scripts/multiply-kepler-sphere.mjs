// Rebuild the approved albedo × reference-sphere experiment without AI shading.
import sharp from 'sharp';
import fs from 'node:fs/promises';

const slug = process.argv[2] || 'kepler-22b';
const strength = Number(process.argv[3] ?? 1);
if (!/^[a-z0-9-]+$/.test(slug) || !Number.isFinite(strength) || strength<0 || strength>1)
  throw new Error('Usage: node scripts/multiply-kepler-sphere.mjs [slug] [multiply opacity 0..1]');
const dir = `content/icons/candidates/${slug}-refresh`;
const size = 1254, diameter = 1180, pad = (size - diameter) / 2;
async function disc(path) {
  const {data, info} = await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let left=info.width, top=info.height, right=0, bottom=0;
  for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) {
    if(data[(y*info.width+x)*4+3] > 127) {
      left=Math.min(left,x); top=Math.min(top,y);
      right=Math.max(right,x); bottom=Math.max(bottom,y);
    }
  }
  return sharp(path).extract({left,top,width:right-left+1,height:bottom-top+1})
    .resize(diameter,diameter,{fit:'fill'}).ensureAlpha().raw().toBuffer();
}
const [albedo, lighting] = await Promise.all([
  disc(`${dir}/albedo.png`), disc('content/icons/src/sphere template.png'),
]);
const pixels=Buffer.alloc(diameter*diameter*4);
for(let i=0;i<pixels.length;i+=4) {
  // Literal sRGB Multiply, as in a normal image editor. No extra lighting curve.
  for(let c=0;c<3;c++) pixels[i+c]=Math.round(albedo[i+c]*(1-strength+strength*lighting[i+c]/255));
  pixels[i+3]=Math.min(albedo[i+3],lighting[i+3]);
}
const shaded=await sharp(pixels,{raw:{width:diameter,height:diameter,channels:4}}).png().toBuffer();
const output=await sharp({create:{width:size,height:size,channels:4,background:'#00000000'}})
  .composite([{input:shaded,left:pad,top:pad}]).png().toBuffer();
await fs.writeFile(`content/icons/src/${slug}.png`,output);
await sharp(output).resize(128,128).webp({lossless:true}).toFile(`content/icons/${slug}.webp`);
