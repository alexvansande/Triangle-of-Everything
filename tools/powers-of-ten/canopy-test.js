// Optional review controls for the isolated, bright-centred crown test.
export function mountCanopyTest() {
  document.title='Powers of ten · CMB to quarks';
  const panel=document.createElement('aside');
  panel.style.cssText='position:fixed;z-index:10;top:16px;left:16px;right:16px;max-width:680px;padding:16px 18px;background:#0b1110e8;color:#eee;border:1px solid #ffffff28;border-radius:12px;font:13px/1.5 system-ui;box-shadow:0 8px 32px #0005';
  panel.innerHTML=`<strong style="font-size:17px">CMB → quarks</strong>
    <div style="color:#b5c4b9;margin:5px 0 12px">Cosmos → Earth → sequoia → ladybug → cell → DNA → atom → quarks</div>
    <div style="display:flex;flex-wrap:wrap;gap:7px" id="canopy-actions">
      <button data-s="${window.canopyTest.maximum}">CMB · universe</button><button data-s="24">Galaxy groups</button><button data-s="21">Milky Way</button><button data-s="13">Solar system</button><button data-s="7.7">Earth · globe</button><button id="full-in">Play CMB → quarks</button><button id="full-out">Play quarks → CMB</button><button id="full-stop">Stop journey</button>
      <button data-s="4.6">Satellite · 40 km</button><button data-s="1.6">Aerial · 40 m</button>
      <button data-s="1.123">Crown · 13 m</button><button data-s="1.69897">Check · 50 m</button>
      <button data-s="2.07712">Grove · 120 m</button><button data-s="2.60206">Forest · 400 m</button><button id="canopy-run">Play approach</button>
      <button data-s="0.64575749">Branch · 4.4 m</button><button data-s="0.16863624">Foliage · 1.5 m</button>
      <button data-s="-0.70">Depth check · 20 cm</button><button data-s="-0.30848502">Twig · 49 cm</button><button data-s="-0.78560627">Tiny ladybug · 16 cm</button>
      <button data-s="-1.26272753">Ladybug · 5.5 cm</button><button id="canopy-inward">Crown → micro</button><button id="canopy-timing">Test · 1 m → 3 cm</button><button data-s="-1.73984878">Ladybug · 18 mm</button><button data-s="-2.21697004">Shell · 6 mm</button><button data-s="-2.69409129">Dew · 2 mm</button><button data-s="-3">Drop layers · 1 mm</button><button data-s="-3.74472749">Pollen · 180 µm</button><button data-s="-4.22184875">Passing pollen · 60 µm</button><button data-s="-4.74472749">Small amoeba · 18 µm</button><button data-s="-5.22184875">Inside · 6 µm</button><button data-s="-4.92081875">New cell · 12 µm</button><button data-s="-5.39794001">Nucleus · 4 µm</button><button data-s="-6.35218252">Chromatin · 444 nm</button><button data-s="-7.30642503">Nucleosomes · 49 nm</button><button data-s="-8.26066754">DNA · 5.5 nm</button><button data-s="-9">DNA → atom · 1 nm</button><button data-s="-9.5">Hydrogen · 320 pm</button><button data-s="-14.8">Proton · 1.6 fm</button><button data-s="-18.7">Quark</button><button id="canopy-ribosome">Ribosome · close-up</button><button id="canopy-cell-run">Cell → DNA</button><button id="canopy-micro-run">Dew → amoeba</button><button id="canopy-dew">Ladybug → micro</button>
      <button data-s="1.35">Bird flyby</button><button id="canopy-crown-run">Canopy depth test</button><button data-s="3.42">Airplane flyby</button><button id="canopy-outward">Ladybug → sky</button>
    </div>
    <label style="display:block;margin-top:12px"><input id="canopy-generated" type="checkbox" checked> Show generated canopy</label>
    <label style="display:block;margin-top:5px"><input id="canopy-centre" type="checkbox" checked> Mark zoom centre</label>
    <label style="display:block;margin-top:5px"><input id="canopy-macro" type="checkbox" checked> Background blur</label>
    <label style="display:block;margin-top:5px"><input id="canopy-depth" type="checkbox" checked> Leaf depth layers</label>
    <label style="display:block;margin-top:5px"><input id="canopy-crown" type="checkbox" checked> Canopy depth · 3 layers</label>
    <label style="display:block;margin-top:5px"><input id="canopy-plane" type="checkbox" checked> Airplane flyby</label>
    <label style="display:block;margin-top:5px"><input id="canopy-bird" type="checkbox" checked> Bird flyby</label>
    <div style="color:#a4b3a9;margin-top:8px">Ladybug ≈ 7 mm · dew ≈ 1.16 mm · pollen ≈ 40 µm · small amoeba ≈ 8 µm. Populated water field · pine/birch pollen · Arcella/Vannella amoebae. Nuclear and molecular interiors are scientific reconstructions. Microscopic scene is illustrative. Steller’s jay and Boeing 747: separate foreground flyby layers. Generated scene.</div>
    <div style="color:#7c8f83;font-size:11px;margin-top:6px">Real imagery: USDA/USGS NAIP; Sentinel-2 cloudless 2016 © EOX, CC BY 4.0. Generated detail is an interpretation.</div>`;
  document.body.append(panel);
  const style=document.createElement('style');style.textContent='#canopy-actions button{border:1px solid #ffffff30;border-radius:6px;background:#22332a;color:#eef5ee;padding:7px 10px;font:inherit;cursor:pointer} #canopy-actions button:hover{background:#3c5143}';document.head.append(style);
  // Review a square master with both delivery crops at the same world scale.
  document.body.classList.add('canopy-review');
  const stage=document.getElementById('stage');
  const stageSelect=document.getElementById('stageSel');
  stageSelect.value='1x1';stageSelect.dispatchEvent(new Event('change'));
  stageSelect.closest('select').hidden=true;
  panel.prepend(Object.assign(document.createElement('div'),{className:'master-caption',textContent:'SQUARE MASTER · 3840 × 3840'}));
  panel.append(document.getElementById('hud'),document.getElementById('bar'));
  const guides=document.createElement('div');guides.className='delivery-guides';
  guides.innerHTML='<div class="delivery-crop horizontal"><span>16:9 · 3840 × 2160</span></div><div class="delivery-crop vertical"><span>9:16 · 2160 × 3840</span></div>';
  stage.append(guides);
  const framingStyle=document.createElement('style');framingStyle.textContent=`
    body.canopy-review{display:grid;grid-template-columns:300px minmax(0,1fr);gap:24px;padding:24px;box-sizing:border-box;background:#101512;place-items:center}
    body.canopy-review #stage{grid-column:2;grid-row:1;width:min(calc(100vw - 372px),calc(100vh - 48px),960px)!important;height:min(calc(100vw - 372px),calc(100vh - 48px),960px)!important;max-width:none;max-height:none;box-shadow:0 0 0 1px #ffffff35}
    body.canopy-review aside{position:static!important;grid-column:1;grid-row:1;width:100%;max-width:none!important;max-height:calc(100vh - 48px);overflow:auto;box-sizing:border-box;padding:18px!important}
    body.canopy-review #bar{position:static;padding:14px 0 0;margin-top:14px;background:transparent;gap:10px;border-top:1px solid #ffffff20}
    body.canopy-review #bar input[type=range]{flex-basis:100%;order:-1}
    body.canopy-review #hud{position:static;margin-top:20px;text-shadow:none}
    body.canopy-review #counter{font-size:20px}
    .master-caption{font:10px/1.5 system-ui;letter-spacing:1.5px;color:#a4b3a9;margin-bottom:14px}
    .delivery-guides{position:absolute;inset:0;z-index:5;pointer-events:none}
    .delivery-crop{position:absolute;box-sizing:border-box;border:1px solid;box-shadow:0 0 0 1px #0005}
    .delivery-crop span{position:absolute;left:8px;top:8px;padding:4px 6px;background:#08100cba;border-radius:3px;font:11px/1.3 system-ui;letter-spacing:.4px;white-space:nowrap}
    .delivery-crop.horizontal{left:0;top:21.875%;width:100%;height:56.25%;border-color:#ffd888;color:#ffd888}
    .delivery-crop.vertical{top:0;left:21.875%;height:100%;width:56.25%;border-color:#85e7ea;color:#85e7ea}
    @media(max-width:800px){body.canopy-review{display:flex;flex-direction:column;overflow:auto;padding:16px;gap:16px}body.canopy-review #stage{flex:none;order:0;width:min(calc(100vw - 32px),65vh)!important;height:min(calc(100vw - 32px),65vh)!important}body.canopy-review aside{order:1;flex:none;max-height:none;width:min(100%,540px)}}
  `;document.head.append(framingStyle);
  const marker=document.createElement('div');marker.style.cssText='position:absolute;z-index:6;left:50%;top:50%;width:16px;height:16px;transform:translate(-50%,-50%);border:1px solid #fff9;border-radius:50%;pointer-events:none;box-shadow:0 0 2px #000';stage.append(marker);
  const ribosome=document.createElement('dialog');
  ribosome.setAttribute('aria-label','Ribosome close-up');
  ribosome.style.cssText='background:#101512;color:#eee;border:1px solid #ffffff50;border-radius:12px;padding:18px;max-width:min(82vw,720px);max-height:90vh';
  ribosome.innerHTML=`<button id="ribosome-close" style="float:right">Close</button><strong>Ribosome · ≈25 nm</strong><p>A separate cytoplasmic close-up · 40 nm field. Ribosomes are outside the nucleus; the straight main zoom follows chromatin to DNA.</p><img alt="Illustrative eukaryotic ribosome with large and small subunits and mRNA" style="display:block;width:min(70vw,650px);max-height:65vh;object-fit:contain" src="/video/powers-of-ten/generated/canopy-test/micro/anatomy-v9/ribosome-raw.png"><p style="font-size:12px">Scientific reconstruction · approximate molecular geometry.</p>`;
  document.body.append(ribosome);
  panel.querySelector('#canopy-ribosome').onclick=()=>{run++;window.zoom.set(window.zoom.s);ribosome.showModal()};
  ribosome.querySelector('#ribosome-close').onclick=()=>ribosome.close();
  let run=0;
  document.querySelectorAll("[data-play],#s").forEach(el=>el.addEventListener(el.id==="s"?"input":"click",()=>{run++}));
  window.addEventListener("wheel",()=>{run++},{passive:true});
  window.addEventListener("keydown",()=>{run++});
  panel.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{run++;window.zoom.set(+b.dataset.s)});
  document.getElementById('canopy-generated').onchange=e=>window.canopyTest.enabled=e.target.checked;
  document.getElementById('canopy-centre').onchange=e=>marker.hidden=!e.target.checked;
  document.getElementById('canopy-centre').checked=false;marker.hidden=true;
  document.getElementById('canopy-macro').onchange=e=>window.canopyTest.macro=e.target.checked;
  document.getElementById('canopy-crown').onchange=e=>window.canopyTest.crownDepth=e.target.checked;
  document.getElementById('canopy-depth').onchange=e=>window.canopyTest.depth=e.target.checked;
  document.getElementById('canopy-plane').onchange=e=>window.canopyTest.airplane=e.target.checked;
  document.getElementById('canopy-bird').onchange=e=>window.canopyTest.bird=e.target.checked;
  function approach(from,to,duration){
    const id=++run,start=performance.now();
    function tick(now){if(id!==run)return;const t=Math.min(1,(now-start)/duration);window.zoom.set(from+(to-from)*t);if(t<1)requestAnimationFrame(tick)}
    requestAnimationFrame(tick);
  }
  document.getElementById('canopy-timing').onclick=()=>approach(0,Math.log10(.03),22000);
  document.getElementById('canopy-crown-run').onclick=()=>approach(Math.log10(4.5),Math.log10(.7),18000);
  document.getElementById('full-in').onclick=()=>approach(window.canopyTest.maximum,-18.7,180000);
  document.getElementById('full-out').onclick=()=>approach(-18.7,window.canopyTest.maximum,180000);
  document.getElementById('full-stop').onclick=()=>{run++;window.zoom.set(window.zoom.s)};
  document.getElementById('canopy-cell-run').onclick=()=>approach(-4.92081875,-9.5,30000);
  document.getElementById('canopy-micro-run').onclick=()=>approach(-2.69409129,window.canopyTest.photoMinimum,42000);
  document.getElementById('canopy-dew').onclick=()=>approach(-1.26272753,window.canopyTest.photoMinimum,16000);
  document.getElementById('canopy-run').onclick=()=>approach(4.6,window.canopyTest.photoMinimum,40000);
  document.getElementById('canopy-inward').onclick=()=>approach(1.6-Math.log10(3),window.canopyTest.photoMinimum,26000);
  document.getElementById('canopy-outward').onclick=()=>approach(window.canopyTest.photoMinimum,4.6,42000);
  document.getElementById('s').addEventListener('input',()=>run++);
  document.getElementById('stage').addEventListener('wheel',()=>run++);
  document.querySelectorAll('[data-play]').forEach(b=>b.addEventListener('click',()=>run++));
  const speed=document.getElementById('speed');speed.insertAdjacentHTML('afterbegin','<option value="0.12">Slow approach</option>');speed.value='0.12';speed.dispatchEvent(new Event('change'));
}
