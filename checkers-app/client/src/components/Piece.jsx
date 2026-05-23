import React from 'react';

export default function Piece({ piece, isSelected, onClick }) {
  const { player, isKing } = piece;

  const classes = [
    'piece',
    player === 'player1' ? 'piece-dark' : 'piece-light',
    isSelected ? 'piece-selected' : '',
    isKing ? 'piece-king' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} title={isKing ? 'King' : 'Piece'}>
      {isKing && <span className="crown">♛</span>}
    </div>
  );
}
