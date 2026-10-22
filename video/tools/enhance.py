"""Clean up a narration edit: EQ, de-ess, gentle compression, a small room
reverb well under the voice, then two-pass loudness normalisation to −16 LUFS.

    python3 video/tools/enhance.py edit_raw.wav out_basename
→ out_basename.wav (24-bit 48 kHz stereo), .m4a (AAC 192k) and _16k.wav
(mono, for Whisper).

This is treatment "C" from the 2026-10-07 voice tests: the smoother EQ
(warmth around 170 Hz, less boxiness at 320 Hz, softer presence, a dip at
6.5 kHz against harshness), a firmer de-esser, slower 2.5:1 compression, and
a 0.45 s room at −17 dB under the dry voice. The room is a decaying noise
burst, so it needs no impulse-response file and comes out the same every
time.
"""
import json, os, subprocess, sys, tempfile, wave
import numpy as np

SR = 48000
CHAIN = ("highpass=f=80:poles=2,afftdn=nr=6:nf=-65:tn=1,"
         "equalizer=f=170:t=q:w=1.0:g=1.5,equalizer=f=320:t=q:w=1.2:g=-2,"
         "equalizer=f=3500:t=q:w=1.2:g=0.8,equalizer=f=6500:t=q:w=1.5:g=-1.5,"
         "equalizer=f=12000:t=h:w=0.7:g=0.8,deesser=i=0.5:m=0.6:f=0.5,"
         "acompressor=threshold=-22dB:ratio=2.5:attack=15:release=250:makeup=3:knee=6,"
         "alimiter=limit=0.89:level=false")
ROOM = dict(dur=0.45, pre=0.012, lowpass=6000, wet_db=-17)


def ff(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def read(path):
    w = wave.open(path)
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return x.reshape(-1, w.getnchannels())


def write(path, y):
    w = wave.open(path, "wb"); w.setnchannels(y.shape[1]); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()


def room_ir(seed):
    rng = np.random.default_rng(seed)
    n = int(ROOM["dur"] * SR); t = np.arange(n) / SR
    x = rng.standard_normal(n) * np.exp(-6.9 * t / ROOM["dur"])       # −60 dB at the end
    k = SR // ROOM["lowpass"]; x = np.convolve(x, np.ones(k) / k, mode="same")  # a darker tail
    x = np.concatenate([np.zeros(int(ROOM["pre"] * SR)), x])
    return x / np.sqrt((x ** 2).sum())


def main(src, out):
    with tempfile.TemporaryDirectory() as tmp:
        dry_p = os.path.join(tmp, "dry.wav")
        ff("-i", src, "-af", CHAIN, "-ac", "1", "-ar", str(SR), "-c:a", "pcm_s16le", dry_p)
        dry = read(dry_p)[:, 0]
        # stereo room: two decorrelated tails, one per side
        wet = np.stack([np.convolve(dry, room_ir(s))[:len(dry)] for s in (1, 2)], axis=1)
        g = 10 ** (ROOM["wet_db"] / 20) * np.sqrt((dry ** 2).mean()) / np.sqrt((wet ** 2).mean())
        mix_p = os.path.join(tmp, "mix.wav")
        write(mix_p, dry[:, None] + g * wet)
        # two-pass loudness: measure, then apply linearly
        m = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", mix_p, "-af",
                            "loudnorm=I=-16:TP=-1.5:LRA=8:print_format=json", "-f", "null", "-"],
                           capture_output=True, text=True).stderr
        j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
        ln = (f"loudnorm=I=-16:TP=-1.5:LRA=8:linear=true:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
              f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}")
        ff("-i", mix_p, "-af", ln, "-ar", str(SR), "-c:a", "pcm_s24le", out + ".wav")
    ff("-i", out + ".wav", "-c:a", "aac", "-b:a", "192k", out + ".m4a")
    ff("-i", out + ".wav", "-ac", "1", "-ar", "16000", "-sample_fmt", "s16", out + "_16k.wav")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
