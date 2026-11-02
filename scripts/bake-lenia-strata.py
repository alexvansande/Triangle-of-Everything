"""Bake six rule-evolved, parent-coupled populations; no recorded footage.
Each child's first 15 fields receive the parent's last 15 central fields.
250 warmup steps precede frame zero. All outputs are raw pigment before post.
"""
import os,sys,json,colorsys
from pathlib import Path
os.environ.setdefault('MPLCONFIGDIR','/private/tmp/lenia-mpl')
import numpy as np
from scipy.ndimage import zoom,gaussian_filter,rotate
from PIL import Image
root=Path(__file__).resolve().parents[1];lib=Path('/Users/avsa/Dev/Life/library');sys.path.insert(0,str(lib.parent))
from sim.library import Library
from sim.simulation import Simulation
from sim.comove import comoving_isolate
out=root/'video/powers-of-ten/generated/lenia-animation-v1';out.mkdir(parents=True,exist_ok=True)
selected=json.load(open(root/'video/powers-of-ten/generated/lenia-terrain-v1/found-creatures.json'))['creatures'];index={r['id']:r for r in json.load(open(lib/'index.json'))}
previous=None;provenance=[]
for level in range(6):
 rec=index[selected[(level*7)%len(selected)]['id']]
 z=np.load(lib/'matter'/rec['matter']);size=max(128,3*max(z['A'].shape[:2])+48);size+=size%2
 sim=Simulation(preset=rec['preset'],model=rec['model'],mix=rec.get('mix','stoch'),param_seed=rec['world_seed'],state_seed=0,size=size,border='torus',backend='jax-cpu')
 A,P,_=Library(lib).place_matter(rec,size)
 yy,xx=np.mgrid[:size,:size]/size
 noise=(np.sin(xx*31+np.sin(yy*17)*2)+np.sin(yy*39-xx*14))*.5
 A=np.clip(A*(1+noise[:,:,None]*.015),0,1)
 if P is None:sim.engine.set_state(A)
 else:sim.engine.set_state(A,P)
 settled=comoving_isolate(sim,steps=252,settle=250,record_every=2)
 if not settled['frames']:raise RuntimeError('Did not survive warmup: '+rec['id'])
 fields=[];channels=sim.state().shape[-1]
 for f in range(30):
  for step in range(2):
   A=sim.state();P=sim.engine.param_state() if sim.model in ('params','atmospheric') else None
   # A very gentle parent forcing acts on the state BEFORE the next rule step.
   if previous is not None:
    parent=previous[min(29,15+f)];n=parent.shape[0];half=max(4,n//10);c=n//2
    crop=parent[c-half:c+half,c-half:c+half].sum(-1)
    forcing=zoom(crop,size/crop.shape[0],order=1)[:size,:size];forcing-=forcing.mean()
    forcing/=max(float(np.max(np.abs(forcing))),.001)
    A=np.clip(A*(1+.003*forcing[:,:,None]),0,1)
   A=np.clip(A*(1+.0008*noise[:,:,None]),0,1)
   if P is None:sim.engine.set_state(A)
   else:sim.engine.set_state(A,P)
   sim.engine.step(1)
  fields.append(sim.state().copy())
 previous=np.asarray(fields)
 np.savez_compressed(out/f'fields-{level}.npz',channels=previous.astype(np.float16),height=previous.sum(-1).astype(np.float16))
 palette=np.array([colorsys.hsv_to_rgb((i/channels+.02)%1,.85,1) for i in range(channels)])
 random=np.random.default_rng(5513+level*1777)
 placements=[(random.uniform(25,231),random.uniform(25,231),random.uniform(0,360),random.uniform(40,76)) for i in range(13)]
 for f,A in enumerate(fields):
  rgb=np.clip(A@palette,0,1);support=rgb.max(-1)>.02
  Y,X=np.where(support)
  if len(X):rgb=rgb[max(0,Y.min()-3):Y.max()+4,max(0,X.min()-3):X.max()+4]
  shape=Image.fromarray(np.uint8(rgb*255));canvas=Image.new('RGB',(256,256))
  buf=np.zeros((256,256,3),np.float32)
  for x,y,angle,width in placements:
   piece=shape.resize((int(width),max(1,int(width*shape.height/shape.width))),Image.Resampling.LANCZOS).rotate(angle,resample=Image.Resampling.BICUBIC,expand=True)
   overlay=Image.new('RGB',(256,256));overlay.paste(piece,(round(x-piece.width/2),round(y-piece.height/2)))
   values=np.asarray(overlay,dtype=np.float32)/255;buf=1-(1-buf)*(1-values)
  Image.fromarray(np.uint8(buf*255)).save(out/f'{level}-{f:02}.webp',quality=94)
 provenance.append({'id':rec['id'],'kind':rec['kind'],'level':level,'settle':250,'frames':30,'parentCoupling':.003,'noiseCoupling':.0008})
 print('Baked level',level,rec['kind'],flush=True)
(out/'manifest.json').write_text(json.dumps({'frames':30,'levels':6,'overlap':15,'source':'original rules, saved matter and carried parameters','populations':provenance},indent=2))
