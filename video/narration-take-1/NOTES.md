# Narration take 1: edit notes

**Source:** `Unimed_Rio_Empreendimentos…_2.m4a`, 23:25, mono AAC 48 kHz (iPhone)
**Edit:** `narration-edit.m4a` / `narration-edit-24bit.wav`, **12:49**, 104 clips, −16 LUFS integrated, −1.5 dBTP

| File | What it is |
|---|---|
| `narration-edit.m4a` | The edited, cleaned narration (AAC 192k), ready for an NLE |
| `narration-edit-24bit.wav` | Same edit, 24-bit/48k master |
| `narration.srt` | Subtitles timed to the edit |
| `cuts.csv` | Every clip: edit in/out, source in/out, tour step, text |
| `raw-transcript.md` | Full re-transcription of the raw recording: kept words plain, cut words ~~struck~~ |
| `SYNC-SCRIPT.md` | Shot-by-shot plan for screen-recording the app to this audio |
| `tools/` | Scripts that rebuild the edit from the raw file (see the end of this doc) |

---

## 1. Transcript check

Your pasted transcript was an automatic one, with mishearings: "short / shard / shark" for *chart*, "Shandra thicker" for *Chandrasekhar*, "Schwarz Child radios" for *Schwarzschild radius*, "Linacea" for *Laniakea*, "wolf ride" for *Wolf-Rayet*, "cat giant" for *gas giant*, and "Sunday" for *suddenly*. I re-transcribed the whole recording with word-level timestamps. That transcript drove the edit. `raw-transcript.md` is the corrected, full version.

Your accent turns "chart" into something like "short/shard" every time. That's fine in context, but subtitles help. `narration.srt` already says "chart".

## 2. How the takes were chosen

You often restart a sentence two or three times. For each idea I kept the cleanest complete take, cut false starts ("this is the triangle of, this is the triangle of…"), and dropped unfinished thoughts ("Jupiter already…", "it will become…" after Chandrasekhar). In a few places I spliced words from different takes to fix a slip:

