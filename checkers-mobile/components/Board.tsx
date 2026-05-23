import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/colors';
import { BOARD_SIZE } from '../constants/config';
import Cell from './Cell';
import type { GameState, PlayerRole } from '../store/gameStore';

interface Props {
  gameState: GameState;
  playerRole: PlayerRole;
  onMove: (pieceId: string, toRow: number, toCol: number) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_MARGIN = 8;
const BOARD_SIZE_PX = Math.min(SCREEN_WIDTH - BOARD_MARGIN * 2, 440);
const CELL_SIZE = BOARD_SIZE_PX / BOARD_SIZE;

const ROWS = Array.from({ length: BOARD_SIZE }, (_, i) => i);

export default function Board({ gameState, playerRole, onMove }: Props) {
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  const { board, pieces, validMoves, currentTurn, status } = gameState;
  const isMyTurn = currentTurn === playerRole && status === 'playing';

  // Flip display so both players see their pieces at the bottom
  const shouldFlip = playerRole === 'player2';
  const displayRows = shouldFlip ? [...ROWS].reverse() : ROWS;
  const displayCols = shouldFlip ? [...ROWS].reverse() : ROWS;

  const selectablePieceIds = useMemo(
    () => (isMyTurn ? new Set(Object.keys(validMoves)) : new Set<string>()),
    [isMyTurn, validMoves]
  );

  // Destination highlights for the selected piece
  const highlights = useMemo(() => {
    const h: Record<string, { isCapture: boolean }> = {};
    if (!selectedPieceId || !validMoves[selectedPieceId]) return h;
    for (const move of validMoves[selectedPieceId]) {
      const dest = move.path[move.path.length - 1];
      h[`${dest[0]},${dest[1]}`] = { isCapture: move.captured.length > 0 };
    }
    return h;
  }, [selectedPieceId, validMoves]);

  // Deselect when turn changes (after a move lands)
  useEffect(() => {
    setSelectedPieceId(null);
  }, [currentTurn]);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      if (!isMyTurn) return;

      const cellPieceId = board[row][col];

      // Tap on a selectable piece → select (or toggle off)
      if (cellPieceId && selectablePieceIds.has(cellPieceId)) {
        if (cellPieceId !== selectedPieceId) {
          Haptics.selectionAsync();
        }
        setSelectedPieceId((prev) => (prev === cellPieceId ? null : cellPieceId));
        return;
      }

      // Tap on a highlighted destination → execute move
      if (selectedPieceId && highlights[`${row},${col}`]) {
        const isCapture = highlights[`${row},${col}`].isCapture;
        Haptics.impactAsync(
          isCapture
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Medium
        );
        onMove(selectedPieceId, row, col);
        setSelectedPieceId(null);
        return;
      }

      // Tap elsewhere → deselect
      setSelectedPieceId(null);
    },
    [isMyTurn, board, selectedPieceId, selectablePieceIds, highlights, onMove]
  );

  return (
    <View style={styles.wrapper}>
      <View style={[styles.board, { width: BOARD_SIZE_PX, height: BOARD_SIZE_PX }]}>
        {displayRows.map((row) => (
          <View key={row} style={styles.row}>
            {displayCols.map((col) => {
              const isDark = (row + col) % 2 === 1;
              const pieceId = board[row][col];
              const piece = pieceId ? pieces[pieceId] : null;
              const moveInfo = isDark ? (highlights[`${row},${col}`] ?? null) : null;
              const isSelected = pieceId !== null && pieceId === selectedPieceId;

              return (
                <Cell
                  key={`${row},${col}`}
                  row={row}
                  col={col}
                  isDark={isDark}
                  piece={piece}
                  isSelected={isSelected}
                  moveInfo={moveInfo}
                  cellSize={CELL_SIZE}
                  onPress={handleCellPress}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  board: {
    borderWidth: 4,
    borderColor: Colors.boardBorder,
    borderRadius: 4,
    overflow: 'hidden',
    shadowColor: Colors.boardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
  },
});
