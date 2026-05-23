import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
} from 'react-native';
import { Colors } from '../constants/colors';
import type { GameRecord } from '../store/gameStore';

interface Props {
  playerName: string;
  onPlayerNameChange: (n: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  error: string;
  history: GameRecord[];
}

export default function RoomLobby({
  playerName,
  onPlayerNameChange,
  onCreateRoom,
  onJoinRoom,
  error,
  history,
}: Props) {
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [roomCode, setRoomCode] = useState('');

  const handleJoin = () => {
    if (roomCode.trim().length === 6) onJoinRoom(roomCode.trim().toUpperCase());
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={[styles.logoPiece, { backgroundColor: Colors.piece1 }]} />
            <View style={[styles.logoPiece, { backgroundColor: Colors.piece2 }]} />
          </View>
          <Text style={styles.appName}>Dames Africa</Text>
          <Text style={styles.appSubtitle}>International Draughts 10×10</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Name input always visible */}
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor={Colors.textMuted}
            value={playerName}
            onChangeText={onPlayerNameChange}
            maxLength={20}
            returnKeyType="done"
          />

          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {mode === 'home' && (
            <View style={styles.buttonGroup}>
              <Pressable
                style={[styles.btn, styles.btnPrimary, !playerName.trim() && styles.btnDisabled]}
                onPress={() => playerName.trim() && setMode('create')}
              >
                <Text style={styles.btnPrimaryText}>Create Game</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnSecondary, !playerName.trim() && styles.btnDisabled]}
                onPress={() => playerName.trim() && setMode('join')}
              >
                <Text style={styles.btnSecondaryText}>Join Game</Text>
              </Pressable>
            </View>
          )}

          {mode === 'create' && (
            <View style={styles.buttonGroup}>
              <Text style={styles.modeHint}>
                A 6-character room code will be generated for you to share.
              </Text>
              <Pressable
                style={[styles.btn, styles.btnPrimary]}
                onPress={onCreateRoom}
              >
                <Text style={styles.btnPrimaryText}>Create Room</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => setMode('home')}>
                <Text style={styles.btnGhostText}>Back</Text>
              </Pressable>
            </View>
          )}

          {mode === 'join' && (
            <View style={styles.buttonGroup}>
              <Text style={styles.label}>Room Code</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="ABC123"
                placeholderTextColor={Colors.textMuted}
                value={roomCode}
                onChangeText={(t) => setRoomCode(t.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
                returnKeyType="join"
                onSubmitEditing={handleJoin}
                autoFocus
              />
              <Pressable
                style={[
                  styles.btn,
                  styles.btnPrimary,
                  roomCode.length !== 6 && styles.btnDisabled,
                ]}
                onPress={handleJoin}
              >
                <Text style={styles.btnPrimaryText}>Join Room</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => setMode('home')}>
                <Text style={styles.btnGhostText}>Back</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Recent games */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Recent Games</Text>
            {history.slice(0, 5).map((record, i) => (
              <View key={i} style={styles.historyRow}>
                <View
                  style={[
                    styles.historyBadge,
                    { backgroundColor: record.result === 'win' ? Colors.successBg : Colors.errorBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.historyResult,
                      { color: record.result === 'win' ? Colors.success : Colors.error },
                    ]}
                  >
                    {record.result === 'win' ? 'WIN' : 'LOSS'}
                  </Text>
                </View>
                <Text style={styles.historyOpponent}>vs {record.opponentName}</Text>
                <Text style={styles.historyDate}>
                  {new Date(record.date).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Rules summary */}
        <View style={styles.rulesBox}>
          <Text style={styles.rulesText}>
            Capture is mandatory · Maximum captures required · Kings move any distance
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 16,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  logoPiece: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: Colors.boardBorder,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.gold,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    padding: 13,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 8,
    color: Colors.gold,
  },
  errorBox: {
    backgroundColor: Colors.errorBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error,
    padding: 10,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
  buttonGroup: {
    gap: 10,
  },
  modeHint: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  btn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: Colors.gold,
  },
  btnPrimaryText: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '800',
  },
  btnSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.gold,
  },
  btnSecondaryText: {
    color: Colors.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnGhostText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  historySection: {
    gap: 8,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyBadge: {
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  historyResult: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  historyOpponent: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  historyDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  rulesBox: {
    borderTopWidth: 1,
    borderColor: Colors.divider,
    paddingTop: 12,
  },
  rulesText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
