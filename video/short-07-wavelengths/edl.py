# short-07-wavelengths: photons from gamma rays to radio are one kind of stuff on the
# Compton line; colours are labels; Earth and the sky across the spectrum; the zoom out
# by log distance; every wavelength from its own place.
# rec42 = "wavelengths take 1.aifc" (iCloud Projects/triangle/recordings, home, 2026-10-27,
# 6:59, PCM 48 kHz, the same voice on both channels): one take of the draft script in
# video/plans/wavelengths.md with retakes, a new passage on why the Compton line runs at
# 45°, and a spoken note for the visuals (1:59–2:42, left out; in the NOTES).
# Treatment: enhance.py --plain, played as recorded (no tempo). Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds;
# the builder snaps each cut to the nearest real silence.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 ("rec42", "open", 19.70, 27.04),     # I've been exploring this chart where we plot everything that exists as a log of mass and size.   (the try before, "this thing called…", breaks off)
 ("rec42", "open", 31.40, 35.66),     # And in the last video we saw that when matter breaks down it turns into gamma rays.   ("And we," left out)
 ("rec42", "open", 41.94, 42.52, {"s": 40.30}),   # Gamma rays are photons, they are particles of light.   (the second try; the first, "Gamma rays are photons, uh…", left out)
 ("rec42", "same", 43.24, 52.68),     # And here's the thing, every photon is the same kind of particle. Gamma rays, X-rays, ultraviolet(?), visible light, infrared, microwaves, radio waves, all the same stuff.
 ("rec42", "same", 53.72, 59.20, {"e": 60.25}),     # The only difference is how much energy each photon carries. More energy, shorter wavelength,
 ("rec42", "same", 60.58, 62.18, {"s": 60.88}),     # less energy, longer wavelength.   (a "yeah" before it left out)
 ("rec42", "same", 63.50, 68.74),     # That's the line they make on the chart, from gamma rays here all the way to radio waves.
 ("rec42", "line", 72.64, 76.88),     # That's why the Compton line runs at a 45 degree angle,   (the second try)
 ("rec42", "line", 90.08, 95.36, {"e": 96.18}),     # at this scale we look at energy instead of mass, they are the same, and we look at wavelength   (the restarts before it left out)
 ("rec42", "line", 95.94, 97.66, {"s": 97.18}),     # instead of size.   (a false start, "of", before it left out: 96.24–96.64)
 ("rec42", "line", 98.98, 100.52),    # And the more energy, the shorter wavelength.
 ("rec42", "line", 111.64, 114.32),   # And that's one of the limits of our triangle.   ("almost everything falls into…", "a contour line", "the limit of how any" left out)
 ("rec42", "eyes", 116.60, 118.14),   # Now let's go back to visible light.
 ("rec42", "eyes", 172.80, 178.30),   # This is the Earth as you would see it from space and the sky behind it in the light our eyes can see.   (the note to Claude, 1:59–2:42, and the retakes left out)
 ("rec42", "eyes", 178.80, 181.56),   # But color isn't something out there in the world.
 ("rec42", "eyes", 185.86, 187.84),   # It's a label your brain puts on a wavelength.   (the second try; the first says "puts out")
 ("rec42", "eyes", 189.08, 193.82),   # We have three kinds of color sensor in our eyes and we call what they see red, green and blue.
 ("rec42", "eyes", 194.82, 205.68),   # If our eyes were tuned just a little bit differently, we would see infrared as red, red as green and green as blue. Look, the forests light up because plants reflect a lot of infrared.   (a stray "red." after it left out)
 ("rec42", "eyes", 206.90, 221.02),   # Or we could shift the other way, like a bee does and see ultraviolet as blue. So here we have the answer to: is the red we see the same as the red that everyone sees? Well, not if you're talking about bees.
 ("rec42", "up", 222.66, 250.46),     # Now let's keep going. In ultraviolet… X-rays… pairs of stars where one is eating the other.
 ("rec42", "up", 251.76, 265.30),     # In gamma rays, the most energetic light there is, … giant black holes at the center.
 ("rec42", "down", 270.51, 275.08),   # Now let's go all the way back down to infrared, where we see heat.   (the first try breaks off)
 ("rec42", "down", 286.86, 288.34, {"s": 285.08}),   # Warm land glows, cold cloud tops are dark.   (the last try, said in what Whisper heard as a pause; "warm lands glow…" before it left out)
 ("rec42", "down", 289.14, 298.02, {"e": 298.80}),   # In the sky infrared goes straight through the dust… Further down, we see the dust itself,
 ("rec42", "down", 299.30, 315.10, {"s": 300.12}),   # cold clouds where new stars are born… the afterglow of the Big Bang.   (a false start, "cold—", before it left out: 299.14–299.6)
 ("rec42", "far", 321.16, 324.74),    # And that's an interesting part, because not all light comes from the same place.   (the second try)
 ("rec42", "far", 339.36, 343.00),    # So let's put everything in a log scale like we're doing in the chart.
 ("rec42", "far", 351.02, 353.38),    # It's the only way we can see the whole universe.
 ("rec42", "far", 354.62, 356.86),    # So if Earth is this big, that's the Moon's orbit,
 ("rec42", "far", 359.32, 367.72),    # just over one light-second away, then the Sun eight light-minutes away, and then the closest stars a few light-years away.   ("just one light," left out)
 ("rec42", "far", 368.86, 376.48),    # Zoom out further and the sky becomes a cloud of dots, the stars around us, then our galaxy and then the entire observable universe.
 ("rec42", "again", 378.70, 407.04),  # Now let's go through the spectrum again. … exploding stars and feeding black holes.
 ("rec42", "end", 408.76, 410.78),    # Every wavelength is a different window,   (the first try)
 ("rec42", "end", 414.76, 416.50),    # and each one shows a different universe.
]

# The clean-up of 2026-10-28 (video/sources/2026-10-27/NOTES.md): one pause the PAUSES cap missed
# (room noise over the silence threshold), cut out of the finished edit with video/tools/postcut.py,
# since rec42 isn't at hand to rebuild. Spans of the edit, in seconds.
POST_CUTS = [
 (121.20, 121.50),  # "so you have to go to space to see it. | Further up": 0.8 s → 0.5
]
