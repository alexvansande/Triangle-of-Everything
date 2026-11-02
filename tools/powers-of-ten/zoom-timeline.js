// Shared frame-exact workprint timeline, including the Life threshold time.
export const ZOOM_DURATION=180;
// A 30-Planck square master cropped to vertical 9:16 spans 16.875 cells
// across its short side, the physical quantity used by the zoom camera.
export const VIDEO_END_PLANCK_WIDTH=30*9/16;
export const VIDEO_END_SCALE=Math.log10(1.616255e-35*VIDEO_END_PLANCK_WIDTH);
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const AREA=2+156+5.1;
export function zoomProgress(seconds){
 const t=Math.max(0,Math.min(ZOOM_DURATION,seconds));
 if(t<=10)return 0;
 if(t<14){const u=(t-10)/4;return 4*(u**3-.5*u**4)/AREA;}
 if(t<=170)return (2+t-14)/AREA;
 const u=(t-170)/10;
 return (158+10*(u-.98*(u**3-.5*u**4)))/AREA;
}
export const openingOrbit=seconds=>.28*smooth(seconds/10);
export function timeAtProgress(progress){
 let lo=10,hi=ZOOM_DURATION;
 for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(zoomProgress(mid)<progress)lo=mid;else hi=mid;}
 return (lo+hi)/2;
}
