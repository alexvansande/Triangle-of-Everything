"""Rule-evolved opening field: original Bend multichannel glider + Orbium,
with six Flow Lenia populations. Bake pigment first; terrain applies post.
"""
from pathlib import Path
import re,json,colorsys
import numpy as np
from scipy.signal import fftconvolve
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'video/powers-of-ten/generated/lenia-opening-v1';OUT.mkdir(parents=True,exist_ok=True)
N=128;COUNT=90;STRIDE=20
source=Path('/Users/avsa/Dev/Bend/bend2-core-claims/demos/lenia/lenia_multi_ref.c').read_text()
def array(name):return np.array([float(x.strip().rstrip('fu')) for x in re.search(r'\b'+name+r'\[[^]]+\]\s*=\s*\{([^}]+)',source)[1].split(',')])
rule={k:array(k).tolist() for k in ['KC0','KM','KS','KDTH','KRR','KNB','KB0','KB1','KB2','DN']}
(OUT/'multichannel-rules.json').write_text(json.dumps(rule,indent=2))
seed=np.frombuffer(bytes.fromhex(re.search(r'PATHEX = "([0-9a-f]+)',source)[1]),np.uint8).reshape(3,22,27).transpose(1,2,0)/255.
def evolve(seed,kernels,src,means,sigmas,targets,dt,div):
 A=np.zeros((N,N,seed.shape[-1]));h,w=seed.shape[:2];A[N//2-h//2:N//2-h//2+h,N//2-w//2:N//2-w//2+w]=seed
 K=[]
 for kernel in kernels:
  H,W=kernel.shape;plane=np.zeros((N,N));plane[:H,:W]=kernel/kernel.sum();plane=np.roll(plane,(-H//2+1,-W//2+1),(0,1));K.append(np.fft.rfft2(plane))
 K=np.asarray(K);out=[]
 for step in range(250+COUNT*STRIDE):
  U=np.fft.irfft2(np.fft.rfft2(A,axes=(0,1)).transpose(2,0,1)[src]*K,s=(N,N),axes=(-2,-1))
  growth=2*np.exp(-.5*((U-np.array(means)[:,None,None])/np.array(sigmas)[:,None,None])**2)-1
  D=np.zeros_like(A)
  for j,c in enumerate(targets):D[:,:,c]+=dt[j]*growth[j]/div[c]
  A=np.clip(A+D,0,1)
  if step>=250 and (step-250)%STRIDE==0:out.append(A.copy())
 return np.asarray(out)
y,x=np.mgrid[-9:10,-9:10];r=np.hypot(x,y)/10;ks=[]
for j in range(15):
 br=rule['KNB'][j]*r/rule['KRR'][j];fl=np.floor(br);u=br-fl;idx=np.clip(fl.astype(int),0,int(rule['KNB'][j])-1);b=np.choose(idx,[rule['KB0'][j],rule['KB1'][j],rule['KB2'][j]])
 core=np.exp(4-1/np.maximum(u*(1-u),1e-12));ks.append(np.where((r<rule['KRR'][j])&(u>1e-6),core*b,0))
fields=[evolve(seed,ks,np.array(rule['KC0'],int),rule['KM'],rule['KS'],np.repeat(np.arange(3),5),rule['KDTH'],rule['DN'])]
print('Multichannel glider evolved',flush=True)
o=json.load(open(ROOT/'video/powers-of-ten/generated/lenia-terrain-v1/orbium.json'));seed=np.asarray(o['cells']).reshape(o['height'],o['width'],1)/255
y,x=np.mgrid[-13:14,-13:14];r=np.hypot(x,y)/13;k=np.where((r<1)&(r>.001),np.exp(4-1/np.maximum(r*(1-r),1e-12)),0)
fields.append(evolve(seed,[k],np.array([0]),[.15],[.015],[0],[.1],[1]))
print('Orbium evolved',flush=True)
for i in range(6):fields.append(np.load(ROOT/f'video/powers-of-ten/generated/lenia-animation-v2/fields-{i}.npz')['channels'].astype(float))
# Fixed crops and initial-size calibration keep bodies registered across frames.
shapes=[];body=[]
for i,field in enumerate(fields):
 C=field.shape[-1];palette=np.array([colorsys.hsv_to_rgb((c/C+.02)%1,.85,1) for c in range(C)])
 if C==1:palette=np.array([[.12,1.,.70]])
 if i==0:
  for f in range(len(field)):
   mass=field[f].sum(-1);Y,X=np.mgrid[:field.shape[1],:field.shape[2]]
   cy,cx=(mass*Y).sum()/mass.sum(),(mass*X).sum()/mass.sum()
   field[f]=np.roll(field[f],(round(field.shape[1]/2-cy),round(field.shape[2]/2-cx)),axis=(0,1))
 frames=np.clip(field@palette,0,1)
 Y,X=np.where(field[0].max(-1)>.04);body.append(max(X.max()-X.min()+1,Y.max()-Y.min()+1))
 shapes.append([Image.fromarray(np.uint8(a*255)) for a in frames])
random=np.random.default_rng(79113);forms=[(512.,512.,0.,1.,0)]
for i in range(50):
 x,y=random.uniform(-.55,.55,2)
 if np.hypot(x,y)<.14:continue
 forms.append((512+x*1024,512+y*1024,random.uniform(0,360),random.uniform(.6,1.3),1+i%7))
for f in range(COUNT):
 image=Image.new('RGB',(1024,1024));buf=np.zeros((1024,1024,3),np.float32)
 for x,y,angle,scale,kind in forms:
  shape=shapes[kind][f];w=113*scale*shape.width/body[kind]
  piece=shape.resize((round(w),max(1,round(w*shape.height/shape.width))),Image.Resampling.BILINEAR).rotate(angle,resample=Image.Resampling.BILINEAR,expand=True)
  # Periodic copies keep off-frame bodies entering naturally as the zoom changes.
  for dx in [-1024,0,1024]:
   for dy in [-1024,0,1024]:
    if x+dx+piece.width/2<0 or x+dx-piece.width/2>1024 or y+dy+piece.height/2<0 or y+dy-piece.height/2>1024:continue
    left,top=round(x+dx-piece.width/2),round(y+dy-piece.height/2)
    x0,y0=max(0,left),max(0,top);x1,y1=min(1024,left+piece.width),min(1024,top+piece.height)
    if x1<=x0 or y1<=y0:continue
    v=np.asarray(piece.crop((x0-left,y0-top,x1-left,y1-top)),dtype=np.float32)/255
    patch=buf[y0:y1,x0:x1];patch[:]=1-(1-patch)*(1-v)
 Image.fromarray(np.uint8(buf*255)).save(OUT/f'{f:02}.webp',quality=91)
 if f%15==0:print('Composited',f,flush=True)
(OUT/'manifest.json').write_text(json.dumps({'frames':COUNT,'stepsPerFrame':STRIDE,'settle':250,'resolution':1024,'firstScale':-15.5,'lastScale':-20.5,'species':['Bend D7QFW2<KJYEM0 multichannel','Orbium unicaudatus']+['Flow Lenia '+str(i) for i in range(6)],'fixedBodyPixels':list(map(int,body))},indent=2))
