"""Evolve saved creature rules from scratch, omitting the initial settling period.
Run using /Users/avsa/Dev/Life/.venv/bin/python. Writes only to --output.
Raw pigment channels and summed height are saved before any visual effects.
"""
import argparse, json, sys
from pathlib import Path
import numpy as np
p=argparse.ArgumentParser()
p.add_argument('--library',type=Path,default=Path('/Users/avsa/Dev/Life/library'))
p.add_argument('--id',required=True)
p.add_argument('--output',type=Path,required=True)
p.add_argument('--settle',type=int,default=250)
p.add_argument('--frames',type=int,default=30)
p.add_argument('--stride',type=int,default=2)
a=p.parse_args()
if a.settle<0 or a.frames<1 or a.stride<1:p.error('Invalid settling/frame counts')
sys.path.insert(0,str(a.library.parent))
from sim.library import Library
from sim.simulation import Simulation
from sim.comove import comoving_isolate
rec=next(r for r in json.loads((a.library/'index.json').read_text()) if r['id']==a.id)
source=np.load(a.library/'matter'/rec['matter'])
size=max(128,3*max(source['A'].shape[:2])+48);size+=size%2
sim=Simulation(preset=rec['preset'],model=rec['model'],mix=rec.get('mix','stoch'),param_seed=rec['world_seed'],state_seed=0,size=size,border='torus',backend='jax-cpu')
A,P,_=Library(a.library).place_matter(rec,size)
if P is None:sim.engine.set_state(A)
else:sim.engine.set_state(A,P)
# Settling happens before collection, not by discarding part of the exported clip.
# Thus all requested frames contain post-settle evolution, including frame zero.
result=comoving_isolate(sim,steps=a.settle+a.frames*a.stride,settle=a.settle,record_every=a.stride)
if len(result['frames'])!=a.frames:
 raise RuntimeError(f'Creature did not survive settling: {len(result["frames"])} frames; no clip exported')
channels=np.stack([frame for frame,offset in result['frames']]).astype(np.float16)
a.output.mkdir(parents=True,exist_ok=True)
np.savez_compressed(a.output/'fields.npz',channels=channels,height=channels.sum(-1,dtype=np.float32))
(a.output/'manifest.json').write_text(json.dumps({'sourceId':a.id,'source':'saved matter + original Flow Lenia rules','settleSteps':a.settle,'firstRecordedStep':a.settle,'frames':a.frames,'stride':a.stride,'shape':list(channels.shape),'postEffects':False},indent=2))
print(f'Exported {a.frames} frames after {a.settle} unrecorded settling steps',flush=True)
