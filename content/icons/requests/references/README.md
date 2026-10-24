# Reference photos for the picture requests

Real photos for Gepetto (the image-generation session) to draw from, for objects whose photo
can't be used as the picture itself: landmarks shot in a landscape, or space rocks whose photo
is too blurry, half-lit or noisy to cut out (`scripts/compose-real-body.py` handles the ones
that can). They are references for shape, colour and proportions only; the pictures follow the
house style in `../fill-the-gaps.md` (isolated, no ground or background, lit from the upper
left). Each request names its reference in its "Reference photo" column.

Downscaled to at most 1600 px. Licences as on Commons; CC BY / BY-SA photos need their credit
kept if one is ever shown as is.

| File | Source | Author | Licence |
|---|---|---|---|
| `big-rock-okotoks.jpg` | [Okotoks Erratic (37069018896).jpg](https://commons.wikimedia.org/wiki/File:Okotoks_Erratic_(37069018896).jpg) | Thank you for visiting my page from Canada (Flickr) | CC BY 2.0 |
| `colosseum.jpg` | [Colosseum of Rome and Roman forum.jpg](https://commons.wikimedia.org/wiki/File:Colosseum_of_Rome_and_Roman_forum.jpg) | Wilfredor | CC0 |
| `devils-tower.jpg` | [Devils Tower under a giant cumulonimbus, seen from Wyoming Highway 24, 2009.jpg](https://commons.wikimedia.org/wiki/File:Devils_Tower_under_a_giant_cumulonimbus,_seen_from_Wyoming_Highway_24,_2009.jpg) | DimiTalen | CC0 |
| `morro-do-pai-inacio.jpg` | [Morro do Pai Inácio 2015.jpg](https://commons.wikimedia.org/wiki/File:Morro_do_Pai_Inácio_2015.jpg) | Anne Moraes | CC BY-SA 3.0 |
| `paro-moai.jpg` | [Moai Paro 1.jpg](https://commons.wikimedia.org/wiki/File:Moai_Paro_1.jpg) | Jorge Morales Piderit | CC0 |
| `stone-of-the-pregnant-woman.jpg` | [Stone of the Pregnant Woman in Baalbek, Beirut.jpg](https://commons.wikimedia.org/wiki/File:Stone_of_the_Pregnant_Woman_in_Baalbek,_Beirut.jpg) | Choinowski | CC BY-SA 4.0 |
| `sylacauga-meteorite.jpg` | [2024-10-21 - Tuscaloosa, AL, USA - Hodges (Sylacauga) Meteorite (cropped).jpg](https://commons.wikimedia.org/wiki/File:2024-10-21_-_Tuscaloosa,_AL,_USA_-_Hodges_(Sylacauga)_Meteorite_(cropped).jpg) | Kai NeSmith | CC BY 4.0 |
| `totem-pole-monument-valley.jpg` | [Totem Pole, Monument Valley (15633047928).jpg](https://commons.wikimedia.org/wiki/File:Totem_Pole,_Monument_Valley_(15633047928).jpg) | Andy  Morffew from Itchen Abbas, Hampshire, UK | CC BY 2.0 |
| `west-mitten-butte.jpg` | [West Mitten Butte, East Mitten Butte, and Merrick Butte (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:West_Mitten_Butte,_East_Mitten_Butte,_and_Merrick_Butte_(Unsplash).jpg) | Jasper van der Meij jaspervandermeij | CC0 |
| `uluru.jpg` | [Uluru (Helicopter view)-crop.jpg](https://commons.wikimedia.org/wiki/File:Uluru_(Helicopter_view)-crop.jpg) | see Commons page | Public domain |
| `nix.jpg` | Pluto's Moon Nix, Half Illuminated (PIA20287) | NASA/JHU APL/SwRI (New Horizons) | Public domain |
| `didymos.jpg` | Didymos from DART DRACO | NASA/JHU APL (DART) | Public domain |
| `amalthea.jpg` | Bright Streak on Amalthea (PIA02532) | NASA/JPL/Cornell (Galileo) | Public domain |
| `phoebe.jpg` | [Phoebe cassini full.jpg](https://commons.wikimedia.org/wiki/File:Phoebe_cassini_full.jpg) | NASA/JPL/Space Science Institute (Cassini) | Public domain |
| `253-mathilde.jpg` | [253 Mathilde NASA.png](https://commons.wikimedia.org/wiki/File:253_Mathilde_NASA.png) | NASA/JHU APL (NEAR Shoemaker) | Public domain |
| `gaspra.jpg` | [Galileo Gaspra Mosaic.jpg](https://commons.wikimedia.org/wiki/File:Galileo_Gaspra_Mosaic.jpg) | NASA/JPL (Galileo) | Public domain |
| `ida.jpg` | [243 ida.jpg](https://commons.wikimedia.org/wiki/File:243_ida.jpg) | NASA/JPL (Galileo) | Public domain |

## Additional macro references (2026-10-24)

- `stonehenge.jpg`: [Stonehenge2007 07 30](https://commons.wikimedia.org/wiki/File:Stonehenge2007_07_30.jpg), garethwiscombe, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/). Used to generate an isolated, relit illustration of the surviving stones; original photograph retained here with attribution.

- `peekskill.jpg`: [NASA APOD, The Car, the Hole, and the Peekskill Meteorite](https://science.nasa.gov/image-article/apod-2006-november-19-the-car-the-hole-and-the-peekskill-meteorite/), original `peekskill_thomas_big.jpg`. Used for the stone at the bottom of the photo, not the car. Reference only; retain the original source credit when reproducing the photo.
- `crater-lake.jpg`: [Aerial Crater Lake](https://commons.wikimedia.org/wiki/File:Aerial_Crater_Lake.jpg), Mike Doukas / USGS, 2005, public domain. Photograph looks east from the west; illustration is reoriented north up.
- `iceland-from-space.png`: [Iceland from space](https://commons.wikimedia.org/wiki/File:Iceland-from-space.png), used for the outline of the southeastern Vatnajökull ice cap only. See source page for attribution.
- `vatnajokull.png`: [Vatnajökull National Park](https://www.vatnajokulsthjodgardur.is/en/melting-glaciers/vatnajokullglacier), glacier texture reference only; not an overhead outline.
- Geneva, Erie, Tanganyika and Great Salt Lake use Natural Earth public-domain geographic outlines saved in `content/icons/refresh-2026-10-22/outlines/` (GeoJSON, SVG and PNG). These are generalized mapped shorelines, not current water-level surveys.

Generated illustration prompts and exact input paths are saved beside each master in `content/icons/src/*-generation.json` and in `docs/macro-request-batch.json`. All images were made with the built-in image generation tool; shadows use the existing long-shadow renderer, with the approved caustic texture for lakes. Paro is an interpretive upright reconstruction from the fallen statue reference.

## Additional space references (2026-10-24)

- `dinkinesh.png`: [Lucy first look](https://www.nasa.gov/image-article/nasas-lucy-spacecraft-discovers-2nd-asteroid-during-dinkinesh-flyby/), NASA/Goddard/SwRI/Johns Hopkins APL/NOIRLab. Primary body only; satellite excluded from illustration.
- `benben-features.png`: [Bennu named features](https://www.nasa.gov/missions/first-official-names-given-to-features-on-asteroid-bennu/), NASA/Goddard/University of Arizona. Benben's labeled boulder is the reference, not the surrounding surface.
- `21-lutetia.jpg`: [Rosetta Lutetia sequence](https://www.esa.int/ESA_Multimedia/Images/2010/07/Asteroid_Lutetia2), ESA/OSIRIS team. Four-view reference only; illustration uses one complete body.
- `comet-67p.jpg`: [Comet cliffs](https://www.esa.int/ESA_Multimedia/Images/2016/07/Comet_cliffs), ESA/Rosetta/NavCam, CC BY-SA IGO 3.0. Texture reference.
- `comet-67p-whole.jpg`: [CometWatch 15 August](https://blogs.esa.int/rosetta/2014/08/16/cometwatch-15-august/), ESA/Rosetta/NavCam. Shape reference; consult source's reuse terms for the photograph.
- `ryugu.jpg`: [Ryugu with north polar boulder](https://www.esa.int/ESA_Multimedia/Images/2019/02/Asteroid_Ryugu_with_north_polar_boulder), JAXA/U. Tokyo/Kochi U./Rikkyo U./Nagoya U./Chiba Inst. Tech./Meiji U./U. Aizu/AIST. Reference only.

The provided `didymos.jpg` appears to depict Dimorphos. It was used for texture only; Didymos follows the spinning-top shape specified in the request and [NASA's description](https://science.nasa.gov/solar-system/asteroids/didymos/). Exoplanets and Psyche are artist interpretations. Unresolved detail and hidden surfaces in other generated images are inferred, not new observational evidence.
