// Shared frame-exact workprint timeline, including the Life threshold time.
export const ZOOM_DURATION=180;
// A 30-Planck square master cropped to vertical 9:16 spans 16.875 cells
// across its short side, the physical quantity used by the zoom camera.
export const VIDEO_END_PLANCK_WIDTH=30*9/16;
export const VIDEO_END_SCALE=Math.log10(1.616255e-35*VIDEO_END_PLANCK_WIDTH);
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
// The zoom follows the narration (rec52, 2026-11-03; video/short-00-powers-of-ten/zoom-keys.json):
// each key is [video seconds, log10 of the frame width in metres], at the first word of the thing's
// name. A monotone cubic through them keeps the speed continuous: it eases into each stop and speeds
// up across the empty stretches, then comes to rest on the Planck grid and holds the gliders.
export const VIDEO_START_SCALE=Math.log10(2*46e9*9.4607e15/.42);
const START_SCALE=VIDEO_START_SCALE;
const KEYS=[
 [0,START_SCALE],[11.83,27.05], // the CMB, whole, barely moving
 [27.3,26.9],                   // the cosmic event horizon, whole (the author, 2026-11-03: it had left the frame)
 [31,26.78],                    // ... still in view to the end of its sentence
 [39.38,24.7],                  // superclusters
 [44.54,24.35],                 // Laniakea
 [53.58,23.1],                  // the Local Group
 [55.96,22.7],                  // Andromeda
 [57.06,21.8],                  // the Milky Way: that's us
 [61.09,20.4],                  // the Sun
 [64.09,18.1],                  // the nearby stars
 [68.63,16.3],                  // the Oort Cloud
 [74.89,13],                    // the planets
 [77.43,11.3],                  // Earth's orbit
 [80.04,9.2],                   // the Moon
 [83.1,6.7],                    // North America
 [84.06,5.9],                   // California
 [85.17,4.95],                  // the Sierra Nevada
 [87,3.55],                     // the sequoias
 [90.31,1.8],                   // the General Sherman
 [95.25,-1.9],                  // the ladybug, whole (we were already in the drop)
 [96.8,-2.25],                  // ... drinking
 [97.69,-2.9],                  // a drop of dew
 [102.3,-4.0],                  // the amoeba, a single cell
 [103.58,-4.8],                 // its nucleus, the DNA
 [109.64,-7.3],                 // the double helix
 [113.19,-9.8],                 // the atom (hydrogen)
 [123.88,-12],                  // mostly empty space
 [129.02,-14.5],                // the proton
 [134.93,-18.5],                // the quarks
 [139.76,-22],                  // the rules
 [146.92,-27],                  // the grey terrain
 [159.3,-30.3],                 // the Planck length named: still terrain
 [167,-31.2],                   // "maybe, deep down": the Life colours come through
 [169.2,-32.8],                 // 100 Planck lengths across: the gliders start
 [172,VIDEO_END_SCALE],         // the Planck grid, then held to the end
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
// Begin slightly before the calibrated entry orientation and arrive at it
// without residual spin. The shared basis turns both shell and interior.
export const openingOrbit=seconds=>-.24*(1-smooth(seconds/20));
export function timeAtProgress(progress){
 let lo=0,hi=ZOOM_DURATION;
 for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(zoomProgress(mid)<progress)lo=mid;else hi=mid;}
 return (lo+hi)/2;
}
