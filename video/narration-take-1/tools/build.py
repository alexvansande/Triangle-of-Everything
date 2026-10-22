import json, wave, sys, csv, numpy as np
sys.path.insert(0, sys.argv[1]); from edl import EDL
D = sys.argv[1]
words = [w for s in json.load(open(f'{D}/transcript.json')) for w in s['words']]
byStart = {round(w['s'],2): w for w in words}
wf = wave.open(f'{D}/audio/raw.wav'); SR = wf.getframerate()
a = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32)/32768
hop = int(0.005*SR); win = int(0.02*SR)
n = (len(a)-win)//hop
rms = np.array([np.sqrt(np.mean(a[i*hop:i*hop+win]**2)) for i in range(n)]) + 1e-9
def quietest(t0, t1):
    i0, i1 = max(0,int(t0*SR/hop)), min(n-1,int(t1*SR/hop))
    i = i0 + int(np.argmin(rms[i0:i1+1]))
    return (i*hop + win/2)/SR
db = 20*np.log10(rms)
def runs(t0, t1, thr=-55, minlen=0.08):
    # quiet runs [(start, end)] in seconds overlapping [t0, t1]
    i0, i1 = max(0,int(t0*SR/hop)), min(n-1,int(t1*SR/hop))
    q = db[i0:i1+1] < thr; out=[]; i=0
    while i < len(q):
        if q[i]:
            j=i
            while j < len(q) and q[j]: j+=1
            rs, re_ = ((i0+i)*hop+win/2)/SR, ((i0+j)*hop+win/2)/SR
            if re_-rs >= minlen: out.append((rs,re_))
            i=j
        else: i+=1
    return out
def start_cut(w):
    # the longest silence ending between just before the word and the word's end
    c = [r for r in runs(w['s']-0.6, w['e']) if w['s']-0.35 <= r[1] <= w['e']-0.08]
    if c: return max(c, key=lambda r: r[1]-r[0])[1] - 0.04
    return quietest(w['s']-0.15, w['s']+0.05)
def end_cut(w):
    # the first real silence after the word ends
    c = [r for r in runs(w['e']-0.2, w['e']+0.8) if r[0] >= w['e']-0.2 and r[1]-r[0] >= 0.1]
    if c: return c[0][0] + 0.06
    return quietest(w['e']-0.05, w['e']+0.15)
def cap_pauses(x, maxp=0.55, thr_db=-52):
    # shorten silences longer than maxp seconds inside a clip
    f = int(0.01*SR); m = len(x)//f
    e = 20*np.log10(np.sqrt((x[:m*f].reshape(m,f)**2).mean(1))+1e-9)
    quiet = e < thr_db
    out, i, last = [], 0, 0
    while i < m:
        if quiet[i]:
            j = i
            while j < m and quiet[j]: j += 1
            if (j-i)*f > maxp*SR:
                keep = int(maxp*SR)//2
                out.append(x[last:i*f+keep]); last = j*f-keep
            i = j
        else: i += 1
    out.append(x[last:]); 
    # 5 ms crossfade-free join is fine: joins happen inside near-silence
    return np.concatenate(out)
def fade(x, ms=12):
    k = int(ms/1000*SR); x = x.copy()
    r = np.linspace(0,1,k); x[:k]*=r; x[-k:]*=r[::-1]; return x
out, rows, t, prev_beat = [], [], 0.0, None
for item in EDL:
    beat, ws, we = item[:3]; ov = item[3] if len(item) > 3 else {}
    w0, w1 = byStart[round(ws,2)], byStart[round(we,2)]
    s = ov.get('s') or start_cut(w0)
    e = ov.get('e') or end_cut(w1)
    clip = fade(cap_pauses(a[int(s*SR):int(e*SR)]))
    gap = 0.0 if prev_beat is None else (0.9 if beat != prev_beat else 0.28)
    out.append(np.zeros(int(gap*SR), np.float32)); t += gap
    text = ' '.join(w['w'].strip() for w in words if w['s'] >= w0['s']-1e-3 and w['s'] <= w1['s']+1e-3)
    rows.append([beat, f'{t:.2f}', f'{t+len(clip)/SR:.2f}', f'{s:.2f}', f'{e:.2f}', text])
    out.append(clip); t += len(clip)/SR; prev_beat = beat
out.append(np.zeros(int(0.5*SR), np.float32))
y = np.concatenate(out)
w = wave.open(f'{D}/audio/edit_raw.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(y,-1,1)*32767).astype(np.int16).tobytes()); w.close()
with open(f'{D}/cuts.csv','w',newline='') as f:
    c = csv.writer(f); c.writerow(['beat','out_start','out_end','src_start','src_end','text']); c.writerows(rows)
print(f'{len(rows)} clips, {len(y)/SR:.1f}s')
