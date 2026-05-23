# Dames Africa — Mobile App

Real-time multiplayer International Draughts (10×10) for Android and iOS.  
Built with **React Native + Expo SDK 51** · **Socket.io** · **Zustand** · **Expo Router**.

---

## Quick Start (Development)

### 1. Install prerequisites
```bash
npm install -g expo-cli eas-cli
```

### 2. Install dependencies
```bash
cd checkers-mobile
npm install
```

### 3. Add required assets
See [assets/README.md](assets/README.md) for placeholder image commands.

### 4. Start the backend server
```bash
cd ../checkers-app
npm install
node server/index.js   # runs on port 3001
```

### 5. Run the mobile app
```bash
cd ../checkers-mobile
npx expo start
```

Press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with **Expo Go**.

> **Android emulator:** The server URL is pre-configured to `http://10.0.2.2:3001` (Android maps localhost → 10.0.2.2).  
> **iOS simulator:** Uses `http://localhost:3001` automatically.  
> **Physical device:** Temporarily change `DEV_URL` in `constants/config.ts` to your machine's LAN IP (e.g., `http://192.168.1.X:3001`).

---

## Project Structure

```
checkers-mobile/
├── app/
│   ├── _layout.tsx          # Root layout — socket init, navigation driver
│   ├── index.tsx            # Home / Lobby screen
│   ├── waiting.tsx          # Waiting room (share room code)
│   └── game/
│       └── [roomCode].tsx   # Game screen (board + modals)
├── components/
│   ├── Board.tsx            # 10×10 board, touch handling, flip for P2
│   ├── Cell.tsx             # Single cell (dark/light, piece, move dots)
│   ├── Piece.tsx            # Piece with king crown, selection glow
│   ├── GameInfo.tsx         # Score panel, turn indicator, timer
│   └── RoomLobby.tsx        # Create/join form + game history
├── hooks/
│   └── useSocket.ts         # Socket.io singleton + event init
├── store/
│   └── gameStore.ts         # Zustand global state
├── constants/
│   ├── colors.ts            # African-inspired dark theme palette
│   ├── config.ts            # Server URL, timer duration
│   └── gameRules.ts         # Rules text for display
├── assets/                  # Images & sounds (see assets/README.md)
├── app.json                 # Expo config
└── eas.json                 # EAS Build config
```

---

## Deploy Backend to Railway

### 1. Push server to GitHub (or use Railway CLI)
```bash
cd checkers-app
git init && git add . && git commit -m "Initial server"
```

### 2. Create Railway project
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Or connect via [railway.app](https://railway.app) dashboard → New Project → Deploy from GitHub.

### 3. Update mobile app URL
In `constants/config.ts`, replace the production URL:
```typescript
export const SERVER_URL = __DEV__
  ? DEV_URL
  : 'https://YOUR-APP.railway.app'; // ← paste your Railway URL here
```

---

## Build for Stores

### Setup EAS
```bash
expo login          # or eas login
eas build:configure
```

### Android — Test APK (sideload for testers)
```bash
eas build --platform android --profile preview
```
Downloads an `.apk` you can install directly on any Android device.

### Android — Production AAB (for Play Store)
```bash
eas build --platform android --profile production
```
Uploads the signed `.aab` to EAS. Download and upload to Google Play Console.

### iOS — Production IPA (for App Store)
```bash
eas build --platform ios --profile production
```
Requires an Apple Developer account. EAS handles signing.

---

## Play Store Listing

### Short Description (80 chars)
```
Play International Draughts 10x10 with friends in real-time!
```

### Short Description (FR)
```
Jouez aux dames internationales 10x10 avec vos amis en temps réel !
```

### Full Description (EN)
```
Dames Africa brings the beloved game of International Draughts to your phone!

Challenge your friends anywhere in the world with real-time multiplayer:
• Create a room and share the 6-character code
• Your friend joins instantly with the code
• Play the full 10×10 board with all official rules

OFFICIAL RULES:
✓ 20 pieces per player on a 10×10 board
✓ Normal pieces move forward diagonally
✓ Kings move any distance in all 4 directions
✓ Capturing is mandatory
✓ Maximum capture rule enforced
✓ Reach the back row to become a King

FEATURES:
✓ Real-time multiplayer via Socket.io
✓ Haptic feedback on moves and captures
✓ 30-second turn timer
✓ Score tracker across rematches
✓ Game history saved locally
✓ Beautiful African-inspired design
✓ Works on Android and iOS

No account needed. No ads. Just great checkers.
```

### Full Description (FR)
```
Dames Africa apporte le jeu de dames international sur votre téléphone !

Défiez vos amis partout dans le monde en multijoueur en temps réel :
• Créez une salle et partagez le code à 6 caractères
• Votre ami rejoint instantanément avec le code
• Jouez sur le plateau 10×10 officiel avec toutes les règles

RÈGLES OFFICIELLES :
✓ 20 pièces par joueur sur un plateau 10×10
✓ Les pièces normales se déplacent en diagonale vers l'avant
✓ Les dames se déplacent à n'importe quelle distance dans les 4 directions
✓ La prise est obligatoire
✓ La règle de prise maximale est appliquée
✓ Atteignez la dernière rangée pour devenir une dame

FONCTIONNALITÉS :
✓ Multijoueur en temps réel via Socket.io
✓ Retour haptique lors des déplacements et prises
✓ Minuterie de 30 secondes par tour
✓ Suivi des scores à travers les revanches
✓ Historique des parties sauvegardé localement
✓ Magnifique design d'inspiration africaine
✓ Fonctionne sur Android et iOS

Aucun compte nécessaire. Sans publicités.
```

---

## Store Assets Required

| Asset | Size | Format |
|-------|------|--------|
| App icon | 1024×1024 | PNG, no transparency |
| Feature graphic (Play Store) | 1024×500 | PNG |
| Phone screenshots | 1080×1920 (min 4) | PNG/JPG |

Screenshot suggestions:
1. Home/lobby screen with app name
2. Waiting screen showing room code
3. Active game (mid-move with highlighted cells)
4. Game over modal showing winner

---

## Content Rating
- **Google Play:** Everyone (no violence, no ads, no purchases)
- **Apple App Store:** 4+ (no objectionable content)

---

## Technical Notes

- **Minimum Android:** API 24 (Android 7.0 Nougat)
- **Minimum iOS:** 13.0
- **Target SDK:** 34
- **Orientation:** Portrait locked
- **State management:** Zustand (no Redux)
- **Navigation:** Expo Router (file-based, like Next.js)
- **Real-time:** Socket.io-client 4.x
- **Haptics:** expo-haptics (medium impact on move, heavy on capture, success on win)
- **Board flip:** Player 2 always sees their pieces at the bottom

## Privacy Policy
You need a privacy policy URL to publish. Free options:
- [privacypolicygenerator.info](https://www.privacypolicygenerator.info)
- [app-privacy-policy-generator.firebaseapp.com](https://app-privacy-policy-generator.firebaseapp.com)

This app collects **no personal data**. Player names are only stored in-memory on the server and never persisted. Game history is stored locally on the device only.
