# Dames Africa — Project Memory

## Owner
- **Name:** Buta (butapatrick)
- **Email:** butapatrick@gmail.com
- **Expo account:** butapatrick
- **GitHub repo:** butapatrick/dames-africa

---

## Project Structure
```
1st/
├── checkers-mobile/   → React Native + Expo mobile app (& web via Expo Web)
├── checkers-app/      → Node.js + Socket.io backend server
├── package.json       → Root package pointing to server (for Railway)
├── railway.json       → Railway deployment config
├── Procfile           → Railway start command fallback
└── CLAUDE.md          → This file
```

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Mobile | React Native, Expo SDK 51, TypeScript |
| Web | Expo Web (Metro bundler, static export) |
| Backend | Node.js, Express, Socket.io |
| State | Zustand |
| Navigation | Expo Router (file-based, `app/` directory) |
| i18n | i18next + react-i18next + expo-localization |
| Styling | React Native StyleSheet (African dark theme) |
| Builds | EAS Build (Expo Application Services) |
| Deployment | Railway (server) + Vercel (web) |

---

## Live URLs
- **Railway server:** https://dames-africa-production-1a88.up.railway.app
- **Vercel web app:** *(fill in from Vercel dashboard after first deploy)*
- **Expo builds:** https://expo.dev/accounts/butapatrick/projects/dames-africa
- **GitHub:** https://github.com/butapatrick/dames-africa

---

## App Info
- **App name:** Dames Africa
- **Package (Android & iOS):** `com.masolo.app`
- **Version:** 1.0.0
- **EAS Project ID:** `89c6c3f3-6031-47a0-8750-61ff292bfa9a`
- **Copyright:** © 2026 Buta. All rights reserved.
- **Game:** International Draughts (Jeu de Dames) — 10×10 board, real-time multiplayer

---

## Languages Supported
| Code | Language | Flag | Notes |
|------|----------|------|-------|
| `fr` | Français | 🇫🇷 | **Default** |
| `en` | English | 🇬🇧 | |
| `pt` | Português | 🇵🇹 | Angola, Mozambique |
| `ar` | العربية | 🇸🇦 | RTL layout |
| `sw` | Kiswahili | 🇹🇿 | East Africa |
| `ha` | Hausa | 🇳🇬 | West Africa |
| `es` | Español | 🇪🇸 | |

Auto-detected from device locale on first launch. Saved to AsyncStorage.

---

## Key Files

### Mobile (`checkers-mobile/`)
| File | Purpose |
|------|---------|
| `constants/config.ts` | `SERVER_URL` — reads `EXPO_PUBLIC_SERVER_URL`, falls back to Railway URL |
| `hooks/useSocket.ts` | Socket.io singleton — `initSocket()`, `createRoom()`, `joinRoom()`, `movePiece()` |
| `store/gameStore.ts` | Zustand store — `navState`, `gameState`, `playerRole`, `gameHistory` |
| `app/_layout.tsx` | Root layout — boots i18n, socket, splash screen |
| `app/index.tsx` | Home screen |
| `app/waiting.tsx` | Waiting room (after creating a room) |
| `app/game/[roomCode].tsx` | Game screen |
| `components/Board.tsx` | 10×10 game board |
| `components/GameInfo.tsx` | Turn indicator, timer, scores, resign |
| `components/RoomLobby.tsx` | Home UI — name input, create/join, language selector, history |
| `i18n/index.ts` | i18next setup with 7 locales |
| `i18n/locales/*.json` | Translation files (fr, en, pt, ar, sw, ha, es) |
| `eas.json` | EAS build profiles (preview, production) |
| `vercel.json` | Vercel build config — SPA rewrites, output dir |
| `.env` | Local dev server URL (gitignored) |
| `.env.production` | Railway URL reference (gitignored) |

### Server (`checkers-app/server/`)
| File | Purpose |
|------|---------|
| `index.js` | Express + Socket.io server, binds to `0.0.0.0` |
| `gameLogic.js` | Full International Draughts rules engine |

### Root
| File | Purpose |
|------|---------|
| `package.json` | Root package — `start` script points to server (Railway) |
| `railway.json` | Railway deploy config — start command + health check |
| `Procfile` | Fallback start command for Railway |

