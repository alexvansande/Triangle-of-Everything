// Shared frame-exact workprint timeline, including the Life threshold time.
export const ZOOM_DURATION=180;
// A 30-Planck square master cropped to vertical 9:16 spans 16.875 cells
// across its short side, the physical quantity used by the zoom camera.
export const VIDEO_END_PLANCK_WIDTH=30*9/16;
export const VIDEO_END_SCALE=Math.log10(1.616255e-35*VIDEO_END_PLANCK_WIDTH);
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
// The zoom follows the narration (video/scripts/recording-scripts.md, "Full script, three
// minutes"): each key is [video seconds, log10 of the frame width in metres] for the thing the
// line names. A monotone cubic through them keeps the speed continuous: it eases into each stop
// and speeds up across the empty stretches, then comes to rest on the Planck grid.
const START_SCALE=Math.log10(2*46e9*9.4607e15/.42);
const KEYS=[
 [0,START_SCALE],[16,26.75],   // the CMB, barely moving
 [22,26.45],                   // the cosmic event horizon
 [32,24.7],                    // superclusters
 [40,23],                      // Andromeda and the Milky Way
 [46,20.9],                    // the Sun
 [52,17.85],                   // Sirius
 [59,16.3],                    // the Oort Cloud
 [66,13],                      // the planets' orbits: Jupiter, Saturn
 [69.5,11.3],                  // the inner planets, the third one out: Earth
 [73,9.2],                     // the Moon's orbit
 [75.5,7.4],                   // Earth fills the frame
 [77,6.7],                     // North America
 [79,5.9],                     // California
 [81,5.1],                     // the Sierra Nevada
 [85,1.8],                     // the sequoias, the General Sherman
 [90.5,-2.1],                  // the ladybug
 [94,-2.9],                    // a drop of dew
 [97.5,-3.4],                  // the amoeba, a single cell
 [101,-4.4],                   // its nucleus
 [104.5,-5.8],                 // chromatin
 [107.5,-7.3],                 // the double helix
 [114,-9.8],                   // the atom (hydrogen)
 [124,-13.5],                  // the nucleus: a single proton, tiny
 [132,-14.5],                  // the proton
 [144,-18.5],                  // the quark patterns, the LHC's limit
 [162,-27],                    // the grey terrain
 [176,VIDEO_END_SCALE],        // the Planck grid, then held
];
// Fritsch-Carlson slopes: no overshoot, so the zoom never backs up
const SLOPES=(()=>{
 const n=KEYS.length,d=[],m=[];
 for(let i=0;i<n-1;i++)d.push((KEYS[i+1][1]-KEYS[i][1])/(KEYS[i+1][0]-KEYS[i][0]));
 m[0]=0;m[n-1]=0;
 for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(2*d[i-1]*d[i])/(d[i-1]+d[i]);
 return m;
})();
function scaleAt(seconds){
 const t=Math.max(0,Math.min(ZOOM_DURATION,seconds));
 let i=0;while(i<KEYS.length-2&&t>KEYS[i+1][0])i++;
 const [t0,s0]=KEYS[i],[t1,s1]=KEYS[i+1],h=t1-t0,u=Math.max(0,Math.min(1,(t-t0)/h));
 return (2*u**3-3*u**2+1)*s0+(u**3-2*u**2+u)*h*SLOPES[i]+(-2*u**3+3*u**2)*s1+(u**3-u**2)*h*SLOPES[i+1];
}
export function zoomProgress(seconds){
 return (START_SCALE-scaleAt(seconds))/(START_SCALE-VIDEO_END_SCALE);
}
export const openingOrbit=seconds=>.28*smooth(seconds/10);
export function timeAtProgress(progress){
 let lo=0,hi=ZOOM_DURATION;
 for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(zoomProgress(mid)<progress)lo=mid;else hi=mid;}
 return (lo+hi)/2;
}
