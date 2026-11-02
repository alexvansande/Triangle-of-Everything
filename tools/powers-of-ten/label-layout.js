// Screen-space labels share one collision pass, including grid/radius captions.
export function fitLabels(items,frame,gap=4){
 const kept=[];
 for(const item of items.slice().sort((a,b)=>a.top-b.top||a.left-b.left)){
  const w=item.right-item.left,h=item.bottom-item.top;
  if(!Number.isFinite(w+h)||w>frame.right-frame.left||h>frame.bottom-frame.top)continue;
  const dx=Math.max(frame.left-item.left,Math.min(0,frame.right-item.right));
  const box={...item,left:item.left+dx,right:item.right+dx,dx};
  if(box.top<frame.top||box.bottom>frame.bottom)continue;
  if(kept.some(k=>box.left<k.right+gap&&box.right>k.left-gap&&box.top<k.bottom+gap&&box.bottom>k.top-gap))continue;
  kept.push(box);
 }
 return kept;
}
export function collectLabels(ctx){
 const fill=ctx.fillText,stroke=ctx.strokeText,items=[];let outline=null;
 ctx.strokeText=function(text,x,y){outline={text,x,y,colour:this.strokeStyle,width:this.lineWidth};};
 ctx.fillText=function(text,x,y){
  const m=this.measureText(text),size=parseFloat(this.font)||24;
  const left=x-(m.actualBoundingBoxLeft??m.width/2),right=x+(m.actualBoundingBoxRight??m.width/2);
  const top=y-(m.actualBoundingBoxAscent??size),bottom=y+(m.actualBoundingBoxDescent??0);
  const edge=outline?.text===text&&outline.x===x&&outline.y===y?outline:null,pad=(edge?.width||0)/2;
  items.push({text,x,y,left:left-pad,right:right+pad,top:top-pad,bottom:bottom+pad,font:this.font,align:this.textAlign,baseline:this.textBaseline,alpha:this.globalAlpha,colour:this.fillStyle,outline:edge});outline=null;
 };
 return(frame,gap)=>{
  ctx.fillText=fill;ctx.strokeText=stroke;ctx.save();
  for(const i of fitLabels(items,frame,gap)){
   ctx.font=i.font;ctx.textAlign=i.align;ctx.textBaseline=i.baseline;ctx.globalAlpha=i.alpha;
   if(i.outline){ctx.strokeStyle=i.outline.colour;ctx.lineWidth=i.outline.width;stroke.call(ctx,i.text,i.x+i.dx,i.y);}
   ctx.fillStyle=i.colour;fill.call(ctx,i.text,i.x+i.dx,i.y);
  }ctx.restore();
 };
}
export function labelFrame(W,H,aspect,margin=0){
 const w=Math.min(W,H*aspect),h=Math.min(H,W/aspect);
 return{left:(W-w)/2+margin,right:(W+w)/2-margin,top:(H-h)/2+margin,bottom:(H+h)/2-margin};
}
