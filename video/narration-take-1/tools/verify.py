import json, csv, re, sys, difflib
D=sys.argv[1]
ow=[w for s in json.load(open(f'{D}/edit_transcript.json')) for w in s['words']]
norm=lambda t: re.sub(r"[^a-z0-9' ]","",t.lower()).split()
for r in csv.DictReader(open(f'{D}/cuts.csv')):
    a,b=float(r['out_start']),float(r['out_end'])
    heard=' '.join(w['w'] for w in ow if a-0.15 <= (w['s']+w['e'])/2 <= b+0.15)
    exp,got=norm(r['text']),norm(heard)
    sm=difflib.SequenceMatcher(None,exp,got)
    issues=[(op,' '.join(exp[i1:i2]),' '.join(got[j1:j2])) for op,i1,i2,j1,j2 in sm.get_opcodes() if op!='equal' and (i1==0 or i2==len(exp) or j1==0 or j2==len(got))]
    if issues: print(f"{a:7.2f} [{r['src_start']}] {issues}")
