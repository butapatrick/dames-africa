import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Haptics from 'expo-haptics';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { initSocket } from '../hooks/useSocket';
import { useGameStore } from '../store/gameStore';
import { Colors } from '../constants/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { navState, roomCode, loadGameHistory } = useGameStore();

  // Initialize socket listeners once at app startup
  useEffect(() => {
    initSocket();
    loadGameHistory();
    SplashScreen.hideAsync();
  }, []);

  // Drive navigation from Zustand navState so socket events can trigger navigation
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
