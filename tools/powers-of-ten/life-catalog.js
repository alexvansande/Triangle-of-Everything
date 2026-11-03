import {rng} from './math.js';
export const LIFE_TILE=16;
const patterns={
 block:[[0,0],[1,0],[0,1],[1,1]],
 beehive:[[1,0],[2,0],[0,1],[3,1],[1,2],[2,2]],
 boat:[[0,0],[1,0],[0,1],[2,1],[1,2]],
 tub:[[1,0],[0,1],[2,1],[1,2]],
 blinker:[[0,0],[1,0],[2,0]],
 toad:[[1,0],[2,0],[3,0],[0,1],[1,1],[2,1]],
 beacon:[[0,0],[1,0],[0,1],[1,1],[2,2],[3,2],[2,3],[3,3]],
 glider:[[1,0],[2,1],[0,2],[1,2],[2,2]],
 lwss:[[1,0],[4,0],[0,1],[0,2],[4,2],[0,3],[1,3],[2,3],[3,3]],
 pulsar:[]
};
for(const a of [2,3,4,8,9,10])for(const b of [0,5,7,12])patterns.pulsar.push([a,b],[b,a]);
export function buildLifeCatalog(tileSize=16){
 if(tileSize!==8&&tileSize!==16)throw Error("Life tiles must be 8 or 16 cells");
 const catalog=[];
 function add(name,placements){const cells=new Uint8Array(tileSize*tileSize);for(const [kind,x,y]of placements)for(const [dx,dy]of patterns[kind])cells[(y+dy)*tileSize+x+dx]=1;catalog.push({name,cells,grey:cells.reduce((s,v)=>s+v,0)/(tileSize*tileSize)});}
 add('empty',[]);
 for(const name of Object.keys(patterns)){
  const p=patterns[name],w=Math.max(...p.map(p=>p[0]))+1,h=Math.max(...p.map(p=>p[1]))+1;
  if(w>tileSize||h>tileSize)continue;
  add(name,[[name,Math.floor((tileSize-w)/2),Math.floor((tileSize-h)/2)]]);
  if(tileSize===8){
   // Some variants reach the tile edge; no reserved black perimeter.
   add(name+" corner",[[name,0,0]]);
   add(name+" opposite",[[name,8-w,8-h]]);
   continue;
  }
  if(w<6&&h<6)add(name+' quartet',[[name,2,2],[name,9,2],[name,2,9],[name,9,9]]);
 }
 if(tileSize===8)add('mixed garden',[['block',0,0],['glider',5,5]]);
 else add('mixed garden',[['block',2,2],['beehive',9,2],['blinker',2,10],['glider',9,9]]);
 return catalog.sort((a,b)=>a.grey-b.grey);
}
export function seedLifeCatalog(greys,tiles=32,seed=1907){
 const random=rng(seed),catalog=buildLifeCatalog(),size=tiles*16,cells=new Uint8Array(size*size);let noise=0;
 for(let ty=0;ty<tiles;ty++)for(let tx=0;tx<tiles;tx++){
  // Compress tones into the useful density range of separated Life motifs.
  const tone=Math.max(0,Math.min(1,greys[ty*tiles+tx])),target=.012+.19*tone;
  let tile;
  if(random()<.12){tile=Uint8Array.from({length:256},(_,i)=>{const x=i%16,y=i>>4;return x>1&&x<14&&y>1&&y<14&&random()<target*1.7?1:0;});noise++;}
  else{const choices=[...catalog].sort((a,b)=>Math.abs(a.grey-target)-Math.abs(b.grey-target)).slice(0,3);tile=choices[Math.floor(random()*choices.length)].cells;}
  const turns=Math.floor(random()*4),mirror=random()<.5;
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){let X=mirror?15-x:x,Y=y;for(let j=0;j<turns;j++)[X,Y]=[15-Y,X];cells[(ty*16+y)*size+tx*16+x]=tile[Y*16+X];}
 }
 return {cells,size,noise,catalog};
}
