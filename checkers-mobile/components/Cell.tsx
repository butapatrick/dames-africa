import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import Piece from './Piece';
import type { Piece as PieceType } from '../store/gameStore';

interface MoveInfo {
  isCapture: boolean;
}

interface Props {
  row: number;
  col: number;
  isDark: boolean;
  piece: PieceType | null;
  isSelected: boolean;
  moveInfo: MoveInfo | null;
  cellSize: number;
  onPress: (row: number, col: number) => void;
}

export default function Cell({
  row,
  col,
  isDark,
  piece,
  isSelected,
  moveInfo,
  cellSize,
  onPress,
}: Props) {
  const dotSize = cellSize * 0.32;

  const bgColor = () => {
    if (!isDark) return Colors.lightSquare;
    if (moveInfo?.isCapture) return Colors.captureCell;
    if (moveInfo) return Colors.moveCell;
    return Colors.darkSquare;
  };

  return (
    <Pressable
      style={[styles.cell, { width: cellSize, height: cellSize, backgroundColor: bgColor() }]}
      onPress={() => onPress(row, col)}
      android_ripple={isDark ? { color: 'rgba(255,255,255,0.1)', borderless: false } : undefined}
    >
      {piece && <Piece piece={piece} isSelected={isSelected} size={cellSize} />}
      {moveInfo && !piece && (
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: moveInfo.isCapture ? Colors.captureDot : Colors.moveDot,
            },
          ]}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    opacity: 0.85,
  },
});
