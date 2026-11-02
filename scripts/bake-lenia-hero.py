"""Rule-evolved opening field: original Bend multichannel glider + Orbium,
with six Flow Lenia populations. Bake pigment first; terrain applies post.
"""
from pathlib import Path
import re,json,colorsys
import numpy as np
from scipy.ndimage import fourier_shift
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'video/powers-of-ten/generated/lenia-opening-v2';OUT.mkdir(parents=True,exist_ok=True)
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
  if step>=250 and (step-250)%STRIDE==0:
   mass=A.sum(-1);Y,X=np.mgrid[:N,:N];total=mass.sum()
   shift=(N/2-(mass*Y).sum()/total,N/2-(mass*X).sum()/total)
   # Translation only, at fractional-pixel precision; no rounded recenter jumps.
   for c in range(A.shape[-1]):A[:,:,c]=np.fft.ifftn(fourier_shift(np.fft.fftn(A[:,:,c]),shift)).real
   A=np.clip(A,0,1);out.append(A.copy())
 return np.asarray(out)
y,x=np.mgrid[-9:10,-9:10];r=np.hypot(x,y)/10;ks=[]
for j in range(15):
 br=rule['KNB'][j]*r/rule['KRR'][j];fl=np.floor(br);u=br-fl;idx=np.clip(fl.astype(int),0,int(rule['KNB'][j])-1);b=np.choose(idx,[rule['KB0'][j],rule['KB1'][j],rule['KB2'][j]])
 core=np.exp(4-1/np.maximum(u*(1-u),1e-12));ks.append(np.where((r<rule['KRR'][j])&(u>1e-6),core*b,0))
fields=[evolve(seed,ks,np.array(rule['KC0'],int),rule['KM'],rule['KS'],np.repeat(np.arange(3),5),rule['KDTH'],rule['DN'])]

field=fields[0]
assert np.isfinite(field).all() and (field[-1]>.05).any()
Y,X=np.where(field[0].max(-1)>.04);body=int(max(X.max()-X.min()+1,Y.max()-Y.min()+1))
for f,A in enumerate(field):
 Image.fromarray(np.uint8(np.clip(A,0,1)*255)).resize((256,256),Image.Resampling.BICUBIC).save(OUT/f'{f:02}.webp',lossless=True)
(OUT/'manifest.json').write_text(json.dumps({'frames':COUNT,'stepsPerFrame':STRIDE,'settle':250,'resolution':256,'firstScale':-15.5,'lastScale':-20.5,'worldSpan':N/body*113/1024,'bodyPixels':body,'tracking':'fractional Fourier translation, no integer recentering','background':'static irregular stamps; only the central hero is animated'},indent=2))
print('Baked 90 subpixel-stabilized hero frames',flush=True)
