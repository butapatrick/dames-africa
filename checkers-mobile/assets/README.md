# Assets Required

Add the following image files to this directory before building:

## Required (build will fail without these)

| File | Size | Notes |
|------|------|-------|
| `icon.png` | 1024×1024 | No transparency, no rounded corners (OS applies mask) |
| `adaptive-icon.png` | 1024×1024 | Android adaptive icon foreground |
| `splash.png` | 1284×2778 | Portrait splash screen image |
| `favicon.png` | 48×48 | Web favicon (if building for web) |

## Recommended color: `#1A0A00` (dark earth/background)

## Quick placeholder with ImageMagick (if installed):
```bash
magick -size 1024x1024 xc:#1A0A00 -fill '#F0A500' -font Arial -pointsize 200 -gravity center -annotate 0 '♟' icon.png
magick -size 1024x1024 xc:#1A0A00 -fill '#F0A500' -font Arial -pointsize 200 -gravity center -annotate 0 '♟' adaptive-icon.png
magick -size 1284x2778 xc:#1A0A00 -fill '#F0A500' -font Arial -pointsize 300 -gravity center -annotate 0 'Dames\nAfrica' splash.png
magick -size 48x48 xc:#1A0A00 favicon.png
```

## sounds/ folder
Add MP3 files for sound effects (optional — app works without them):
- `sounds/move.mp3` — short click/slide (< 0.5s)
- `sounds/capture.mp3` — satisfying pop/thud (< 0.5s)  
- `sounds/win.mp3` — victory fanfare (2-3s)

Royalty-free sound sources: freesound.org, zapsplat.com, mixkit.co
