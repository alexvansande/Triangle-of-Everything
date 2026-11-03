// Three independent Conway fields, stored as RGB bits in each Planck cell.
export function stepRGBLife(cells,size){
 const next=new Uint8Array(cells.length);
 for(let y=1;y<size-1;y++)for(let x=1;x<size-1;x++){
  const i=y*size+x;
  for(const bit of [1,2,4]){
   let count=0;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy)count+=!!(cells[i+dy*size+dx]&bit);
   if(count===3||((cells[i]&bit)&&count===2))next[i]|=bit;
  }
 }return next;
}
