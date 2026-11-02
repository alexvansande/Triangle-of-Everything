// Optional review controls for the isolated, bright-centred crown test.
export function mountCanopyTest() {
  document.title='Powers of ten · CMB to Planck';
  const panel=document.createElement('aside');
  panel.style.cssText='position:fixed;z-index:10;top:16px;left:16px;right:16px;max-width:680px;padding:16px 18px;background:#0b1110e8;color:#eee;border:1px solid #ffffff28;border-radius:12px;font:13px/1.5 system-ui;box-shadow:0 8px 32px #0005';
  panel.innerHTML=`<strong style="font-size:17px">CMB → Planck</strong>
    <div style="color:#b5c4b9;margin:5px 0 12px">Cosmos → Earth → sequoia → ladybug → cell → DNA → guanine → atom → Lenia field → Planck terrain</div>
    <label style="display:block;margin-top:12px"><input id="canopy-generated" type="checkbox" checked> Show generated canopy</label>
    <label style="display:block;margin-top:5px"><input id="canopy-centre" type="checkbox" checked> Mark zoom centre</label>
    <label style="display:block;margin-top:5px"><input id="canopy-macro" type="checkbox" checked> Background blur</label>
    <label style="display:block;margin-top:5px"><input id="canopy-depth" type="checkbox" checked> Leaf depth layers</label>
    <label style="display:block;margin-top:5px"><input id="canopy-crown" type="checkbox" checked> Canopy depth · 3 layers</label>
    <label style="display:block;margin-top:5px"><input id="canopy-plane" type="checkbox" checked> Airplane flyby</label>
    <label style="display:block;margin-top:5px"><input id="canopy-bird" type="checkbox" checked> Bird flyby</label>
    <div style="color:#a4b3a9;margin-top:8px">Ladybug ≈ 7 mm · dew ≈ 1.16 mm · pollen ≈ 40 µm · small amoeba ≈ 8 µm. Populated water field · pine/birch pollen · Arcella/Vannella amoebae. Nuclear and molecular interiors are scientific reconstructions. Microscopic scene is illustrative. Steller’s jay and Boeing 747: separate foreground flyby layers. Generated scene.</div>
    <div style="color:#7c8f83;font-size:11px;margin-top:6px">Gold points: cosmic web, an illustrative 3D density reconstruction. Red shell: CMB. CMB: Planck SMICA temperature map, displayed with an illustrative red palette on a spherical shell. Galaxy photographs (CC BY 4.0): <a href="https://www.eso.org/public/images/eso1914a/" style="color:inherit">ESO/VMC Survey</a>; <a href="https://www.eso.org/public/images/eso1714a/" style="color:inherit">ESO/VISTA VMC</a>; <a href="https://www.eso.org/public/images/eso1424a/" style="color:inherit">ESO</a>; <a href="https://esahubble.org/images/heic1502b/" style="color:inherit">NASA, ESA, Digitized Sky Survey 2 (Acknowledgement: Davide De Martin)</a>. Cropped, masked and projected by the app. No AI alteration of telescope photographs. Real imagery: USDA/USGS NAIP; Sentinel-2 cloudless 2016 © EOX, CC BY 4.0. Generated detail is an interpretation.</div>`;
  document.body.append(panel);
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
  const labelCrop=document.createElement('label');labelCrop.textContent='Label frame ';
  const cropSelect=document.createElement('select');
  for(const [value,text]of [['9x16','Vertical · 9:16'],['16x9','Horizontal · 16:9']])cropSelect.add(new Option(text,value));
  cropSelect.value=new URLSearchParams(location.search).get('stage')==='16x9'?'16x9':'9x16';
  cropSelect.onchange=()=>{window.canopyTest.labelFrame=cropSelect.value};cropSelect.onchange();
  labelCrop.append(cropSelect);panel.prepend(labelCrop);

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
  document.getElementById('canopy-generated').onchange=e=>window.canopyTest.enabled=e.target.checked;
  document.getElementById('canopy-centre').onchange=e=>marker.hidden=!e.target.checked;
  document.getElementById('canopy-centre').checked=false;marker.hidden=true;
  document.getElementById('canopy-macro').onchange=e=>window.canopyTest.macro=e.target.checked;
  document.getElementById('canopy-crown').onchange=e=>window.canopyTest.crownDepth=e.target.checked;
  document.getElementById('canopy-depth').onchange=e=>window.canopyTest.depth=e.target.checked;
  document.getElementById('canopy-plane').onchange=e=>window.canopyTest.airplane=e.target.checked;
  document.getElementById('canopy-bird').onchange=e=>window.canopyTest.bird=e.target.checked;
  const speed=document.getElementById('speed');speed.insertAdjacentHTML('afterbegin','<option value="0.12">Slow approach</option>');speed.value='0.12';speed.dispatchEvent(new Event('change'));
}
