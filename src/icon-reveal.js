// Reversible icon↔dot transition. The wrapper owns reveal transforms; hover
// continues to own the image transform, so the two animations do not compete.
const NS='http://www.w3.org/2000/svg';
let nextId=0;
const svg=(tag,attrs={})=>{const n=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n;};
export function revealShape(p,size,dot=2.8){
  const q=Math.max(0,Math.min(1,p));
  const settle=q<.08 ? 1-.15*Math.sin(Math.PI*q/.08) : 1;
  return {radius:(dot+(size*.72-dot)*Math.max(0,(q-.08)/.92))*settle,scale:.5+.5*q,
    cover:Math.max(0,1-q/.24)};
}
function setup(node){
  if(node.__reveal)return node.__reveal;
  const id=`icon-reveal-${++nextId}`,defs=svg('defs'),clip=svg('clipPath',{id,clipPathUnits:'userSpaceOnUse'}),circle=svg('circle');clip.append(circle);defs.append(clip);
  const crop=svg('g'),art=svg('g');while(node.firstChild)art.append(node.firstChild);crop.append(art);node.append(defs,crop);
  const cover=svg('circle');node.append(cover);
  return node.__reveal={p:0,target:null,crop,art,circle,cover,id,raf:0};
}
export function revealIcon(node,visible,options){
  const s=setup(node);s.options=options;
  const draw=()=>{
    const {x,y,size,color,dot=2.8,shadow=false,onProgress}=s.options;
    const a=revealShape(s.p,size,dot),r=a.radius;
    s.circle.setAttribute('cx',x);s.circle.setAttribute('cy',y);s.circle.setAttribute('r',a.radius);
    s.crop.setAttribute('transform',`translate(${(1-s.p)*(s.options.dx||0)} ${(1-s.p)*(s.options.dy||0)})`);
    s.crop.setAttribute('clip-path',s.p>=.999?'none':`url(#${s.id})`);
    s.art.setAttribute('transform',`translate(${x} ${y}) scale(${a.scale}) translate(${-x} ${-y})`);
    s.art.setAttribute('opacity',shadow?s.p:1);
    for(const [k,v] of Object.entries({cx:x+(1-s.p)*(s.options.dx||0),cy:y+(1-s.p)*(s.options.dy||0),r,fill:color||'#fff',opacity:a.cover*(shadow?.35:.85)}))s.cover.setAttribute(k,v);
    // only on a change: callers look their dots up, and this runs on every redraw
    if(s.reported!==s.p){s.reported=s.p;onProgress?.(s.p);}
  };
  s.draw=draw;
  const target=visible?1:0;
  // a fully shown icon draws as plain art (no clip, cover or offset): nothing to redraw
  if(s.target===target){if(!(target&&s.p>=1&&s.done))draw();s.done=target&&s.p>=1;return;}
  cancelAnimationFrame(s.raf);s.target=target;
  const start=s.p,t0=performance.now(),duration=options.reducedMotion?0:1000*Math.abs(target-start);
  const tick=now=>{
    const t=duration?Math.min(1,(now-t0)/duration):1;
    const eased=t*t*(3-2*t);s.p=start+(target-start)*eased;draw();
    if(t<1)s.raf=requestAnimationFrame(tick);
    else if(!target){s.options.onDone?.();node.remove();}
  };
  tick(t0);
}
export function exitReveal(selection,optionsOf){selection.each(function(d){revealIcon(this,false,optionsOf(d,this));});}
