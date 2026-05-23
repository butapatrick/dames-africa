import React from 'react';
import Piece from './Piece';

export default function Cell({ row, col, isDark, pieceId, piece, isSelected, moveInfo, onCellClick }) {
  // moveInfo: null | { isCapture: boolean }
  const classes = [
    'cell',
    isDark ? 'cell-dark' : 'cell-light',
    moveInfo ? (moveInfo.isCapture ? 'cell-capture' : 'cell-move') : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={() => onCellClick(row, col)}>
      {piece && (
        <Piece
          piece={piece}
          isSelected={isSelected}
          onClick={(e) => { e.stopPropagation(); onCellClick(row, col); }}
        />
      )}
      {moveInfo && !piece && (
        <div className={moveInfo.isCapture ? 'move-dot capture-dot' : 'move-dot'} />
      )}
    </div>
  );
}
