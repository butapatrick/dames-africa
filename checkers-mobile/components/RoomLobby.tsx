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
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/colors';
import { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n';
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
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<'home' | 'create' | 'join'>('home');
  const [roomCode, setRoomCode] = useState('');
  const [langModalVisible, setLangModalVisible] = useState(false);

  const handleJoin = () => {
    if (roomCode.trim().length === 6) onJoinRoom(roomCode.trim().toUpperCase());
  };

  const handleSelectLanguage = async (code: string) => {
    await changeLanguage(code);
    setLangModalVisible(false);
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
          {/* Language button top-right */}
          <Pressable
            style={styles.langBtn}
            onPress={() => setLangModalVisible(true)}
          >
            <Text style={styles.langBtnText}>🌐</Text>
          </Pressable>

          <View style={styles.logoRow}>
            <View style={[styles.logoPiece, { backgroundColor: Colors.piece1 }]} />
            <View style={[styles.logoPiece, { backgroundColor: Colors.piece2 }]} />
          </View>
          <Text style={styles.appName}>{t('app_title')}</Text>
          <Text style={styles.appSubtitle}>{t('subtitle')}</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Name input always visible */}
          <Text style={styles.label}>{t('your_name')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('enter_name')}
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
                <Text style={styles.btnPrimaryText}>{t('create_game')}</Text>
              </Pressable>
              <Pressable
                style={[styles.btn, styles.btnSecondary, !playerName.trim() && styles.btnDisabled]}
                onPress={() => playerName.trim() && setMode('join')}
              >
                <Text style={styles.btnSecondaryText}>{t('join_game')}</Text>
              </Pressable>
            </View>
          )}

          {mode === 'create' && (
            <View style={styles.buttonGroup}>
              <Text style={styles.modeHint}>{t('room_code_hint')}</Text>
              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onCreateRoom}>
                <Text style={styles.btnPrimaryText}>{t('create_room')}</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => setMode('home')}>
                <Text style={styles.btnGhostText}>{t('back')}</Text>
              </Pressable>
            </View>
          )}

          {mode === 'join' && (
            <View style={styles.buttonGroup}>
              <Text style={styles.label}>{t('room_code')}</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="ABC123"
                placeholderTextColor={Colors.textMuted}
                value={roomCode}
                onChangeText={(tx) => setRoomCode(tx.toUpperCase())}
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
                <Text style={styles.btnPrimaryText}>{t('join_room')}</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => setMode('home')}>
                <Text style={styles.btnGhostText}>{t('back')}</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Recent games */}
        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>{t('recent_games')}</Text>
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
                    {record.result === 'win' ? t('win') : t('loss')}
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
            {t('capture_mandatory')} · {t('max_captures')} · {t('kings_move')}
          </Text>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>{t('copyright')}</Text>
      </ScrollView>

      {/* Language selector modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLangModalVisible(false)}>
          <View style={styles.langModal}>
            <Text style={styles.langModalTitle}>{t('select_language')}</Text>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isActive = i18n.language === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  style={[styles.langRow, isActive && styles.langRowActive]}
                  onPress={() => handleSelectLanguage(lang.code)}
                >
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <Text style={[styles.langName, isActive && styles.langNameActive]}>
                    {lang.name}
                  </Text>
                  {isActive && <Text style={styles.langCheck}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
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
  langBtn: {
    position: 'absolute',
    top: 12,
    right: 0,
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    zIndex: 10,
  },
  langBtnText: {
    fontSize: 20,
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
  copyright: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingBottom: 8,
    opacity: 0.7,
  },
  // Language modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  langModal: {
    backgroundColor: Colors.modalBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  langModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  langRowActive: {
    backgroundColor: Colors.myTurnBg,
    borderWidth: 1,
    borderColor: Colors.myTurnBorder,
  },
  langFlag: {
    fontSize: 22,
  },
  langName: {
    flex: 1,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  langNameActive: {
    color: Colors.gold,
    fontWeight: '700',
  },
  langCheck: {
    fontSize: 16,
    color: Colors.gold,
    fontWeight: '800',
  },
});
