import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useGameStore } from '../store/gameStore';
import { reconnectSocket, initSocket } from '../hooks/useSocket';
import { Colors } from '../constants/colors';

export default function WaitingScreen() {
  const { roomCode, playerName, reset } = useGameStore();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my Dames Africa game! Room code: ${roomCode}\nDownload the app and enter this code to play.`,
        title: 'Join my Dames Africa game',
      });
    } catch {}
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(roomCode);
  };

  const handleCancel = () => {
    reconnectSocket();
    initSocket();
    reset();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.title}>Room Created!</Text>
        <Text style={styles.subtitle}>Share this code with your opponent</Text>

        {/* Big room code */}
        <Pressable style={styles.codeCard} onPress={handleCopy}>
          <Text style={styles.codeText}>{roomCode}</Text>
          <Text style={styles.codeTap}>Tap to copy</Text>
        </Pressable>

        {/* Waiting indicator */}
        <View style={styles.waitingRow}>
          <ActivityIndicator size="small" color={Colors.gold} />
          <Text style={styles.waitingText}>Waiting for opponent to join…</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Pressable style={styles.btnShare} onPress={handleShare}>
            <Text style={styles.btnShareText}>Share Code</Text>
          </Pressable>
          <Pressable style={styles.btnCancel} onPress={handleCancel}>
            <Text style={styles.btnCancelText}>Cancel</Text>
          </Pressable>
        </View>

        {/* How to join instruction */}
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>
            Your opponent should open Dames Africa, tap <Text style={styles.bold}>Join Game</Text>, and enter code{' '}
            <Text style={styles.codeInline}>{roomCode}</Text>.
          </Text>
        </View>

        <Text style={styles.yourName}>Playing as: {playerName}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  codeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gold,
    borderStyle: 'dashed',
    paddingHorizontal: 36,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 6,
    shadowColor: Colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  codeText: {
    fontSize: 48,
    fontWeight: '900',
    fontFamily: 'monospace',
    color: Colors.gold,
    letterSpacing: 10,
  },
  codeTap: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  waitingText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  buttons: {
    width: '100%',
    gap: 10,
  },
  btnShare: {
    backgroundColor: Colors.gold,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnShareText: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '800',
  },
  btnCancel: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnCancelText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  instructionBox: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    width: '100%',
  },
  instructionText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  bold: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  codeInline: {
    fontFamily: 'monospace',
    fontWeight: '800',
    color: Colors.gold,
    letterSpacing: 2,
  },
  yourName: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
