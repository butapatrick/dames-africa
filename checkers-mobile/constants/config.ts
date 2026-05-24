import { Platform } from 'react-native';

// Production server — always used when EXPO_PUBLIC_SERVER_URL is not set.
const PROD_URL = 'https://dames-africa-production-1a88.up.railway.app';

// Dev fallback: Android emulator reaches host via 10.0.2.2; iOS/web use localhost.
const DEV_FALLBACK =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3001'
    : 'http://localhost:3001';

// EXPO_PUBLIC_* vars are inlined at build time by Expo.
// Priority: env var (EAS / Vercel build env) → dev fallback in dev → prod URL in prod.
export const SERVER_URL =
  process.env.EXPO_PUBLIC_SERVER_URL ||
  (__DEV__ ? DEV_FALLBACK : PROD_URL);

export const TURN_TIMER_SECONDS = 30;
export const BOARD_SIZE = 10;
export const MAX_HISTORY_ENTRIES = 10;
