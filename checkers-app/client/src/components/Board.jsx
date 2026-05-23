import React, { useState, useCallback } from 'react';
import Cell from './Cell';

const BOARD_SIZE = 10;

export default function Board({ gameState, playerRole, onMove }) {
  const [selectedPieceId, setSelectedPieceId] = useState(null);

  const { board, pieces, validMoves, currentTurn, status } = gameState;
  const isMyTurn = currentTurn === playerRole && status === 'playing';

  // Flip the board for player2 so they see their pieces at the bottom
  const shouldFlip = playerRole === 'player2';

  /**
   * Builds a lookup: "row,col" -> { isCapture }
   * for all valid destinations of the selected piece.
   */
  const getHighlightedCells = useCallback(() => {
    const highlights = {};
    if (!selectedPieceId || !validMoves[selectedPieceId]) return highlights;

    for (const move of validMoves[selectedPieceId]) {
      const dest = move.path[move.path.length - 1];
      const key = `${dest[0]},${dest[1]}`;
      highlights[key] = { isCapture: move.captured.length > 0 };
    }
    return highlights;
  }, [selectedPieceId, validMoves]);

  /**
   * Which pieces are selectable (have valid moves) for the current player.
   */
  const selectablePieceIds = isMyTurn ? new Set(Object.keys(validMoves)) : new Set();

  const highlights = getHighlightedCells();

  const handleCellClick = useCallback((row, col) => {
    if (!isMyTurn) return;

    const cellPieceId = board[row][col];

    // Clicking on a selectable piece: select it (or deselect if already selected)
    if (cellPieceId && selectablePieceIds.has(cellPieceId)) {
      setSelectedPieceId(prev => prev === cellPieceId ? null : cellPieceId);
      return;
    }

    // Clicking on a highlighted destination: make the move
    if (selectedPieceId) {
      const key = `${row},${col}`;
      if (highlights[key]) {
        onMove(selectedPieceId, row, col);
        setSelectedPieceId(null);
        return;
      }
    }

    // Clicking elsewhere: deselect
    setSelectedPieceId(null);
  }, [isMyTurn, board, selectedPieceId, selectablePieceIds, highlights, onMove]);

  // Build display rows (optionally flipped for player 2)
  const displayRows = shouldFlip
    ? Array.from({ length: BOARD_SIZE }, (_, i) => BOARD_SIZE - 1 - i)
    : Array.from({ length: BOARD_SIZE }, (_, i) => i);

  const displayCols = shouldFlip
    ? Array.from({ length: BOARD_SIZE }, (_, i) => BOARD_SIZE - 1 - i)
    : Array.from({ length: BOARD_SIZE }, (_, i) => i);

  return (
    <div className="board-wrapper">
      <div className="board">
        {displayRows.map(row => (
          <div key={row} className="board-row">
            {displayCols.map(col => {
              const isDark = (row + col) % 2 === 1;
              const pieceId = board[row][col];
              const piece = pieceId ? pieces[pieceId] : null;
              const key = `${row},${col}`;
              const moveInfo = isDark ? highlights[key] || null : null;
              const isSelected = pieceId === selectedPieceId;

              return (
                <Cell
                  key={key}
                  row={row}
                  col={col}
                  isDark={isDark}
                  pieceId={pieceId}
                  piece={piece}
                  isSelected={isSelected}
                  moveInfo={moveInfo}
                  onCellClick={handleCellClick}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
