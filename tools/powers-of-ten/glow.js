// A soft glow of a layer: the layer again at a quarter and a sixteenth of its size, added over the
// frame. The layers themselves are laid over, not added (their dense places build up to their own
// colour, not to white); this puts a little light and white back on the brightest places only
// (the author, 2026-11-09: "a little bit of white and glow is good, just not too much to blob
// everything"). near and far are the strengths of the two blurs.
const buffers={};
function buffer(name,w,h){
 let c=buffers[name];if(!c)c=buffers[name]=document.createElement('canvas');
 if(c.width!==w||c.height!==h){c.width=w;c.height=h;}
 const x=c.getContext('2d');x.clearRect(0,0,w,h);x.imageSmoothingQuality='high';return [c,x];
}
export function addGlow(ctx,layer,W,H,near=.3,far=.35){
 if(near<=0&&far<=0)return;
 const w4=Math.max(1,W>>2),h4=Math.max(1,H>>2),w16=Math.max(1,W>>4),h16=Math.max(1,H>>4);
 const [q,qx]=buffer('quarter',w4,h4),[e,ex]=buffer('sixteenth',w16,h16);
 qx.drawImage(layer,0,0,w4,h4);ex.drawImage(q,0,0,w16,h16);
 ctx.save();ctx.globalCompositeOperation='lighter';ctx.imageSmoothingQuality='high';
 ctx.globalAlpha=near;ctx.drawImage(q,0,0,W,H);ctx.globalAlpha=far;ctx.drawImage(e,0,0,W,H);
 ctx.restore();
}