---

## Important Commands

### Mobile Builds (run from `checkers-mobile/`)
```powershell
# Preview APK (internal testing)
eas build --platform android --profile preview

# Production AAB (Play Store)
eas build --platform android --profile production

# iOS (requires Apple Developer account)
eas build --platform ios --profile production

# If Git not in PATH (Windows / GitHub Desktop)
$env:PATH = "C:\Users\butap\AppData\Local\GitHubDesktop\app-3.5.10\resources\app\git\cmd;$env:PATH"
eas build --platform android --profile preview
```

### Web Export (run from `checkers-mobile/`)
```powershell
# Build static web app to dist/
$env:NODE_OPTIONS="--max-old-space-size=4096"
npx expo export --platform web

# Dev server (web)
npx expo start --web
```

### Server (local, run from `checkers-app/`)
```powershell
npm start       # or: node server/index.js
```

### Git (GitHub Desktop's bundled git)
```powershell
$git = "C:\Users\butap\AppData\Local\GitHubDesktop\app-3.5.10\resources\app\git\cmd\git.exe"
& $git add .
& $git commit -m "message"
& $git push origin main
```

---

## Environment Variables

### Mobile (Expo)
- `EXPO_PUBLIC_SERVER_URL` — inlined at build time by Expo
- Set in `eas.json` → `env` for cloud builds
- Set in `.env` for local dev

### Server (Railway)
- `PORT` — assigned by Railway automatically
- `CORS_ORIGIN` — defaults to `*` if not set

---

## Deployment

### Server → Railway
- Auto-deploys on push to `main`
- Uses root `package.json` start script: `node checkers-app/server/index.js`
- Health check: `GET /health` → `{ status: "ok" }`
- **Must bind to `0.0.0.0`** (not `localhost`) — already fixed

### Web → Vercel
- Auto-deploys on push to `main`
- Root directory: `checkers-mobile`
- Build command: `NODE_OPTIONS=--max-old-space-size=4096 npx expo export --platform web`
- Output directory: `dist`
- Environment variable to set in Vercel dashboard: `EXPO_PUBLIC_SERVER_URL`

### Mobile → EAS Build
- Manual trigger via `eas build` CLI
- Credentials managed by Expo (remote keystore)
- Preview = internal APK; Production = Play Store AAB

---

## Play Store Status
- **Status:** Not submitted yet
- **Google Play Console:** https://play.google.com/console
- **What's needed:** Production AAB + store listing + screenshots + privacy policy

---

## Known Issues Fixed
| Issue | Fix |
|-------|-----|
| Railway "Application failed to respond" | Server must bind to `0.0.0.0`, not `localhost` |
| Railway can't find server | Root `package.json` + `railway.json` pointing to `checkers-app/server/index.js` |
| Web app "Cannot connect to server" | `SERVER_URL` uses `\|\|` not `??` (catches empty string); hardcoded Railway fallback |
| Web Socket.io connection | `transports: ['polling', 'websocket']` — polling first for proxy compat |
| `expo-haptics` crash on web | All haptic calls guarded with `Platform.OS !== 'web'` |
| Web export OOM crash | `NODE_OPTIONS=--max-old-space-size=4096` before export |
| Git not in PATH (Windows) | Use GitHub Desktop's bundled git binary |

---

## Game Rules (International Draughts)
- 10×10 board, 20 pieces per player
- **Capture is mandatory** — must take if a capture exists
- **Maximum captures required** — must take the longest capture chain
- **Kings move any distance** diagonally (flying kings)
- Recursive capture sequences computed server-side in `gameLogic.js`

---

## Next Steps
1. ✅ Test new APK with 7 languages (build: `ef0edb47`)
2. ⬜ Get Vercel URL and fill it in above
3. ⬜ Run production build for Play Store: `eas build --platform android --profile production`
4. ⬜ Submit to Google Play Console (need store listing + screenshots)
5. ⬜ Add iOS support (Apple Developer account needed — $99/year)
6. ⬜ Consider Amazon Appstore listing (free)
7. ⬜ Add push notifications for async games