- **01:57** The original said "everything that is on the **right** will **sink**", which is wrong (it's the left). I replaced it with "On the left side are things that are heavier", taken from a later take.
- **02:17** "…and most of those data points are mostly meteorites and meteors" was moved to follow "most of the stuff here is to the left side".
- **05:56** "…and they become red giants" comes from an earlier take of the stellar life cycle.
- **10:57** "The Hubble radius is the limit…" uses the third attempt. The first two trailed off.

Long pauses inside sentences are capped at about 0.55 s. Clips within a section are separated by 0.28 s, and tour steps by 0.9 s, which leaves room for camera moves. Trim or stretch those gaps in your editor as the visuals need.

**Please listen to these splices.** I verified the edit by re-transcribing it, not by ear, so intonation jumps are possible at: 01:57, 02:17, 02:33, 03:58, 05:56, 09:36, 10:57, 11:24, 12:16–12:19.

## 3. Audio processing

The raw file was already very clean: the noise floor is about −78 dBFS, probably thanks to the iPhone's voice processing. Processing is light, and there's no aggressive denoising that could make you sound watery:

1. 80 Hz high-pass (rumble, handling noise)
2. Light FFT denoise (6 dB)
3. EQ: −2 dB at 250 Hz (boxiness), +2.5 dB at 3.8 kHz (presence/intelligibility), +1.5 dB air shelf at 11 kHz
4. De-esser
5. Compressor 3:1 at −24 dB (evens out loud/quiet phrases)
6. Two-pass loudness normalization to **−16 LUFS**, true peak −1.5 dB (good for YouTube; it turns down anything louder than −14)

Raw integrated loudness was −29 LUFS, so the edit is roughly 13 dB louder and much more even.

If you re-record: point the phone's bottom mic at your mouth from 15–20 cm, in a room with soft furnishings. Record each section as its own file, and say the line again after a mistake instead of restarting the paragraph.

## 4. Things that are wrong or could be better

Ranked by how much a viewer (or a physicist in the comments) would notice. **Re-record** = it's in the edit and should be fixed. **Cut** = I already removed it; only matters if you want that idea back.

### Factual errors still in the edit (re-record)

| Edit time | Said | Problem | Suggested line |
|---|---|---|---|
| 04:14 | "Saturn is actually as dense as **styrofoam**" | Saturn is 0.69 g/cm³. Styrofoam is about 0.03, so 20× too light. | "Saturn is less dense than water, about as dense as pine wood." |
| 04:20 | "you could take **a little bit of Saturn** and it would float" | Only Saturn *as a whole* averages below water. Its core is rock and metal, so a scoop of it would sink. | "…if you could find a pool large enough, Saturn would float in it." |
| 03:58 | "We have **four gas giants**" | Jupiter and Saturn are gas giants. Uranus and Neptune are *ice giants*. | "We have four giant planets in our solar system." |
| 05:49 | "when they run out of **helium**" | Stars leave the main sequence when the *hydrogen* in their core runs out. | "When they run out of hydrogen in their core…" |
| 06:04 | "until they will **often** just go boom" | Only stars above about 8 Suns go supernova, a small minority. The Sun and most stars puff off a planetary nebula and leave a white dwarf, with no boom. | "…and the most massive ones end with a boom: a supernova." |
| 06:32 | "[after the supernova] it might become a white dwarf" | White dwarfs come from the *non-exploding* stars, not from supernova cores. | Mention white dwarfs with the planetary-nebula ending, and keep neutron stars and black holes for supernovae. |
| 12:00 | "The observable universe is a bubble in which **nothing can escape**" | It's the reverse. Nothing from *outside* can ever reach us. | "…a bubble that nothing outside can ever reach." |
| 12:17 | "the observable universe was **not always** on the Schwarzschild radius" | For a flat universe at critical density, the mass inside the Hubble radius has a Schwarzschild radius *exactly equal* to the Hubble radius, at every epoch (M = c³/2GH ⇒ r_s = c/H). So it has always been on the line, and that's the real reason it sits there. **The same claim is in the tour text** (`content/tour-content.md`, "largest": "after all it wasn't always there"). | "It's not really a coincidence: any flat universe sits exactly on this line, at every moment of its history." Fix the tour text too. |
| 11:24 | "the size of the universe is, as far as we know, **infinite**" | Unknown: it may be infinite or just much larger than what we see. | "…might be infinite. We simply don't know." |
| 10:57 | "The Hubble radius is the limit at which anything can be seen by us" | Approximate. The Hubble radius (about 14 billion light-years) is where expansion carries things away faster than light. We actually see some light from beyond it (the observable universe is about 46 billion light-years in radius). | Fine for this video, but a safer line is "…roughly the edge of the universe that can affect us". |
| 09:36–09:48 | "That's the density of dark matter. And that's the density of supernovas, stellar nurseries, **globular clusters**…" | Supernova remnants and nebulae are gas, and globular clusters contain almost no dark matter. Only galaxies and larger are dark-matter dominated. | "Along this second line sit nebulae and star clusters, then galaxies and clusters of galaxies, which are mostly dark matter." |
| 10:08 | "super filaments like the one we live on called Laniakea" | Laniakea is a *supercluster*. Pronounced lah-nee-ah-KAY-ah. | "…superclusters, like the one we live in, Laniakea…" |
| 10:28 | voids are "completely void of stars" | Voids are under-dense but still contain some galaxies (the Boötes void has about 60). | "…areas with very few galaxies…" |
| 08:22 | "we also **know** that those same conditions have happened in the early universe" | Primordial black holes are hypothetical. | "…we think those conditions may also have existed in the early universe." |
| 08:31 | "**Most** of them will have evaporated by now" | Only the ones lighter than about a billion tonnes would have evaporated by now. | "The smallest ones would have evaporated by now…" |

### Imprecise but acceptable (optional re-record)

- **01:52** "everything on the right of the **chart**" should be "right of the **line**".
- **02:02** "The hippo is right on the chart" means *on the line*. The tour text says it sits slightly *left* (denser), which is why it sinks and walks on the riverbed. Worth saying it that way.
- **02:17** "most those data points is mostly meteorites and meteors": grammar, and *meteors* are the streaks of light, not objects. Say "meteorites and asteroids".
- **02:38** "meaning they're heavy" should be "dense" (heavy is about mass, not density).
- **02:53** "when we reach Pluto… a perfect sphere". Rounding starts much earlier (Mimas, about 400 km, is round). Try "by the time we reach Ceres and Pluto, they're perfect spheres". "Acts as a liquid" is fine for the audience.
- **03:26** "Mercury, Mars, Venus, Earth": the atmosphere doesn't simply grow with mass. Venus has about 90× Earth's atmosphere with less mass. Consider dropping Venus, or saying "roughly".
- **03:40** "That's because Earth sits in a very thin line…" doesn't follow from "we reach the gas giants". Try "Earth sits in a narrow band between…".
- **04:22** "most of the **stars** start going on the other line" should be "most *objects* start bending left of the line".
- **04:45–05:15** "stripping away the atoms… fusion of the atoms": strictly, pressure strips *electrons* off atoms and fuses atomic *nuclei*. **Brown dwarfs** are missing between Jupiter and the stars (the app has L, T and Y brown dwarfs) and would make a nice beat.
- **05:28** "called the main sequence star" should be "called the main sequence".
- **06:08** "A supernova is a rapidly expanding cloud of gas": the explosion is the supernova and the cloud is the *supernova remnant*, which is the object's name in the app.

### Ideas I cut (re-record if you want them back)

- **Wolf-Rayet stars / the split at the top of the main sequence** (source 9:17). You said "special *planets* called wolf-riot types… red sequence". Suggested: "At the very top, the line frays: the most massive stars, like Wolf-Rayet stars, blow off their own outer layers."
- **Chandrasekhar limit** (source 11:52, unfinished). "If the leftover core is heavier than the Chandrasekhar limit, about 1.4 Suns, it collapses into a neutron star; above about 2 to 3 Suns, into a black hole."
- **"Jupiter already…"** (source 8:30). Jupiter gives off about 1.7× the heat it receives from the Sun, from slow contraction (not fusion). That's a nice detail if you finish the thought.
- **Excluded dark-matter masses** (source 18:07, garbled). "Observations have ruled out most masses for primordial black holes, but an asteroid-mass window is still open."
- **"A thousand times more empty than the vacuum of space"** (source 18:55). This is wrong as said (galaxies are far *denser* than intergalactic space), so it stays cut.
- **"mass of a moon but the size of a single proton"** (source 15:37). This is wrong: a proton-sized black hole weighs about a mountain. The kept take ("mass of a small moon, size of an atom") is right for a small moon like Phobos.
- The title-axis hook (0:20–1:57) had three passes. The edit keeps one tight version (0:00–0:38).

### Structural suggestions

- The hook (0:00–0:38) describes the *original* Lineweaver–Patel figure ("the top… is measured in time"). It works best over the classic view (`L`), then cuts to the app on "Let me take you through the triangle of everything." See the sync script.
- The narration stops at the Hubble radius. The tour continues through the **microscopic, Compton limit, EM spectrum, particle physics and cosmic history** steps. That's a natural **part 2** recording; the third side of the triangle (the Compton wavelength) is never mentioned. Say "the first limit" and "the second side" as you do now, and add a teaser at the end: "…and there's a third side, at the bottom. That's for the next video."
- The video has no outro. Even one line ("This is the triangle of everything: everything that is, was, or could ever be, fits inside it.") would land better than ending on "…communicate that to us."

---

## Rebuilding the edit

Everything is scripted, so you can change a cut and regenerate:

```bash
# in a scratch dir containing audio/raw.wav (48k mono) + audio/raw16.wav (16k) + transcript.json
python3 tools/transcribe.py audio/raw16.wav transcript.json    # Whisper medium.en, word timestamps (pip install faster-whisper)
python3 tools/build.py .                                       # reads tools/edl.py → audio/edit_raw.wav + cuts.csv
tools/enhance.py audio/edit_raw.wav audio/edit_enhanced        # cleanup + −16 LUFS
```

`tools/edl.py` is the edit decision list: one line per clip, `(tour_step, first_word_time, last_word_time, {optional exact s/e override})`, with the spoken text as a comment. Cuts snap to the nearest real silence automatically.
