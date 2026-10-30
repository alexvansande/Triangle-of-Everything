#!/usr/bin/env python3
"""The YouTube upload file for a short: the render's picture with its sound encoded once, from
lossless audio, at YouTube's recommended AAC-LC 384 kbps 48 kHz stereo.

    python3 scripts/narration-master.py short-02-up-the-line           # all three steps
    python3 scripts/narration-master.py short-02-up-the-line --steps mux

The committed sound is lossy three times before YouTube encodes it again: audio.m4a (AAC), mix.m4a
(decoded, mixed, AAC again) and the render (decoded, AAC again). This rebuilds the same sound from
the original recordings instead, checking each step against the committed file:

  voice  the cut voice from the raw recordings (Google Drive "Recordings", iCloud
         Projects/triangle/recordings; NARRATION_RECORDINGS=dir:dir… to look elsewhere): the take's
         EDL (video/<take>/edl.py, with its SOURCES and TREATMENT) through video/tools/build.py, the
         voice treatment, POST_CUTS and the take's tempo (words.json), as when it was cut.
         → output/narration/<take>/voice.wav, checked against audio.m4a.
  mix    the sound design on that voice (scripts/narration-sound.mjs --wav: needs the dev server,
         BASE=http://localhost:5184 for the shorts checkout's, and CHROME=<Chrome binary>).
         → output/narration/<take>/mix.wav, checked against mix.m4a.
  mux    the render output/videos/<take>.mp4 with that mix, encoded once, padded with silence to
         the render's exact length as the renderer does. The render's own sound is checked against
         the mix first, so a render older than the take's sound is refused.
         → output/videos/<take>.youtube.mp4, which scripts/youtube-publish.py uploads.

"Checked" means: no shift, the same level (±0.3 dB), the same length (to the AAC's padding), and
what's left after subtracting the two at least 30 dB under the sound (AAC's own noise is about
40–45 dB under). A take whose EDL doesn't rebuild its audio.m4a stops there: fix the EDL or the
treatment rather than upload something other than the approved cut.
Needs numpy (run it with a Python that has it, e.g. a venv); output/ is outside git.
"""
import argparse, glob, importlib.util, json, os, shutil, subprocess, sys
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
PY = sys.executable
HOME = os.path.expanduser("~")
RECORDINGS = (os.environ["NARRATION_RECORDINGS"].split(":") if os.environ.get("NARRATION_RECORDINGS") else
              glob.glob(f"{HOME}/Library/CloudStorage/GoogleDrive-*/My Drive/Recordings*") +
              [f"{HOME}/Library/Mobile Documents/com~apple~CloudDocs/Projects/triangle/recordings"])


def ff(*a, input=None):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *a], input=input, check=True)


def decode(path, ch):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-map", "0:a:0", "-ac", str(ch), "-ar", str(SR),
                        "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(r, np.float32).astype(np.float64).reshape(-1, ch)


def write(path, x):
    ff("-f", "f32le", "-ar", str(SR), "-ac", str(x.shape[1]), "-i", "-", "-c:a", "pcm_f32le", path,
       input=x.astype(np.float32).tobytes())


def lufs(path):
    m = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-map", "0:a:0", "-af", "ebur128",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(m[m.rindex("I:"):].split()[1])


