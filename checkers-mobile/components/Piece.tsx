import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import type { Piece as PieceType } from '../store/gameStore';

interface Props {
  piece: PieceType;
  isSelected: boolean;
  size: number;
}

export default function Piece({ piece, isSelected, size }: Props) {
  const isP1 = piece.player === 'player1';
  const pieceSize = size * 0.78;
  const crownSize = pieceSize * 0.42;

  return (
    <View
      style={[
        styles.piece,
        {
          width: pieceSize,
          height: pieceSize,
          borderRadius: pieceSize / 2,
          backgroundColor: isP1 ? Colors.piece1 : Colors.piece2,
          borderColor: isP1 ? Colors.piece1Border : Colors.piece2Border,
          shadowColor: isSelected ? Colors.selected : '#000',
          shadowOpacity: isSelected ? 0.9 : 0.5,
          shadowRadius: isSelected ? 6 : 3,
          elevation: isSelected ? 8 : 4,
        },
        isSelected && {
          borderColor: Colors.selected,
          borderWidth: 2.5,
          transform: [{ scale: 1.08 }],
        },
      ]}
    >
      {/* Inner shine highlight */}
      <View
        style={[
          styles.shine,
          {
            width: pieceSize * 0.45,
            height: pieceSize * 0.3,
            backgroundColor: isP1 ? Colors.piece1Shine : Colors.piece2Shine,
            borderRadius: pieceSize * 0.2,
            top: pieceSize * 0.1,
            left: pieceSize * 0.12,
          },
        ]}
      />
      {piece.isKing && (
        <Text
          style={[
            styles.crown,
            {
              fontSize: crownSize,
              color: isP1 ? Colors.piece1Crown : Colors.piece2Crown,
            },
          ]}
        >
          ♛
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
  },
  shine: {
    position: 'absolute',
    opacity: 0.4,
  },
  crown: {
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
