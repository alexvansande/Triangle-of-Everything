# short-06-tiny-world: the tiny world, from us down to the Compton line. The third edge,
# a human, metric units and the water line, the small animals and microbes, where biology
# hands over to chemistry, molecules, atoms and the periodic table, the Compton line, light
# on the line, and radioactivity as matter turning into light; the hook for wavelengths.
# rec39 = "wavelengths take 2.aifc" (iCloud Projects/Triangle/recordings, 2026-10-27, 15:17,
# 48 kHz stereo PCM): one take of the script (video/scripts/recording-scripts.md, video 6)
# with retakes; the author swapped the script's electron ending for radioactivity.
# "wavelengths take 1.aifc" (7 min, same day) is not used.
# Treatment: enhance.py --plain, 1.1x. Build: see video/short-01-hook/README.md.
# (source, beat, first-word start, last-word start, {s, e, gap}) in source seconds;
# the builder snaps each cut to the nearest real silence.

PAUSES = {"word": 0.18, ",": 0.3, ".": 0.45}

EDL = [
 ("rec39", "edges", 7.70, 13.38),     # In this series, we've been drawing everything in the universe in one chart, mass against size.
 ("rec39", "edges", 17.60, 19.54),    # Everything ends up boxed in by three edges.   (the second try)
 ("rec39", "edges", 20.32, 23.16),    # We've seen two of them. First is the black hole line.
 ("rec39", "edges", 33.90, 39.16, {"s": 33.55}),    # For any given size, there's a limit for how massive you can be until you become a black hole.   (the author's cut, 2026-10-27: "nothing can be more massive" before it said the same thing; the false starts left out)
 ("rec39", "edges", 39.44, 44.12),    # And then the second is the Hubble radius: nothing can be bigger than that.
 ("rec39", "edges", 44.54, 50.24),    # Today I want to explore the third side, the limit of how small something can be.   (the first try; the second says "size")
 ("rec39", "human", 63.92, 64.68),    # So let's start with us.
 ("rec39", "human", 69.12, 75.10),    # This is a human, about two meters tall and around 100 kilos. On a log chart that's close enough.
 ("rec39", "human", 76.08, 78.88),    # And notice that we measure everything as if they were spheres.
 ("rec39", "units", 112.62, 119.40),  # We use the metric units here because they fit the grid so neatly, but really every unit fits in this chart.   (the fourth try)
 ("rec39", "units", 120.70, 129.34),  # One gram of water fills one cubic centimeter, so water lands on this one diagonal line. Everything to the left is denser and sinks, like this meteorite.
 ("rec39", "units", 132.28, 134.68),  # Everything to the right floats, like a soccer ball.
 ("rec39", "small", 137.06, 147.24),  # Most animals live on a narrow band along that line, because we are mostly made of water. As we go down we reach the smallest insects: ants, ladybugs, tiny moths.
 ("rec39", "small", 148.38, 150.10),  # This is a single grain of sand.
 ("rec39", "small", 154.10, 158.56),  # Now we are among the microorganisms: tardigrades, amoebas, and a grain of pollen.
 ("rec39", "small", 163.80, 173.22, {"s": 166.45}),  # Further down, now a red blood cell, about seven thousandths of a millimeter across. Then bacteria.   (the third "further down": the second breaks off at "red blood" and was in the first cut)
 ("rec39", "small", 174.60, 189.58),  # Notice that almost all of microbiology sits just a little to the left of the water line. That's actually useful. That's why a centrifuge works. Spin them fast enough and cells and viruses, being denser than water, sink to the bottom.   (the full Whisper pass dropped "a centrifuge works. Spin them fast enough"; a re-listen has it)
 ("rec39", "chem", 192.08, 202.10),   # Now this is where biology ends and chemistry begins. Viruses sit right in between. Most biologists don't count them as alive, but they are far more than just a molecule.
 ("rec39", "chem", 203.24, 205.04),   # And now we are in the kingdom of molecules:
 ("rec39", "chem", 206.60, 213.70, {"e": 214.2}),   # the ribosome, the factory that builds your proteins, antibodies, hemoglobin, which carries oxygen in your blood,   ("and" left out: the retake starts with its own)
 ("rec39", "chem", 225.36, 237.36, {"s": 225.05, "e": 238.3}),   # and what makes every one of us: DNA. Its code is written with just these four molecules. Then we have simpler and simpler molecules, like sugar and water, until we reach the atoms.   (the second try; the end stops before the first "Here's hydrogen")
 ("rec39", "atoms", 280.38, 296.08, {"s": 282.42}),  # Here's hydrogen. For any atom, the mass comes almost all from its nucleus, but the size comes from its cloud of electrons. Add a second proton, with two neutrons to hold it together, and you get helium: four times the mass.   (the second try, from its second "Here's hydrogen"; "nuclei" and the break-off left out)
 ("rec39", "atoms", 301.92, 329.42),  # But that extra charge pulls the electrons in closer, so helium is actually smaller. Add one more and you get lithium, and its third electron has to start a new shell, so it balloons out: now it's bigger. And notice that that keeps happening. With every proton, atoms get heavier, and smaller, and smaller, until a new shell starts and they balloon out again. Bigger and smaller, over and over, at regular intervals.
 ("rec39", "atoms", 348.28, 350.44),  # That's why we get a periodic table.   (the end of the third try; "those intervals are bigger and smaller…" left out)
 ("rec39", "atoms", 353.78, 362.08),  # That thing you saw on the wall in your chemistry class isn't just arbitrary: you can see it right here, drawn by the atoms themselves.
 ("rec39", "atoms", 377.50, 383.58),  # The alkali metals ballooning out at the start of every row, and the noble gases tucked in at the end.   (the third try, from its second "the alkali metals")
 ("rec39", "atoms", 390.48, 411.56),  # Some atoms are just a little weird. Palladium jumps over towards the noble gases. It's the only element that leaves its new outer shell completely empty. Its outer electrons all huddle in a full inner shell instead, so it's almost as compact as a noble gas. Down here are the lanthanides, gold and silver.
 ("rec39", "atoms", 416.48, 432.90),  # Up to iron, elements are forged in the cores of stars. Everything heavier, like gold or uranium, takes something even more violent: exploding stars and colliding neutron stars. Past here, every element is radioactive,   (the second "up to iron": the first says "core")
 ("rec39", "atoms", 434.46, 440.60),  # and this is oganesson, the heaviest element we've ever made, just a few atoms at a time.
 ("rec39", "edge", 444.10, 450.62),   # So what happens if you keep following the line down? We reach the third and final edge of the triangle: the Compton line.
 ("rec39", "edge", 451.96, 466.24),   # Down here, physicists stop weighing things in grams. They use electron volts, which is a unit of energy. Divide it by the speed of light squared, and you get mass. That's Einstein: E equals m c squared.
 ("rec39", "edge", 479.42, 482.62),   # Deep down, mass and energy are the same.   (the third try; "down in this rabbit hole" left out)
 ("rec39", "edge", 485.06, 495.40),   # And everything with energy also has a wavelength. The more energy, the faster it oscillates and the shorter its wavelength. You can't squeeze something smaller than that.
 ("rec39", "edge", 537.28, 546.32),   # To squeeze it, you have to add energy, and if you squeeze it any tighter, that energy you put in just makes new particles, pairs of matter and antimatter.   (the last try; the stray audio at 8:33–8:48 and the tries around it left out)
 ("rec39", "edge", 585.54, 600.70),   # So nothing can be smaller than its own wavelength. And the heavier something is, the smaller that limit gets, which is why this line looks this way. And it's why no object can cross to the other side. It's the quantum limit of our triangle.   (the last try)
 ("rec39", "light", 636.52, 641.20),  # So here's something very cool. Everything on this line is either a particle or light.
 ("rec39", "light", 660.52, 668.32, {"s": 660.56}),  # Every particle sits here at its own wavelength, and so does light. Every kind of it, from radio waves up to gamma rays down here.   ("But" left out)
 ("rec39", "gamma", 797.92, 808.86),  # Now here's an interesting question. Remember that line we were following, the density of water line, the line of ordinary stuff, just matter? It crosses the Compton line right here,
 ("rec39", "gamma", 814.24, 816.42),  # right where gamma rays become X-rays.
 ("rec39", "gamma", 819.22, 826.08),  # When a radioactive atom decays into another, it emits a little bit of gamma rays.
 ("rec39", "gamma", 842.86, 851.98, {"s": 842.76}),  # That's because it's converting a little bit of matter into energy, and that energy comes as gamma ray radiation, which is right here.   ("and" before it left out)
 ("rec39", "gamma", 855.56, 857.86),  # That's matter turning into light.
 ("rec39", "end", 896.80, 902.96),    # And light itself can also tell us a very interesting story, about the universe and our place in it.   (the sixth try)
 ("rec39", "end", 908.88, 913.54),    # That's the story of wavelengths of light, which is a great story for the next video.
]
