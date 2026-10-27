# Web versions of the rendered shorts

Small copies of the full renders for the web (the narration preview page's
"Rendered video" switch): 720×1280, H.264 two-pass, AAC 128k, sized just
under 20 MiB, the claude.ai page's limit per asset. The full 1080×1920
renders stay outside git (iCloud: Projects/triangle/output videos/).

| File | Render | Length | Video bitrate |
|---|---|---|---|
| `short-01-hook.mp4` | 2026-10-26, 12 sub-frames | 1:59 | 1157 kbps |
| `short-02-up-the-line.mp4` | 2026-10-26, 12 sub-frames | 3:59 | 503 kbps |

Encode a render the same way:

```bash
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 render.mp4)
VB=$(python3 -c "print(int(19.5e6*8/$D/1000 - 148))")k
ffmpeg -i render.mp4 -vf scale=720:1280:flags=lanczos -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v $VB -pass 1 -an -f mp4 /dev/null
ffmpeg -i render.mp4 -vf scale=720:1280:flags=lanczos -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -b:v $VB -pass 2 -c:a aac -b:a 128k -movflags +faststart web.mp4
```
