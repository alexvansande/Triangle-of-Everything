// Public renderer modules are copied verbatim in production. Blob imports also
// avoid Vite treating those public scripts as source assets during local review.
let loading;
export function loadMolecularCore(){
 return loading??=(async()=>{
  const files=['molecules.js','big-molecules.js','molecular-element-colors.js','hopf-core.js','molecular-clouds.js'],urls={};
  const sources=await Promise.all(files.map(async f=>{const r=await fetch('/hopf/'+f);if(!r.ok)throw Error('Missing Hopf module '+f);return r.text();}));
  for(let i=0;i<files.length;i++){
   let source=sources[i];for(const [file,url]of Object.entries(urls))source=source.replaceAll("'./"+file+"'",JSON.stringify(url));
   urls[files[i]]=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  }
  const core=await import(/* @vite-ignore */ urls['hopf-core.js']);
  const data=await import(/* @vite-ignore */ urls['molecules.js']);
  const clouds=await import(/* @vite-ignore */ urls['molecular-clouds.js']);
  return {core,...data,...clouds};
 })();
}
