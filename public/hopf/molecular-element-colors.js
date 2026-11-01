// Exact element display palette supplied by the user, 2026-11-01.
// Index is atomic number; radioactive markers in the source table are metadata,
// not an instruction to add a separate glow or alter the supplied colour.
export const MOLECULAR_ELEMENT_SYMBOLS=('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og').split(' ');
export const MOLECULAR_ELEMENT_COLORS=[null,...(`
3fe6ff 2bc4f2 39a2ec 3a81e5 3261de 1d3fd6 3958c6 4270b6 4287a5 379e93
0fb57f 27b974 34bc69 3ec05d 46c350 4cc742 73c93c 91ca36 abcb30 c4cc28
dbcc1f f2cc12 f0d05a ecd488 e6d8b2 dcdcdc c4c6ca bec0c5 b8babf b2b5ba
acafb5 a6a9b0 a0a4aa 9a9ea5 9499a0 8e939b 8a8f97 878b92 83878e 808389
7c7f85 797b81 f42850 727378 6e6f74 6b6b70 746b67 7c6b5e 836a55 8a6a4c
896849 886547 876344 866141 845e3f 835c3c 825a39 815737 805534 7e5331
fb3294 7c4e2c 7a4c2b 784a2a 764729 744528 734326 714125 6f3e24 6d3c23
6b3a22 6c3621 6d3221 6d2e20 6e2a20 70281e 71261d 73231b 74211a 761e18
771b17 791815 7a1414 fd3186 ec3adb f138c9 e43ae7 ff2f74 fb3292 e8222b
fb2c66 ea2330 f52953 f02643 fd2e6d f2274a ff2f75 ff2f78 f834a6 f635b1
f536b6 e73ce8 ed3ad9 e83ce8 ee39d2 dc38e6 e33ae7 e33ae7 da37e6 da37e6
e23ae7 e23ae7 d435e5 d636e5 cb32e4 c530e3 c32fe2 b42ae0
`).trim().split(/\s+/).map(c=>'#'+c)];
export const MOLECULAR_COLORS_BY_SYMBOL=Object.fromEntries(MOLECULAR_ELEMENT_SYMBOLS.map((s,i)=>[s.toUpperCase(),MOLECULAR_ELEMENT_COLORS[i+1]]));

// Approved molecular contrast refinements: retain radioactive magentas.
Object.assign(MOLECULAR_COLORS_BY_SYMBOL,{H:'#3fe6ff',C:'#3155e7',N:'#9365ed',O:'#ffe266',P:'#55dfba',S:'#b9a0ef'});
for(const [symbol,color] of Object.entries(MOLECULAR_COLORS_BY_SYMBOL)){
 const z=MOLECULAR_ELEMENT_SYMBOLS.findIndex(s=>s.toUpperCase()===symbol)+1;
 MOLECULAR_ELEMENT_COLORS[z]=color;
}