def compare(ref, new, what, max_len_ms):
    """ref (the committed, lossy) against new (the rebuild), on the first channel: the shift in
    samples, the level difference and the residual. Exits if they differ."""
    a, b = ref[:, 0], new[:, 0]
    # the shift: cross-correlate 20 s from the loudest stretch, ±0.1 s
    sec = (a[:len(a) // SR * SR].reshape(-1, SR) ** 2).sum(1)
    s0 = int(np.argmax(np.convolve(sec, np.ones(20), "valid"))) * SR; W, L = 20 * SR, SR // 10
    lo = max(0, s0 - L); x, y = a[s0:s0 + W], b[lo:s0 + W + L]
    n = 1 << int(np.ceil(np.log2(len(x) + len(y))))
    c = np.fft.irfft(np.fft.rfft(y, n) * np.conj(np.fft.rfft(x, n)), n)[:len(y) - len(x) + 1]
    lag = int(np.argmax(c)) - (s0 - lo)
    m = min(len(a), len(b))
    A, B = (a[:m - lag], b[lag:m]) if lag >= 0 else (a[-lag:m], b[:m + lag])
    k = (A * B).sum() / (B * B).sum()
    res = 10 * np.log10(((A - k * B) ** 2).sum() / (A ** 2).sum())
    dlen = (len(b) - len(a)) / SR * 1000
    ok = lag == 0 and abs(20 * np.log10(k)) < 0.3 and res < -30 and abs(dlen) <= max_len_ms
    print(f"  {what}: {'same' if ok else 'DIFFERENT'} (shift {lag} samples, level {-20 * np.log10(k):+.2f} dB, "
          f"residual {res:.1f} dB, length {dlen:+.1f} ms)")
    if not ok:
        sys.exit(f"  {what} doesn't match: stopping")


def edl_module(take):
    spec = importlib.util.spec_from_file_location("edl", os.path.join(ROOT, "video", take, "edl.py"))
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
    return m


def find_recording(name):
    for d in RECORDINGS:
        p = os.path.join(d, name)
        if os.path.exists(p): return p
    sys.exit(f"  recording not found: {name!r} (looked in {', '.join(RECORDINGS)}; NARRATION_RECORDINGS=dir:dir…)")


def voice(take, out):
    m = edl_module(take)
    sources, treatment = getattr(m, "SOURCES", None), getattr(m, "TREATMENT", None)
    if not sources or not treatment:
        sys.exit(f"  video/{take}/edl.py needs SOURCES (source → raw file name) and TREATMENT to rebuild the voice")
    meta = json.load(open(os.path.join(ROOT, "public", "narration", take, "words.json")))
    edl = os.path.join(ROOT, "video", take, "edl.py")
    work = os.path.join(out, "work"); os.makedirs(os.path.join(work, "audio"), exist_ok=True)
    for src, fname in sources.items():   # as in video/short-01-hook/README.md, "Rebuild"
        ff("-i", find_recording(fname), "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", f"{work}/audio/{src}.wav")
        words = glob.glob(os.path.join(ROOT, "video", "sources", "*", f"{src}.words.json"))
        if not words: sys.exit(f"  no video/sources/*/{src}.words.json")
        shutil.copy(words[0], work)
    subprocess.run([PY, os.path.join(ROOT, "video", "tools", "build.py"), work, edl], check=True)
    raw, edit = f"{work}/audio/edit_raw.wav", f"{work}/audio/edit"
    if treatment == "plain":            # enhance.py --plain: an 80 Hz high-pass, −16 LUFS, a limiter
        subprocess.run([PY, os.path.join(ROOT, "video", "tools", "enhance.py"), raw, edit, "--plain"], check=True)
    elif treatment == "peak":           # the 2026-10-26 test: an 80 Hz high-pass, one gain to a −1 dBFS peak
        ff("-i", raw, "-af", "highpass=f=80:poles=2", "-c:a", "pcm_f32le", edit + ".hp.wav")
        x = decode(edit + ".hp.wav", 1)
        write(edit + ".wav", x * 10 ** (-1 / 20) / np.abs(x).max())
    else:
        sys.exit(f"  unknown TREATMENT {treatment!r} (plain, peak)")
    cur = edit + ".wav"
    if getattr(m, "POST_CUTS", None):
        subprocess.run([PY, os.path.join(ROOT, "video", "tools", "postcut.py"), edl, cur, f"{work}/audio/postcut.wav"], check=True)
        cur = f"{work}/audio/postcut.wav"
    if meta.get("tempo", 1) != 1:       # scripts/narration-tempo.py's stretch, on the lossless edit
        if meta.get("stretch", "atempo") != "atempo": sys.exit(f"  tempo engine {meta['stretch']} not supported")
        ff("-i", cur, "-af", f"atempo={meta['tempo']}", "-c:a", "pcm_f32le", f"{work}/audio/tempo.wav")
        cur = f"{work}/audio/tempo.wav"
    ref, new = decode(os.path.join(ROOT, "public", "narration", take, meta["audio"]), 1), decode(cur, 1)
    compare(ref, new, "voice against audio.m4a", max_len_ms=25)
    # to the decoded audio.m4a's sample count (its AAC padding), so the word timings and the
    # mix's length hold exactly
    write(os.path.join(out, "voice.wav"), np.pad(new[:len(ref)], ((0, max(0, len(ref) - len(new))), (0, 0))))
    print(f"  → output/narration/{take}/voice.wav ({len(ref) / SR:.2f} s)")


def mix(take, out):
    subprocess.run(["node", os.path.join(ROOT, "scripts", "narration-sound.mjs"), "--wav", take], check=True, cwd=ROOT,
                   env=dict(os.environ, PYTHON=PY))
    m4a, wav = os.path.join(ROOT, "public", "narration", take, "mix.m4a"), os.path.join(out, "mix.wav")
    compare(decode(m4a, 2), decode(wav, 2), "mix against mix.m4a", max_len_ms=25)
    print(f"  loudness: mix.m4a {lufs(m4a):.2f} LUFS, mix.wav {lufs(wav):.2f} LUFS")


def mux(take, out):
    render = os.path.join(ROOT, "output", "videos", f"{take}.mp4")
    dest = os.path.join(ROOT, "output", "videos", f"{take}.youtube.mp4")
    wav = os.path.join(out, "mix.wav")
    if not os.path.exists(render): sys.exit(f"  no render: {render}")
    dur = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration",
                          "-of", "csv=p=0", render], capture_output=True, text=True, check=True).stdout.strip()
    # the render's own sound (mix.m4a, padded to the picture) against the lossless mix: a render
    # made before the take's sound last changed doesn't line up
    rend, lossless = decode(render, 2), decode(wav, 2)
    n = min(len(rend), len(lossless))
    compare(rend[:n], lossless[:n], "render's sound against mix.wav", max_len_ms=0)
    ff("-i", render, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", "apad", "-t", dur,
       "-c:a", "aac", "-profile:a", "aac_low", "-b:a", "384k", "-ar", str(SR), "-ac", "2", "-movflags", "+faststart", dest)
    probe = lambda p, s: subprocess.run(["ffprobe", "-v", "error", "-select_streams", s, "-show_entries",
                                         "stream=codec_name,duration,bit_rate", "-of", "csv=p=0", p],
                                        capture_output=True, text=True).stdout.strip()
    for name, p in (("render", render), ("upload", dest)):
        print(f"  {name}: video {probe(p, 'v:0')}, audio {probe(p, 'a:0')}, {lufs(p):.2f} LUFS")
    print(f"  → output/videos/{take}.youtube.mp4")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("takes", nargs="+")
    ap.add_argument("--steps", default="voice,mix,mux")
    a = ap.parse_args()
    for take in a.takes:
        out = os.path.join(ROOT, "output", "narration", take); os.makedirs(out, exist_ok=True)
        print(take, flush=True)
        for step in a.steps.split(","):
            {"voice": voice, "mix": mix, "mux": mux}[step](take, out)
