# Powers-of-ten foreground workflow

The user approved the matched sharp-layer handoff on 2026-10-30 and explicitly
asked that it be used whenever this zoom encounters a foreground object.

Follow [the foreground layer workflow](../../video/powers-of-ten/FOREGROUND-LAYERS.md).
Build sharp, registered foreground/background planes first. Derive the flat
parent centre from their exact composite. Keep position, scale, blur and relative
zoom locked during replacement. Start app-controlled parallax/blur only after
the replacement is complete. Do not fade away a lower branch just because a
transparent finer image spans the frame; only actual opaque coverage replaces it.
Preserve physical sizes and record world spans/target coordinates. Keep assets
and prompts versioned. Near flybys remain opaque and exit through the frame.
