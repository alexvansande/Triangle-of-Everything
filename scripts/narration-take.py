#!/usr/bin/env python3
"""Prepare a narration take for the player (src/narration.js).

    pip install faster-whisper
    python3 scripts/narration-take.py path/to/recording.m4a take-2

Copies the audio to public/narration/<take>/audio.m4a (re-encoded to AAC if
needed) and writes words.json: every spoken word with its start/end time,
transcribed by Whisper. The scene script (src/narration-scene.js) anchors its
cues to phrases, so nothing else needs to change for a new recording — open
/?narrate=<take> and check the console for any phrase it couldn't find.
"""
import json, os, subprocess, sys, wave

import numpy as np
from faster_whisper import WhisperModel

src, take = sys.argv[1], sys.argv[2]
model_name = sys.argv[3] if len(sys.argv) > 3 else "medium.en"
out = os.path.join("public", "narration", take)
os.makedirs(out, exist_ok=True)

audio = os.path.join(out, "audio.m4a")
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", src,
                "-vn", "-c:a", "aac", "-b:a", "192k", audio], check=True)
wav = os.path.join(out, ".tmp16k.wav")
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", src,
                "-ac", "1", "-ar", "16000", "-sample_fmt", "s16", wav], check=True)
wf = wave.open(wav)
pcm = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768
duration = wf.getnframes() / 16000
os.remove(wav)

model = WhisperModel(model_name, device="cpu", compute_type="int8")
segments, _ = model.transcribe(
    pcm, language="en", word_timestamps=True, beam_size=5, condition_on_previous_text=False,
    initial_prompt="The triangle of everything. Schwarzschild radius, Hubble radius, Compton "
                   "wavelength, Laniakea, Chandrasekhar, Wolf-Rayet, Pluto, Saturn, primordial black holes.")
words = []
for s in segments:
    for w in s.words:
        words.append([w.word.strip(), round(w.start, 2), round(w.end, 2)])
    print(f"[{s.start:7.1f}] {s.text}", flush=True)

json.dump({"audio": "audio.m4a", "duration": round(duration, 2), "words": words},
          open(os.path.join(out, "words.json"), "w"), separators=(",", ":"))
print(f"\n{len(words)} words → {out}/words.json  ·  open /?narrate={take}")
