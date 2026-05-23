/**
 * Generates all required Expo/Play Store image assets using Sharp + inline SVG.
 * Run once: node scripts/generate-assets.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ASSETS = path.join(__dirname, '..', 'assets');

// ── Design tokens ────────────────────────────────────────────────────────────
const BG      = '#1A0A00';   // Deep earth background
const GOLD    = '#F0A500';   // Kente gold
const GOLD_DK = '#C07800';   // Darker gold for depth
const RED_DK  = '#8B1A1A';   // Player-1 deep red
const RED     = '#B22222';   // Player-1 mid-red
const RED_BD  = '#4A0E0E';   // Player-1 border
const CREAM   = '#FFF8E7';   // Player-2 cream
const CREAM_BD= '#C8A87A';   // Player-2 border

// ── SVG helpers ──────────────────────────────────────────────────────────────

/** Generates the main icon SVG at the given size */
function iconSVG(size) {
  const cx = size / 2;
  const cy = size / 2;
  const ring = size * 0.455;
  const ringW = size * 0.028;
  // Two overlapping checkers pieces
  const r = size * 0.19;   // piece radius
  const p1x = cx - r * 0.8;
  const p1y = cy + size * 0.02;
  const p2x = cx + r * 0.8;
  const p2y = cy + size * 0.02;
  const shine = r * 0.32;

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${BG}"/>

  <!-- Outer decorative ring -->
  <circle cx="${cx}" cy="${cy}" r="${ring}" fill="none"
          stroke="${GOLD}" stroke-width="${ringW}" opacity="0.9"/>

  <!-- Faint inner glow -->
  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.12"/>
    <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
  </radialGradient>
  <circle cx="${cx}" cy="${cy}" r="${ring * 0.9}" fill="url(#glow)"/>

  <!-- Decorative kente corner accents -->
  ${kente(size * 0.08, size * 0.08, size * 0.07, GOLD)}
  ${kente(size - size * 0.08, size * 0.08, size * 0.07, GOLD, true)}
  ${kente(size * 0.08, size - size * 0.08, size * 0.07, GOLD, false, true)}
  ${kente(size - size * 0.08, size - size * 0.08, size * 0.07, GOLD, true, true)}

  <!-- Player-1 piece (dark red, behind) -->
  <circle cx="${p1x}" cy="${p1y}" r="${r}" fill="${RED_BD}" />
  <circle cx="${p1x}" cy="${p1y}" r="${r * 0.88}" fill="${RED_DK}" />
  <circle cx="${p1x}" cy="${p1y}" r="${r * 0.78}" fill="${RED}" />
  <!-- P1 shine -->
  <ellipse cx="${p1x - r * 0.25}" cy="${p1y - r * 0.28}" rx="${shine}" ry="${shine * 0.6}"
           fill="white" opacity="0.15"/>

  <!-- Player-2 piece (cream, in front) -->
  <circle cx="${p2x}" cy="${p2y}" r="${r}" fill="${CREAM_BD}" />
  <circle cx="${p2x}" cy="${p2y}" r="${r * 0.88}" fill="#D2B48C" />
  <circle cx="${p2x}" cy="${p2y}" r="${r * 0.78}" fill="${CREAM}" />
  <!-- P2 shine -->
  <ellipse cx="${p2x - r * 0.25}" cy="${p2y - r * 0.28}" rx="${shine}" ry="${shine * 0.6}"
           fill="white" opacity="0.45"/>

  <!-- Gold crown on each piece -->
  <text x="${p1x}" y="${p1y + r * 0.22}" text-anchor="middle" font-size="${r * 0.75}"
        fill="${GOLD}" font-family="serif" opacity="0.95">♛</text>
  <text x="${p2x}" y="${p2y + r * 0.22}" text-anchor="middle" font-size="${r * 0.75}"
        fill="${GOLD_DK}" font-family="serif" opacity="0.95">♛</text>

  <!-- "DA" monogram above pieces -->
  <text x="${cx}" y="${cy - ring * 0.52}" text-anchor="middle"
        font-size="${size * 0.085}" font-weight="900" letter-spacing="${size * 0.012}"
        fill="${GOLD}" font-family="Arial, sans-serif">DAMES</text>

  <!-- Subtitle below -->
  <text x="${cx}" y="${cy + ring * 0.62}" text-anchor="middle"
        font-size="${size * 0.045}" font-weight="600" letter-spacing="${size * 0.006}"
        fill="${GOLD}" opacity="0.7" font-family="Arial, sans-serif">AFRICA</text>
</svg>`;
}

/** Small kente-inspired diamond accent */
function kente(x, y, size, color, flipX = false, flipY = false) {
  const s = size;
  const fx = flipX ? -1 : 1;
  const fy = flipY ? -1 : 1;
  return `<g transform="translate(${x},${y})">
    <polygon points="0,${-s*fy} ${s*fx},0 0,${s*fy} ${-s*fx},0"
             fill="${color}" opacity="0.35"/>
    <polygon points="0,${-s*0.5*fy} ${s*0.5*fx},0 0,${s*0.5*fy} ${-s*0.5*fx},0"
             fill="${color}" opacity="0.6"/>
  </g>`;
}

/** Splash screen SVG — logo centered on dark background */
function splashSVG(w, h) {
  const cx = w / 2;
  const cy = h / 2;
  // Embed a scaled version of the icon centered
  const iconSize = Math.min(w, h) * 0.45;
  const ix = cx - iconSize / 2;
  const iy = cy - iconSize / 2;

  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="${BG}"/>

  <!-- Subtle radial glow in background -->
  <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.06"/>
    <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
  </radialGradient>
  <rect width="${w}" height="${h}" fill="url(#bgGlow)"/>

  <!-- Embedded icon (nested SVG) -->
  <svg x="${ix}" y="${iy}" width="${iconSize}" height="${iconSize}">
    ${iconSVG(iconSize).replace(/<svg[^>]*>|<\/svg>/g, '')}
  </svg>

  <!-- App name below icon -->
  <text x="${cx}" y="${cy + iconSize * 0.62}" text-anchor="middle"
        font-size="${w * 0.07}" font-weight="900" letter-spacing="${w * 0.008}"
        fill="${GOLD}" font-family="Arial, sans-serif">DAMES AFRICA</text>
  <text x="${cx}" y="${cy + iconSize * 0.74}" text-anchor="middle"
        font-size="${w * 0.032}" font-weight="500" letter-spacing="${w * 0.004}"
        fill="${GOLD}" opacity="0.55" font-family="Arial, sans-serif">International Draughts 10×10</text>
</svg>`;
}

