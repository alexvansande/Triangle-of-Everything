# Fetch first: curl -sS "https://nds.iaea.org/relnsd/v1/data?fields=ground_states&nuclides=all" -o gs.csv
# then: python3 -I pick.py  (writes be.json)  ;  NODE_PATH=$(npm root -g) node render.mjs
import csv, json, sys
rows=list(csv.DictReader(open('gs.csv')))
by={}
for r in rows:
    z=int(r['z']);
    if z<1: continue
    by.setdefault(z,[]).append(r)
def f(x):
    try: return float(x)
    except: return None
out={}
for z,rs in sorted(by.items()):
    nat=[r for r in rs if f(r['abundance'])]
    if nat: r=max(nat,key=lambda r:f(r['abundance']))
    else:
        def hl(r):
            if r['half_life']=='STABLE': return 1e99
            return f(r['half_life_sec']) or 0
        r=max(rs,key=hl)
    a=z+int(r['n'])
    # all naturally occurring isotopes: are any alpha-unstable energetically?
    out[z]=dict(sym=r['symbol'],A=a,ba=f(r['binding']),qa=f(r['qa']),hl=r['half_life'],unit=r['unit_hl'],
        stable=r['half_life']=='STABLE', natural=bool(nat), sys=r['me_systematics'])
json.dump(out,open('be.json','w'),indent=0)
for z in [1,2,3,6,8,26,28,56,82,83,92,94,100,110,114,118]:
    print(z,out[z])
print([z for z in out if out[z]['ba'] is None])
# stable-but-alpha-energetic count
print('stable w/ Qa>0:',[ (out[z]['sym'],out[z]['A'],round(out[z]['qa'])) for z in out if out[z]['stable'] and (out[z]['qa'] or 0)>0])
mx=max(out,key=lambda z:out[z]['ba'] or 0);print('max',mx,out[mx])
