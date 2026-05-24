import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../store/gameStore';
import { movePiece, requestRematch, reconnectSocket, initSocket } from '../../hooks/useSocket';
import Board from '../../components/Board';
import GameInfo from '../../components/GameInfo';
import { Colors } from '../../constants/colors';

export default function GameScreen() {
  const { t } = useTranslation();
  const {
    gameState,
    playerRole,
    roomCode,
    playerName,
    disconnectMessage,
    reset,
    addGameRecord,
  } = useGameStore();

  const [resignModalVisible, setResignModalVisible] = useState(false);

  const handleMove = useCallback(
    (pieceId: string, toRow: number, toCol: number) => {
      movePiece(pieceId, toRow, toCol);
    },
    []
  );

  const handleResign = () => {
    setResignModalVisible(true);
  };

  const confirmResign = () => {
    setResignModalVisible(false);
    // Record the loss
    if (gameState && playerRole) {
      const opponentRole = playerRole === 'player1' ? 'player2' : 'player1';
      const opponentName = gameState.players[opponentRole]?.name ?? t('opponent');
      addGameRecord({
        date: new Date().toISOString(),
        opponentName,
        result: 'loss',
        roomCode,
      });
    }
    reconnectSocket();
    initSocket();
    reset();
  };

  const handleRematch = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    requestRematch();
  };

  const handleLeave = () => {
    reconnectSocket();
    initSocket();
    reset();
  };

  if (!gameState || !playerRole) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>{t('loading_game')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { status, winner, players } = gameState;
  const opponentRole = playerRole === 'player1' ? 'player2' : 'player1';
  const myName = players[playerRole]?.name ?? t('you');
  const opponentName = players[opponentRole]?.name ?? t('opponent');
  const winnerName = winner ? players[winner]?.name : null;
  const iWon = winner === playerRole;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Disconnect banner */}
      {disconnectMessage !== '' && (
        <View style={styles.disconnectBanner}>
          <Text style={styles.disconnectText}>{disconnectMessage}</Text>
          <Pressable onPress={handleLeave}>
            <Text style={styles.disconnectAction}>{t('leave')}</Text>
          </Pressable>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Game Info Panel */}
        <View style={styles.infoPanel}>
          <GameInfo
            gameState={gameState}
            playerRole={playerRole}
            roomCode={roomCode}
            onResign={handleResign}
          />
        </View>

        {/* Board */}
        <Board
          gameState={gameState}
          playerRole={playerRole}
          onMove={handleMove}
        />

        {/* Bottom leave button */}
        <Pressable style={styles.leaveBtn} onPress={handleLeave}>
          <Text style={styles.leaveBtnText}>{t('leave_game')}</Text>
        </Pressable>
      </ScrollView>

      {/* Resign confirmation modal */}
      <Modal
        visible={resignModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setResignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('resign_title')}</Text>
            <Text style={styles.modalBody}>{t('confirm_resign')}</Text>
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnDanger]}
                onPress={confirmResign}
              >
                <Text style={styles.modalBtnDangerText}>{t('yes_resign')}</Text>
              </Pressable>
              <Pressable
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setResignModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>{t('keep_playing')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Game over modal */}
      <Modal
        visible={status === 'finished'}
        transparent
        animationType="slide"
        onRequestClose={handleLeave}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.gameOverEmoji}>{iWon ? '🏆' : '😞'}</Text>
            <Text style={styles.modalTitle}>
              {iWon ? t('you_win') : t('you_lose', { name: winnerName })}
            </Text>
            <Text style={styles.modalBody}>
              {iWon
                ? t('well_played', { name: opponentName })
                : t('better_luck', { name: winnerName })}
            </Text>

            {/* Scores */}
            <View style={styles.scoreRow}>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNum}>{gameState.scores.player1}</Text>
                <Text style={styles.scoreName} numberOfLines={1}>
                  {players.player1?.name ?? 'P1'}
                </Text>
              </View>
              <Text style={styles.scoreDash}>—</Text>
              <View style={styles.scoreBox}>
                <Text style={styles.scoreNum}>{gameState.scores.player2}</Text>
                <Text style={styles.scoreName} numberOfLines={1}>
                  {players.player2?.name ?? 'P2'}
                </Text>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Pressable style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={handleRematch}>
                <Text style={styles.modalBtnPrimaryText}>{t('rematch')}</Text>
              </Pressable>
              <Pressable style={[styles.modalBtn, styles.modalBtnCancel]} onPress={handleLeave}>
                <Text style={styles.modalBtnCancelText}>{t('leave')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 16,
  },
  disconnectBanner: {
    backgroundColor: Colors.errorBg,
    borderBottomWidth: 1,
    borderColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  disconnectText: {
    flex: 1,
    color: Colors.error,
    fontSize: 13,
  },
  disconnectAction: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 12,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 14,
    alignItems: 'center',
  },
  infoPanel: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  leaveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaveBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.modalBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    gap: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  gameOverEmoji: {
    fontSize: 48,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: Colors.surface2,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
  },
  scoreBox: {
    alignItems: 'center',
    minWidth: 60,
  },
  scoreNum: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.gold,
  },
  scoreName: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    maxWidth: 80,
  },
  scoreDash: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  modalButtons: {
    width: '100%',
    gap: 10,
  },
  modalBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalBtnPrimary: {
    backgroundColor: Colors.gold,
  },
  modalBtnPrimaryText: {
    color: Colors.textDark,
    fontSize: 16,
    fontWeight: '800',
  },
  modalBtnDanger: {
    backgroundColor: Colors.error,
  },
  modalBtnDangerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalBtnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalBtnCancelText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});
