// A camera orbit, not a flat screen rotation: near/far structure changes.
export function cosmicOrbit(basis,angle){
 const c=Math.cos(angle),s=Math.sin(angle);
 return {r:basis.r.map((v,i)=>v*c+basis.n[i]*s),u:[...basis.u],n:basis.n.map((v,i)=>v*c-basis.r[i]*s)};
}
