import json, csv, re, sys
S, OUT = sys.argv[1], sys.argv[2]
FIX = [(r"\bshort\b","chart"),(r"\bshard\b","chart"),(r"\bshark\b","chart"),(r"Lenyakea","Laniakea"),(r"\bpattern\b","Saturn"),
       (r"\bstores\b","stars"),(r"radios\b","radius"),(r"Hawking's","Hawking"),(r"Schwartz child","Schwarzschild"),(r"\brados\b","radius"),
       (r"Chandra Seeker","Chandrasekhar"),(r"wolf riot","Wolf-Rayet"),(r"\bin our physics\b","in all of physics"),(r"coincidental","coincidence")]
def fix(t):
    for a,b in FIX: t = re.sub(a,b,t)
    return t
def tc(t, sep=','):
    h=int(t//3600); m=int(t%3600//60); s=t%60
    return f"{h:02d}:{m:02d}:{int(s):02d}{sep}{int(round((s-int(s))*1000)):03d}"
# --- subtitles from the re-transcription of the edited audio
ow = [w for s in json.load(open(f'{S}/edit_transcript.json')) for w in s['words']]
cues, cur = [], []
for w in ow:
    cur.append(w)
    text = ''.join(x['w'] for x in cur).strip()
    if len(text) > 70 or w['w'].strip()[-1:] in '.?!' and len(text) > 25:
        cues.append(cur); cur = []
if cur: cues.append(cur)
with open(f'{OUT}/narration.srt','w') as f:
    for i,c in enumerate(cues,1):
        text = fix(''.join(x['w'] for x in c).strip())
        if len(text) > 42:  # two lines, split near the middle on a space
            mid = len(text)//2; k = min((j for j,ch in enumerate(text) if ch==' '), key=lambda j: abs(j-mid))
            text = text[:k] + '\n' + text[k+1:]
        f.write(f"{i}\n{tc(c[0]['s'])} --> {tc(c[-1]['e'])}\n{text}\n\n")
# --- raw transcript, kept words plain, cut words struck through
src = json.load(open(f'{S}/transcript.json'))
keep = [(float(r['src_start']), float(r['src_end'])) for r in csv.DictReader(open(f'{S}/cuts.csv'))]
kept = lambda w: any(a-0.05 <= (w['s']+w['e'])/2 <= b+0.05 for a,b in keep)
lines = ["# Raw recording, full transcript (re-transcribed)\n",
         "Source: `Unimed_Rio…_2.m4a`, 23:25. Re-transcribed with Whisper medium.en (word timestamps), spelling fixed for names.",
         "Plain text = **kept** in the edit. ~~Struck-through~~ = cut (false starts, repeated takes, unfinished thoughts).\n"]
for s in src:
    out = []
    for w in s['words']:
        t = fix(w['w'].strip())
        out.append(t if kept(w) else f"~~{t}~~")
    para = ' '.join(out).replace('~~ ~~',' ')
    lines.append(f"`{tc(s['start'],'.')[3:8]}` {para}\n")
open(f'{OUT}/raw-transcript.md','w').write('\n'.join(lines))
# --- cut list with fixed spelling and mm:ss columns
rows = list(csv.DictReader(open(f'{S}/cuts.csv')))
with open(f'{OUT}/cuts.csv','w',newline='') as f:
    c = csv.writer(f); c.writerow(['#','tour_step','edit_in','edit_out','source_in','source_out','text'])
    for i,r in enumerate(rows,1):
        c.writerow([i, r['beat'], tc(float(r['out_start']),'.')[3:], tc(float(r['out_end']),'.')[3:],
                    tc(float(r['src_start']),'.')[3:], tc(float(r['src_end']),'.')[3:], fix(r['text'])])
# --- beat ranges and key-phrase timecodes for the sync script
beats = {}
for r in rows: beats.setdefault(r['beat'], [float(r['out_start']), 0])[1] = float(r['out_end'])
for b,(a,e) in beats.items(): print(f"BEAT {b:18s} {tc(a,'.')[3:]} - {tc(e,'.')[3:]}")
flat = [(w['s'], re.sub(r"[^a-z0-9]","",w['w'].lower())) for w in ow]
def find(phrase, after=0):
    p = phrase.lower().split()
    for i in range(len(flat)-len(p)):
        if flat[i][0] >= after and all(flat[i+j][1] == re.sub(r"[^a-z0-9]","",p[j]) for j in range(len(p))): return flat[i][0]
for ph in sys.stdin.read().strip().split('\n'):
    t = find(ph); print(f"KEY {tc(t,'.')[3:10] if t is not None else '??'}  {ph}")
