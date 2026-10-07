# short-01-hook: the opening hook as a vertical short, cut from the
# 2026-10-07 morning recordings (raw files live in iCloud):
#   rec2 = Link_office_mall_2.m4a (the intro, several passes)
#   rec7 = wavelength.m4a (iCloud, 1:18, 48 kHz; the mass/size → energy → wavelength
#          lines, replacing rec4's, which had the air conditioner under them)
# (source, beat, first-word start, last-word start, {optional exact s/e}) in
# source seconds; the builder snaps each cut to the nearest real silence.
# rec6 = "O2 Corporate & Offices 2.m4a" (Google Drive, 48 kHz lossless; mic about
# 10 cm away, off to the side). It is 4–8 dB darker above 1.2 kHz than rec3;
# this EQ matches it to rec3 within about ±2 dB.
# rec7 (close, quiet room) has a honk at 1 kHz and is thin at 1.2–2 kHz next to
# rec2/rec6; this EQ (fitted on third-octave averages) matches it within
# ±0.3 dB above 250 Hz. In the edit, rec7's clips also carry 4 s of rec6's
# room tone (same cleanup, −55 → −59.5 dB), so the background doesn't drop out.
SOURCE_FX = {"rec6": "equalizer=f=1400:t=q:w=1.2:g=4,highshelf=f=4500:t=q:w=0.6:g=7",
             "rec7": "equalizer=f=180:t=q:w=1.2:g=-4,highshelf=f=3000:t=q:w=0.6:g=4,highshelf=f=11000:t=q:w=0.7:g=-2.5,firequalizer=gain_entry='entry(100,0.51);entry(125,0.48);entry(160,-1.09);entry(200,-1.25);entry(250,-1.61);entry(315,0.52);entry(400,2.91);entry(500,-1.16);entry(630,1.46);entry(800,3.33);entry(1000,-5.05);entry(1250,3.87);entry(1600,4.70);entry(2000,4.72);entry(2500,-3.36);entry(3150,-3.60);entry(4000,2.30);entry(5000,0.07);entry(6300,-0.89);entry(8000,1.76);entry(10000,-2.80);entry(12500,-1.94);entry(16000,-1.26)'"}

EDL = [
 ("rec2", "open", 48.52, 52.66),    # This is the most interesting chart in all of physics.
 ("rec2", "diag", 63.18, 73.36),    # The first thing you probably noticed ... stars and planets and galaxies.
 ("rec2", "axes", 96.32, 98.66),    # The vertical axis is mass,
 ("rec2", "axes", 100.84, 104.62),  # the horizontal axis is in size.
 ("rec7", "axes", 39.24, 43.80, {"s": 40.62}),  # So this is a chart of mass versus size, right? (Whisper puts "So" late; a false-start "so" at 37.6 is left out)
 ("rec7", "more", 44.72, 53.64),    # Yeah, but it's so much more than that actually ... visible light, or radio waves.
 ("rec7", "energy", 54.68, 58.18),  # This is because this chart is also a chart of energy.
 ("rec7", "energy", 69.30, 72.42),  # And the bottom axis doubles as a wavelength.
 ("rec6", "time", 133.08, 134.88),  # it gets even crazier
 ("rec6", "time", 142.52, 149.20, {"e": 149.42}),  # because on the bottom left, we have quantum mechanics, on the top left, we have relativity and they connect in
 ("rec6", "time", 151.94, 152.32, {"gap": 0.08}),  # this one point.
 ("rec6", "time", 153.94, 154.74),  # What is that point?
 ("rec6", "time", 155.22, 166.54),  # And then you realize ... diagonal lines ... measured in seconds until they get to now. That is time since the Big Bang.
 ("rec6", "time", 167.58, 171.10),  # So relativity and quantum mechanics are joining at the Big Bang.
 ("rec2", "end", 214.08, 220.98, {"e": 222.40, "gap": 1.0}), # This is the triangle of everything, and let me take you a tour around because it is simply fascinating.
]
