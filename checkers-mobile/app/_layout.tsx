import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { initSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { Colors } from '../constants/colors';
// Importing i18n here ensures it is initialized (synchronously) before any
// child component calls useTranslation().
import '../i18n';
import { getSavedLanguage, changeLanguage } from '../i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { navState, roomCode, loadGameHistory } = useGameStore();

  useEffect(() => {
    const boot = async () => {
      // Restore saved language before the splash screen is removed so the
      // user never sees a language flash.
      const saved = await getSavedLanguage();
      if (saved) await changeLanguage(saved);

      initSocket();
      loadGameHistory();
      SplashScreen.hideAsync();
    };
    boot();
  }, []);

  useEffect(() => {
    if (navState === 'lobby') {
      router.replace('/');
    } else if (navState === 'waiting') {
      router.push('/waiting');
    } else if (navState === 'game' && roomCode) {
      router.replace(`/game/${roomCode}`);
    }
  }, [navState, roomCode]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="waiting" />
        <Stack.Screen name="game/[roomCode]" />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
