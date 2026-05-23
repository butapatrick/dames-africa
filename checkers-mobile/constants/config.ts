import { Platform } from 'react-native';

// On Android emulator, localhost = the emulator itself. Host machine is at 10.0.2.2.
// On iOS simulator, localhost works fine.
const DEV_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:3001'
    : 'http://localhost:3001';

// Replace with your deployed server URL (Railway / Render / Fly.io) before publishing.
export const SERVER_URL = __DEV__
  ? DEV_URL
  : 'https://dames-africa-server.railway.app';

export const TURN_TIMER_SECONDS = 30;
export const BOARD_SIZE = 10;
export const MAX_HISTORY_ENTRIES = 10;