/** Favicon SVG — just the two pieces, no text */
function faviconSVG(size) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.22;
  const p1x = cx - r * 0.55, p1y = cy + r * 0.1;
  const p2x = cx + r * 0.55, p2y = cy + r * 0.1;
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${BG}" rx="${size * 0.15}"/>
  <circle cx="${p1x}" cy="${p1y}" r="${r}" fill="${RED_BD}"/>
  <circle cx="${p1x}" cy="${p1y}" r="${r * 0.82}" fill="${RED}"/>
  <circle cx="${p2x}" cy="${p2y}" r="${r}" fill="${CREAM_BD}"/>
  <circle cx="${p2x}" cy="${p2y}" r="${r * 0.82}" fill="${CREAM}"/>
</svg>`;
}

// ── Generators ───────────────────────────────────────────────────────────────

async function gen(filename, svgString, width, height) {
  const outPath = path.join(ASSETS, filename);
  await sharp(Buffer.from(svgString), { density: 300 })
    .resize(width, height)
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  const { size } = fs.statSync(outPath);
  console.log(`✓ ${filename.padEnd(22)} ${width}×${height}  (${(size / 1024).toFixed(0)} KB)`);
}

async function main() {
  console.log('\nGenerating Dames Africa assets...\n');

  await gen('icon.png',          iconSVG(1024),           1024, 1024);
  await gen('adaptive-icon.png', iconSVG(1024),           1024, 1024);
  await gen('splash.png',        splashSVG(1284, 2778),   1284, 2778);
  await gen('favicon.png',       faviconSVG(48),            48,   48);

  console.log('\nAll assets generated in ./assets/');
  console.log('Next step: npx expo start  (or: eas build --platform android --profile preview)\n');
}

main().catch(err => { console.error(err); process.exit(1); });
