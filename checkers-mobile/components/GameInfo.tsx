import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../constants/colors';
import { TURN_TIMER_SECONDS } from '../constants/config';
import type { GameState, PlayerRole } from '../store/gameStore';

interface Props {
  gameState: GameState;
  playerRole: PlayerRole;
  roomCode: string;
  onResign: () => void;
}

export default function GameInfo({ gameState, playerRole, roomCode, onResign }: Props) {
  const [timeLeft, setTimeLeft] = useState(TURN_TIMER_SECONDS);

  const { players, currentTurn, status, winner, scores, turnStartTime, pieces } = gameState;

  const opponentRole = playerRole === 'player1' ? 'player2' : 'player1';
  const myName = players[playerRole]?.name ?? 'You';
  const opponentName = players[opponentRole]?.name ?? 'Opponent';
  const isMyTurn = currentTurn === playerRole && status === 'playing';

  const p1Count = Object.values(pieces).filter((p) => p.player === 'player1').length;
  const p2Count = Object.values(pieces).filter((p) => p.player === 'player2').length;
  const myCount = playerRole === 'player1' ? p1Count : p2Count;
  const theirCount = playerRole === 'player1' ? p2Count : p1Count;

  useEffect(() => {
    if (status !== 'playing' || !turnStartTime) return;
    const update = () => {
      const elapsed = Math.floor((Date.now() - turnStartTime) / 1000);
      setTimeLeft(Math.max(0, TURN_TIMER_SECONDS - elapsed));
    };
    update();
    const id = setInterval(update, 500);
    return () => clearInterval(id);
  }, [currentTurn, status, turnStartTime]);

  const timerUrgent = timeLeft <= 10 && isMyTurn;

  return (
    <View style={styles.container}>
      {/* Room code row */}
      <View style={styles.roomRow}>
        <Text style={styles.roomLabel}>Room</Text>
        <Text style={styles.roomCode}>{roomCode}</Text>
      </View>

      {/* Player rows */}
      <PlayerRow
        name={myName}
        label="You"
        isPlayer1={playerRole === 'player1'}
        isActive={currentTurn === playerRole}
        score={scores[playerRole]}
        pieceCount={myCount}
      />
      <View style={styles.vsRow}>
        <View style={styles.vsDivider} />
        <Text style={styles.vsText}>VS</Text>
        <View style={styles.vsDivider} />
      </View>
      <PlayerRow
        name={opponentName}
        label="Opponent"
        isPlayer1={opponentRole === 'player1'}
        isActive={currentTurn === opponentRole}
        score={scores[opponentRole]}
        pieceCount={theirCount}
      />

      {/* Turn / Timer */}
      {status === 'playing' && (
        <View style={[styles.turnBadge, isMyTurn ? styles.myTurn : styles.theirTurn]}>
          <Text style={[styles.turnText, isMyTurn && styles.myTurnText]}>
            {isMyTurn ? 'Your turn' : `${opponentName}'s turn`}
          </Text>
          <Text style={[styles.timer, timerUrgent && styles.timerUrgent]}>
            {timeLeft}s
          </Text>
        </View>
      )}

      {/* Resign button (only during play and on my turn) */}
      {status === 'playing' && (
        <Pressable style={styles.resignBtn} onPress={onResign}>
          <Text style={styles.resignText}>Resign</Text>
        </Pressable>
      )}
    </View>
  );
}

interface PlayerRowProps {
  name: string;
  label: string;
  isPlayer1: boolean;
  isActive: boolean;
  score: number;
  pieceCount: number;
}

function PlayerRow({ name, label, isPlayer1, isActive, score, pieceCount }: PlayerRowProps) {
  return (
    <View style={[styles.playerRow, isActive && styles.playerRowActive]}>
      <View
        style={[
          styles.playerDot,
          { backgroundColor: isPlayer1 ? Colors.piece1 : Colors.piece2 },
        ]}
      />
      <View style={styles.playerInfo}>
        <Text style={styles.playerName} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.playerLabel}>{label}</Text>
      </View>
      <Text style={styles.pieceCount}>{pieceCount} pcs</Text>
      <Text style={styles.score}>{score}W</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  roomLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  roomCode: {
    fontSize: 14,
    color: Colors.gold,
    fontFamily: 'monospace',
    fontWeight: '800',
    letterSpacing: 2,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: Colors.surface2,
  },
  playerRowActive: {
    borderColor: Colors.gold,
    backgroundColor: Colors.myTurnBg,
  },
  playerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  playerInfo: {
    flex: 1,
    minWidth: 0,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  playerLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  pieceCount: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  score: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.gold,
    minWidth: 28,
    textAlign: 'right',
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vsDivider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.divider,
  },
  vsText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  turnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  myTurn: {
    backgroundColor: Colors.myTurnBg,
    borderColor: Colors.myTurnBorder,
  },
  theirTurn: {
    backgroundColor: Colors.theirTurnBg,
    borderColor: Colors.border,
  },
  turnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  myTurnText: {
    color: Colors.gold,
  },
  timer: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'monospace',
    color: Colors.textMuted,
  },
  timerUrgent: {
    color: Colors.error,
  },
  resignBtn: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 4,
  },
  resignText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
