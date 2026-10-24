# Illustration provenance — 24 October 2026

This inventory covers all 47 images in today’s gallery. Photo-guided AI images are not photographs, even when their forms are constrained by real observations. The generation JSON beside each master preserves the prompt, sources and processing history.

| Image | Production method | Record |
|---|---|---|
| stonehenge | ai-generated | [record](../content/icons/src/stonehenge-generation.json) |
| 16-psyche | ai-generated | [record](../content/icons/src/16-psyche-generation.json) |
| 21-lutetia | photo-guided-ai | [record](../content/icons/src/21-lutetia-generation.json) |
| 253-mathilde | photo-ai-reconstruction | [record](../content/icons/src/253-mathilde-generation.json) |
| 55-cnc-e | ai-generated | [record](../content/icons/src/55-cnc-e-generation.json) |
| amalthea | photo-guided-ai | [record](../content/icons/src/amalthea-generation.json) |
| ariel | photo-adjusted | [record](../content/icons/src/ariel-generation.json) |
| benben-saxum-bennu | photo-guided-ai | [record](../content/icons/src/benben-saxum-bennu-generation.json) |
| big-rock-okotoks | photo-guided-ai | [record](../content/icons/src/big-rock-okotoks-generation.json) |
| charon | photo-adjusted | [record](../content/icons/src/charon-generation.json) |
| colosseum | photo-guided-ai | [record](../content/icons/src/colosseum-generation.json) |
| comet-67p | photo-guided-ai | [record](../content/icons/src/comet-67p-generation.json) |
| crater-lake | photo-guided-ai | [record](../content/icons/src/crater-lake-generation.json) |
| devils-tower | photo-guided-ai | [record](../content/icons/src/devils-tower-generation.json) |
| didymos | photo-guided-ai | [record](../content/icons/src/didymos-generation.json) |
| dinkinesh | photo-guided-ai | [record](../content/icons/src/dinkinesh-generation.json) |
| dione | photo-adjusted | [record](../content/icons/src/dione-generation.json) |
| gaspra | photo-ai-reconstruction | [record](../content/icons/src/gaspra-generation.json) |
| great-salt-lake | ai-generated | [record](../content/icons/src/great-salt-lake-generation.json) |
| iapetus | photo-adjusted | [record](../content/icons/src/iapetus-generation.json) |
| ida | photo-ai-reconstruction | [record](../content/icons/src/ida-generation.json) |
| k2-18-b | ai-generated | [record](../content/icons/src/k2-18-b-generation.json) |
| kelt-9-b | ai-generated | [record](../content/icons/src/kelt-9-b-generation.json) |
| lake-erie | ai-generated | [record](../content/icons/src/lake-erie-generation.json) |
| lake-geneva | ai-generated | [record](../content/icons/src/lake-geneva-generation.json) |
| lake-tanganyika | ai-generated | [record](../content/icons/src/lake-tanganyika-generation.json) |
| miranda | photo-adjusted | [record](../content/icons/src/miranda-generation.json) |
| morro-do-pai-inacio | photo-guided-ai | [record](../content/icons/src/morro-do-pai-inacio-generation.json) |
| nix | photo-guided-ai | [record](../content/icons/src/nix-generation.json) |
| oberon | photo-adjusted | [record](../content/icons/src/oberon-generation.json) |
| paro-moai | photo-guided-ai | [record](../content/icons/src/paro-moai-generation.json) |
| peekskill | photo-guided-ai | [record](../content/icons/src/peekskill-generation.json) |
| phoebe | photo-ai-reconstruction | [record](../content/icons/src/phoebe-generation.json) |
| rhea | photo-adjusted | [record](../content/icons/src/rhea-generation.json) |
| ryugu | photo-guided-ai | [record](../content/icons/src/ryugu-generation.json) |
| stone-of-the-pregnant-woman | photo-guided-ai | [record](../content/icons/src/stone-of-the-pregnant-woman-generation.json) |
| sylacauga-meteorite | photo-guided-ai | [record](../content/icons/src/sylacauga-meteorite-generation.json) |
| tethys | photo-adjusted | [record](../content/icons/src/tethys-generation.json) |
| titania | photo-adjusted | [record](../content/icons/src/titania-generation.json) |
| totem-pole-monument-valley | photo-guided-ai | [record](../content/icons/src/totem-pole-monument-valley-generation.json) |
| trappist-1-e | ai-generated | [record](../content/icons/src/trappist-1-e-generation.json) |
| uluru | photo-guided-ai | [record](../content/icons/src/uluru-generation.json) |
| umbriel | photo-adjusted | [record](../content/icons/src/umbriel-generation.json) |
| vatnajokull | photo-guided-ai | [record](../content/icons/src/vatnajokull-generation.json) |
| wasp-12-b | ai-generated | [record](../content/icons/src/wasp-12-b-generation.json) |
| wasp-39-b | ai-generated | [record](../content/icons/src/wasp-39-b-generation.json) |
| west-mitten-butte | photo-guided-ai | [record](../content/icons/src/west-mitten-butte-generation.json) |

## Method definitions

- **photo-adjusted:** mission-photo pixels processed by scripts, no generative fill.
- **photo-ai-reconstruction:** mission-photo-guided AI completion of missing dark sides; hidden terrain is inferred.
- **photo-guided-ai:** a new AI rendering constrained by reference photographs; not an enhanced observational image.
- **ai-generated:** artist interpretation, optionally constrained by geographic outlines or other artwork. Exoplanet surface and cloud patterns are imagined.

## Consistent planet lighting

The six new exoplanets use a separately saved unshaded albedo disc multiplied by `content/icons/src/sphere template.png` at full strength using `scripts/multiply-kepler-sphere.mjs`. The albedo is AI-generated, the final lighting is deterministic. This is surface shading, separate from the cast wall shadow. Existing photo-based moons retain their documented photo-processing methods.

55 Cancri e’s lava emission may need a separate artistic pass after review; the standard multiply pass intentionally does not add emission. Its inferred magma ocean and possible volatile atmosphere do not provide a resolved surface map. [NASA science background](https://science.nasa.gov/missions/webb/nasas-webb-hints-at-possible-atmosphere-surrounding-rocky-exoplanet/).

Stonehenge uses an AI-generated object and a separate crisp black overhead silhouette (`content/icons/studies/stonehenge/overhead-silhouette.png`). The scripted projection stretches that mask 1.9× along NW–SE, progressively blurs it from 1.5 to 42 pixels on the 768px canvas, and fades opacity toward SE. The source is a silhouette, not a pre-softened generated shadow. Rebuild with `scripts/install-stonehenge-shadow.mjs`; compare against the shared sphere and Uluru in `tools/stone-shadow-comparison.html`.

## Space image visibility priority

`src/space-image-priority.js` ranks documented space photographs and scripted photo adjustments before unknown provenance, then generated art (including photo-guided AI and AI reconstructions). Current per-image provenance overrides legacy credits in `content/icons/space-image-priority.json`; original NASA credits do not make a subsequently generated replacement a photograph. New space artwork must receive a provenance entry or an explicit legacy-list update. Editorial order remains the tie-breaker within a tier. Both featured and catalogue icon selection apply the tiers; catalogue photographs reserve space before generated featured icons. Explicit focus/narration picture requests retain their existing forced-display behavior.
