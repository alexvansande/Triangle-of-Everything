// Registered A–T fragment from the existing3DNA standard-base coordinates.
// Coordinates in Å. The optical axis is the thymine N3-bound hydrogen.
export const BOHR=5.29177210544e-11;
export const DNA_SPAN=12e-6/3**7,PAIR_SPAN=DNA_SPAN/3,HYDROGEN_SPAN=PAIR_SPAN/3;
export const SNAPSHOT_TIME=3,SNAPSHOT_YAW=.6;
export const HOPF_OPTIONS={drift:true,flow:true,width:1,bloom:.9,exposure:1.1,core:.8};
export function basePairGeometry(){
  const A = { "C1'": [-2.479, 5.346], N9: [-1.291, 4.498], C8: [0.024, 4.897], N7: [0.877, 3.902], C5: [0.071, 2.771], C6: [0.369, 1.398], N6: [1.611, 0.909], N1: [-0.668, 0.532], C2: [-1.912, 1.023], N3: [-2.320, 2.290], C4: [-1.267, 3.124] };
  const Tr = { "C1'": [-2.481, 5.354], N1: [-1.284, 4.500], C2: [-1.462, 3.135], O2: [-2.562, 2.608], N3: [-0.298, 2.407], C4: [0.994, 2.897], O4: [1.944, 2.119], C5: [1.106, 4.338], C7: [2.466, 4.961], C6: [-0.024, 5.057] };
  const T = Object.fromEntries(Object.entries(Tr).map(([k, [x, y]]) => [k, [x, -y]]));
  const bondsA = [["C1'", "N9"], ["N9", "C8"], ["C8", "N7"], ["N7", "C5"], ["C5", "C6"], ["C6", "N6"], ["C6", "N1"], ["N1", "C2"], ["C2", "N3"], ["N3", "C4"], ["C4", "C5"], ["C4", "N9"]];
  const bondsT = [["C1'", "N1"], ["N1", "C2"], ["C2", "O2"], ["C2", "N3"], ["N3", "C4"], ["C4", "O4"], ["C4", "C5"], ["C5", "C7"], ["C5", "C6"], ["C6", "N1"]];
  const unit = (v) => { const l = Math.hypot(...v); return [v[0] / l, v[1] / l]; };
  const away = (at, ...nbs) => unit(nbs.reduce((s, nb) => { const u = unit([at[0] - nb[0], at[1] - nb[1]]); return [s[0] + u[0], s[1] + u[1]]; }, [0, 0]));
  const along = (at, dir, d) => [at[0] + dir[0] * d, at[1] + dir[1] * d];
  const rot = ([x, y], deg) => { const c = Math.cos(deg * Math.PI / 180), s = Math.sin(deg * Math.PI / 180); return [x * c - y * s, x * s + y * c]; };
  const atoms = [], bonds = [], hb = [];
  const put = (el, p, base) => { atoms.push({ el, p, base }); return p; };
  for (const [k, p] of Object.entries(A)) put(k[0] === "C" && k !== "C1'" ? "C" : k[0], p, "A");
  for (const [k, p] of Object.entries(T)) put(k[0], p, "T");
  for (const [a, b] of bondsA) bonds.push([A[a], A[b]]);
  for (const [a, b] of bondsT) bonds.push([T[a], T[b]]);
  const H = (p, base) => put("H", p, base);
  const hA2 = H(along(A.C2, away(A.C2, A.N1, A.N3), 1.08), "A");
  const hA8 = H(along(A.C8, away(A.C8, A.N7, A.N9), 1.08), "A");
  const dN6 = unit([A.N6[0] - A.C6[0], A.N6[1] - A.C6[1]]);
  const h61 = H(along(A.N6, rot(dN6, 60), 1.01), "A"), h62 = H(along(A.N6, rot(dN6, -60), 1.01), "A");
  const toO4 = Math.hypot(h61[0] - T.O4[0], h61[1] - T.O4[1]) < Math.hypot(h62[0] - T.O4[0], h62[1] - T.O4[1]) ? h61 : h62;
  const h3 = H(along(T.N3, away(T.N3, T.C2, T.C4), 1.01), "T");
  const h6 = H(along(T.C6, away(T.C6, T.N1, T.C5), 1.08), "T");
  for (const [p, q] of [[A.C2, hA2], [A.C8, hA8], [A.N6, h61], [A.N6, h62], [T.N3, h3], [T.C6, h6]]) bonds.push([p, q]);
  hb.push([h3, A.N1], [toO4, T.O4]);
  // the hydrogen of the middle bond (thymine N3–H ··· adenine N1) is the zoom's centre
  const O = h3;
  // Three methyl hydrogens, completing the thymine C7 substituent.
  const dir=unit([T.C7[0]-T.C5[0],T.C7[1]-T.C5[1]]),perp=[-dir[1],dir[0]];
  for(let j=0;j<3;j++){const t=j*2*Math.PI/3;atoms.push({el:'H',p:[T.C7[0]+.36*dir[0]+1.02*Math.cos(t)*perp[0],T.C7[1]+.36*dir[1]+1.02*Math.cos(t)*perp[1]],z:1.02*Math.sin(t),base:'T'});}
  const angle=-35*Math.PI/180,c=Math.cos(angle),si=Math.sin(angle);
  const project=p=>{const x=-(p[1]-O[1]),y=-(p[0]-O[0]);return [c*x-si*y,-(si*x+c*y)];};
  const target=atoms.findIndex(a=>a.p===h3);
  const scene=atoms.map(a=>[a.el,...project(a.p),a.z||0]);
  return {atoms:scene,target,targetDescription:'Thymine N3-bound hydrogen of the central N3–H···N1 adenine–thymine hydrogen bond',N_H_angstrom:1.01,source:'Existing3DNA standard-base coordinates in powers-of-ten/small.js; methyl hydrogens completed geometrically; glycosidic C1′ stubs mark attachment to sugars. A base-pair fragment, not a complete nucleotide.'};
}
// Same99% extent integration used by hopf-core's1s orbitalExtent.
export function hydrogenExtent(){const step=.02,p=[];let sum=0;for(let r=step;r<12;r+=step){sum+=(r*Math.exp(-r))**2;p.push(sum);}return step*(p.findIndex(v=>v>.99*sum)+1)*BOHR;}
export function hydrogenParticle(core){
 const source=core.PARTICLES.find(p=>p.id==='hydrogen');
 // Match the Hopf camera's28° projection at its centre to the physical span.
 const radius=HYDROGEN_SPAN/hydrogenExtent()*Math.cos(14*Math.PI/180)/(2*1.32);
 return {...source,frame:{center:[0,0,0],radius}};
}
export async function loadHopfCore(){
 const at=f=>new URL('/hopf/'+f,location.href).href;
 const src=(await (await fetch(at('hopf-core.js'))).text()).replace(/(["'])\.\/(molecules|big-molecules)\.js\1/g,(m,q,f)=>q+at(f+'.js')+q);
 const url=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));try{return await import(/* @vite-ignore */ url)}finally{URL.revokeObjectURL(url)}
}
