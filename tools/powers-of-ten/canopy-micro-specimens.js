// Physical body sizes and native alpha bounds, shared by tile assembly/runtime.
export const microSpecimens=[
 {file:'pollen',diameter:40e-6,bodyPixels:1105,center:[627,635],x:-26e-6,y:-8e-6,opacity:.9},
 {file:'amoeba-inner',diameter:8e-6,bodyPixels:836,center:[627,627],x:0,y:0,opacity:.82},
];
export const microDust=[
 {x:-.00025,y:.00018,diameter:7e-6,opacity:.20,angle:.7},
 {x:.00029,y:-.00021,diameter:5e-6,opacity:.15,angle:1.8},
 {x:.00014,y:.00028,diameter:3e-6,opacity:.17,angle:-.5},
];
// Additional species-inspired specimens. Size is the body/test span, never
// transparent canvas width; lags define separate suspended depth planes.
const communityAssets={
 microbe:{file:'amoeba',species:'Small free-living amoeba (illustrative)',bodyPixels:1152,center:[649.5,617.5]},
 pine:{file:'pine',species:'Pinus sylvestris',bodyPixels:1177,center:[628,619]},
 birch:{file:'birch',species:'Betula pendula',bodyPixels:1076,center:[628,628.5]},
 arcella:{file:'arcella',species:'Arcella vulgaris',bodyPixels:1197,center:[629,625]},
 vannella:{file:'vannella',species:'Vannella simplex',bodyPixels:1152,center:[651.5,610.5]},
};
const largerCommunity=[
 {kind:'pine',diameter:70e-6,x:-160e-6,y:40e-6,opacity:.9,angle:-.4,lag:.18},
 {kind:'pine',diameter:68e-6,x:280e-6,y:-100e-6,opacity:.85,angle:1.1,lag:-.12},
 {kind:'birch',diameter:24e-6,x:90e-6,y:-50e-6,opacity:.9,angle:.7,lag:.10},
 {kind:'birch',diameter:22e-6,x:-80e-6,y:120e-6,opacity:.85,angle:-1,lag:-.1},
 {kind:'birch',diameter:25e-6,x:-250e-6,y:-210e-6,opacity:.8,angle:2,lag:.26},
 {kind:'arcella',diameter:110e-6,x:-180e-6,y:280e-6,opacity:.85,angle:.6,lag:.32},
 {kind:'vannella',diameter:45e-6,x:150e-6,y:180e-6,opacity:.8,angle:-.6,lag:.12},
 {kind:'vannella',diameter:44e-6,x:45e-6,y:60e-6,opacity:.75,angle:1.5,lag:.06},
].map(p=>({...communityAssets[p.kind],...p}));

// Reproducible population of small cells at several distances. This is the
// same fixed water volume in the flat parent and in every subsequent frame.
let waterSeed=1439;
const randomWater=()=>{waterSeed=(Math.imul(waterSeed,1664525)+1013904223)>>>0;return waterSeed/4294967296};
const smallCommunity=[];
for(const [count,inner,outer] of [[18,12,55],[24,180,450]]){
 for(let i=0;i<count;i++){
  const r=Math.sqrt(inner*inner+randomWater()*(outer*outer-inner*inner))*1e-6;
  const angle=(i/count+randomWater()*.65/count)*Math.PI*2;
  const lag=(randomWater()-.35)*.24;
  smallCommunity.push({...communityAssets.microbe,diameter:(6+randomWater()*3.5)*1e-6,
   x:Math.cos(angle)*r,y:Math.sin(angle)*r,angle:randomWater()*Math.PI*2,
   opacity:.72+randomWater()*.2,lag,blurPixels:1+Math.abs(lag)*35});
 }
}
const organismField={file:'water-life-wide',species:'Mixed microscopic organism field (illustrative)',
 diameter:720e-6,bodyPixels:3762,sourcePixels:3762,center:[1881,1881],x:0,y:0,opacity:.8,
 angle:0,lag:.08,blurPixels:2,field:true};
export const microCommunity=[organismField,...largerCommunity,...smallCommunity];
