const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
export function scaleText(m){
 const units=[[1e3,'km'],[1,'m'],[1e-2,'cm'],[1e-3,'mm'],[1e-6,'µm'],[1e-9,'nm'],[1e-12,'pm'],[1e-15,'fm']];
 const [v,u]=units.find(([v])=>m>=v*(1-1e-9))??[1,'m'];
 return `${Number((m/v).toPrecision(3))} ${u}`;
}
// World distances use the same metres-to-pixels camera scale as scene geometry.
export function drawScaleOverlay(cam,{grid=true,labels=true,canopy=false}={}){
 const {ctx,W,H,k,cx,cy,min,s,dpr}=cam;
 ctx.save();ctx.setTransform(1,0,0,1,0,0);
 if(grid){
  for(let e=Math.floor(s)-2;e<=Math.floor(s)+1;e++){
   const spacing=10**e*k,fraction=spacing/min;
   const a=.16*smooth(.018,.09,fraction)*(1-smooth(.65,1.3,fraction));
   if(a<.002)continue;
   ctx.strokeStyle=`rgba(241,249,245,${a})`;ctx.lineWidth=.7*dpr;ctx.beginPath();
   for(let x=cx-Math.floor(cx/spacing)*spacing;x<=W;x+=spacing){ctx.moveTo(x,0);ctx.lineTo(x,H)}
   for(let y=cy-Math.floor(cy/spacing)*spacing;y<=H;y+=spacing){ctx.moveTo(0,y);ctx.lineTo(W,y)}
   ctx.stroke();
  }
  // Centred physical squares exchange continuously at each decade.
  if(labels)for(let e=Math.floor(s)-2;e<=Math.floor(s)+1;e++){
   const m=10**e,side=m*k,fraction=side/min;
   const fade=smooth(.055,.15,fraction)*(1-smooth(.65,1.05,fraction));
   if(fade<.005)continue;
   ctx.globalAlpha=fade*.65;
   ctx.strokeStyle='#edf6ed';ctx.lineWidth=dpr;
   ctx.strokeRect(cx-side/2,cy-side/2,side,side);
   caption(ctx,scaleText(m),cx,cy-side/2-11*dpr,dpr);
  }
 }
 if(labels&&canopy){
  // Artistic estimate of crown width in these generated plates, not tree height.
  const diameter=13.3,ratio=diameter*k/min;
  const a=smooth(.07,.16,ratio)*(1-smooth(.65,.95,ratio));
  if(a>.005){ctx.globalAlpha=a*.75;ctx.strokeStyle='#e8f4dc';ctx.lineWidth=dpr;ctx.setLineDash([4*dpr,5*dpr]);ctx.beginPath();ctx.arc(cx,cy,diameter*k/2,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);caption(ctx,'Sequoia canopy · ≈13 m across',cx,cy-diameter*k/2-12*dpr,dpr);}
 }
 ctx.restore();
}
function caption(ctx,text,x,y,dpr){ctx.font=`${12*dpr}px system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=3*dpr;ctx.strokeStyle='#0b1714ba';ctx.strokeText(text,x,y);ctx.fillStyle='#edf6ed';ctx.fillText(text,x,y)}
