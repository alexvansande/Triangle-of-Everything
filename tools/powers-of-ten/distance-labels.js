const powers={'-':'⁻',0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹'};
export function readableNumber(value){
 if(value>=1e15){const e=Math.floor(Math.log10(value)),m=Number((value/10**e).toPrecision(3));return `${m===1?'':m+' × '}10${String(e).split('').map(x=>powers[x]).join('')}`;}
 for(const [n,name] of [[1e12,'trillion'],[1e9,'billion'],[1e6,'million'],[1e3,'thousand']])if(value>=n*(1-1e-9))return `${Number((value/n).toPrecision(3))} ${name}`;
 return String(Number(value.toPrecision(3)));
}
export function distanceLabel(m){
 if(m>=1000*(1-1e-9))return `${readableNumber(m/1000)} km`;
 const units=[[1,'m'],[1e-2,'cm'],[1e-3,'mm'],[1e-6,'µm'],[1e-9,'nm'],[1e-12,'pm'],[1e-15,'fm'],[1e-18,'am'],[1e-21,'zm']];
 const [v,u]=units.find(([v])=>m>=v*(1-1e-9))??[1,'m'];return `${Number((m/v).toPrecision(3))} ${u}`;
}
