import json, sys, time
from faster_whisper import WhisperModel
src, out = sys.argv[1], sys.argv[2]
import wave, numpy as np
wf=wave.open(src); audio=np.frombuffer(wf.readframes(wf.getnframes()),dtype=np.int16).astype(np.float32)/32768.0
m = WhisperModel("medium.en", device="cpu", compute_type="int8", cpu_threads=4)
t=time.time()
# no VAD filter: we want to keep false starts and fillers; prompt encourages verbatim disfluencies
segs, info = m.transcribe(audio, language="en", word_timestamps=True, beam_size=5,
    condition_on_previous_text=False, vad_filter=False,
    initial_prompt="Umm, so, uh, the triangle of everything. Schwarzschild radius, Hubble radius, Compton wavelength, Laniakea, Chandrasekhar limit, Wolf-Rayet, Pluto, Saturn, primordial black holes.")
res=[]
for s in segs:
    res.append({"start":s.start,"end":s.end,"text":s.text,"words":[{"s":w.start,"e":w.end,"w":w.word,"p":w.probability} for w in s.words]})
    print(f"[{s.start:7.2f}-{s.end:7.2f}] {s.text}", flush=True)
json.dump(res, open(out,"w"), indent=1)
print("done", time.time()-t)
