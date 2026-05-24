import { Platform } from 'react-native';

// Fallback used only when EXPO_PUBLIC_SERVER_URL is not set in .env / EAS secrets.
const DEV_FALLBACK =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3001'   // Android emulator → host machine
    : 'http://localhost:3001';  // iOS simulator → host machine

// EXPO_PUBLIC_* vars are inlined at build time by Expo.
// Set EXPO_PUBLIC_SERVER_URL in:
//   • .env              → local dev (expo start)
//   • .env.production   → local reference only
//   • eas.json env      → EAS cloud builds (preview + production)
export const SERVER_URL =
  process.env.EXPO_PUBLIC_SERVER_URL ??
  (__DEV__ ? DEV_FALLBACK : '');

export const TURN_TIMER_SECONDS = 30;
export const BOARD_SIZE = 10;
export const MAX_HISTORY_ENTRIES = 10;
