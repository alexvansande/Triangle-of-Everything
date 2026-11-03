// Shared image loading without constructing any procedural scene layers.
export function image(src){
 const img=new Image();img.src=src;img.decode?.().catch(()=>{});return img;
}
