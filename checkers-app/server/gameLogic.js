/**
 * International Draughts (10x10) Game Logic Engine
 * Rules: mandatory capture, maximum capture sequence, kings move any distance
 */

const BOARD_SIZE = 10;

/**
 * Creates the initial 10x10 board with 20 pieces per player.
 * Only dark squares are used (where (row + col) % 2 === 1).
 * Player 1 occupies rows 6-9 (bottom), Player 2 occupies rows 0-3 (top).
 */
function createInitialBoard() {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  const pieces = {};
  let pieceId = 1;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Only place pieces on dark squares
      if ((row + col) % 2 === 1) {
        if (row <= 3) {
          // Player 2 pieces at top
          const id = `p${pieceId++}`;
          pieces[id] = { id, player: 'player2', row, col, isKing: false };
          board[row][col] = id;
        } else if (row >= 6) {
          // Player 1 pieces at bottom
          const id = `p${pieceId++}`;
          pieces[id] = { id, player: 'player1', row, col, isKing: false };
          board[row][col] = id;
        }
      }
    }
  }

  return { board, pieces };
}

/**
 * Creates the initial game state for a new game.
 */
function createInitialGameState(players = {}) {
  const { board, pieces } = createInitialBoard();
  return {
    board,
    pieces,
    currentTurn: 'player1',
    players,
    selectedPiece: null,
    validMoves: [],
    status: 'waiting',
    winner: null,
    scores: { player1: 0, player2: 0 },
    turnStartTime: null
  };
}

/**
 * Returns all diagonal directions as [rowDelta, colDelta] pairs.
 */
function getAllDirections() {
  return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
}

/**
 * Returns forward diagonal directions for a player's normal piece.
 * Player 1 moves up (negative row), Player 2 moves down (positive row).
 */
function getForwardDirections(player) {
  return player === 'player1' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
}

/**
 * Checks if a position is within board boundaries.
 */
function inBounds(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

/**
 * Recursively finds all capture sequences from a given position.
 * Returns an array of sequences, where each sequence is an array of positions visited.
 *
 * @param {Array} board - Current board state
 * @param {Object} pieces - Current pieces state
 * @param {number} row - Current row
 * @param {number} col - Current col
 * @param {string} player - 'player1' or 'player2'
 * @param {boolean} isKing - Whether this piece is a king
 * @param {Set} capturedIds - Piece IDs already captured in this sequence
 * @param {Array} path - Current path taken [[row, col], ...]
 */
function findCaptureSequences(board, pieces, row, col, player, isKing, capturedIds, path) {
  const directions = getAllDirections();
  const opponent = player === 'player1' ? 'player2' : 'player1';
  let sequences = [];

  for (const [dr, dc] of directions) {
    if (isKing) {
      // King: scan along the diagonal any number of squares
      let r = row + dr;
      let c = col + dc;
      let foundEnemy = null;
      let foundEnemyPos = null;

      while (inBounds(r, c)) {
        const cellId = board[r][c];
        if (cellId && !capturedIds.has(cellId)) {
          const cellPiece = pieces[cellId];
          if (cellPiece.player === opponent) {
            // Found an enemy piece - can we land beyond it?
            foundEnemy = cellId;
            foundEnemyPos = [r, c];
            break;
          } else {
            // Blocked by own piece
            break;
          }
        } else if (cellId && capturedIds.has(cellId)) {
          // Previously captured piece, treat as empty for movement but track
          r += dr;
          c += dc;
          continue;
        }
        r += dr;
        c += dc;
      }

      if (foundEnemy) {
        // Try landing on all squares beyond the captured piece
        let lr = foundEnemyPos[0] + dr;
        let lc = foundEnemyPos[1] + dc;
        while (inBounds(lr, lc)) {
          const landCell = board[lr][lc];
          // Can land on empty or previously-captured squares (not current position)
          if (!landCell || capturedIds.has(landCell)) {
            // Make capture
            const newCaptured = new Set(capturedIds);
            newCaptured.add(foundEnemy);
            const newPath = [...path, [lr, lc]];

            // Recurse from landing square
            const subSequences = findCaptureSequences(
              board, pieces, lr, lc, player, isKing, newCaptured, newPath
            );

            if (subSequences.length === 0) {
              // No further captures, this is a terminal sequence
              sequences.push({ path: newPath, captured: newCaptured });
            } else {
              sequences = sequences.concat(subSequences);
            }
          } else {
            break; // Blocked
          }
          lr += dr;
          lc += dc;
        }
      }
    } else {
      // Normal piece: must jump exactly one enemy then land one square beyond
      const er = row + dr;
      const ec = col + dc;
      const lr = row + 2 * dr;
      const lc = col + 2 * dc;

      if (!inBounds(er, ec) || !inBounds(lr, lc)) continue;

      const enemyId = board[er][ec];
      if (!enemyId || capturedIds.has(enemyId)) continue;
      const enemy = pieces[enemyId];
      if (enemy.player !== opponent) continue;

      const landCell = board[lr][lc];
      if (landCell && !capturedIds.has(landCell)) continue;

      // Valid capture
      const newCaptured = new Set(capturedIds);
      newCaptured.add(enemyId);
      const newPath = [...path, [lr, lc]];

      // A normal piece becomes a king if it lands on the last row - but in international
      // draughts, if it becomes a king mid-sequence, the sequence stops there.
      const becomesKing =
        (player === 'player1' && lr === 0) ||
        (player === 'player2' && lr === BOARD_SIZE - 1);

      const subSequences = becomesKing
        ? []
        : findCaptureSequences(board, pieces, lr, lc, player, false, newCaptured, newPath);

      if (subSequences.length === 0) {
        sequences.push({ path: newPath, captured: newCaptured });
      } else {
        sequences = sequences.concat(subSequences);
      }
    }
  }

  return sequences;
}

/**
 * Computes all valid moves for a given player in the current board state.
 * Enforces mandatory capture and maximum capture rules.
 *
 * Returns an object: { [pieceId]: [ { path, captured } ] }
 */
function computeValidMoves(board, pieces, player) {
  const movesMap = {};
  let maxCaptures = 0;
  let hasCaptures = false;

  // First pass: find all captures
  for (const [id, piece] of Object.entries(pieces)) {
    if (piece.player !== player) continue;

    const captureSeqs = findCaptureSequences(
      board, pieces, piece.row, piece.col, player, piece.isKing, new Set(), [[piece.row, piece.col]]
    );

    if (captureSeqs.length > 0) {
      hasCaptures = true;
      // Track max number of captures for mandatory maximum rule
      for (const seq of captureSeqs) {
        if (seq.captured.size > maxCaptures) maxCaptures = seq.captured.size;
      }
      movesMap[id] = captureSeqs;
    }
  }

  // If captures exist, filter to only maximum-capture sequences (mandatory max capture rule)
  if (hasCaptures) {
    for (const id of Object.keys(movesMap)) {
      movesMap[id] = movesMap[id].filter(seq => seq.captured.size === maxCaptures);
      if (movesMap[id].length === 0) delete movesMap[id];
    }
    return movesMap;
  }

  // No captures - find normal moves
  for (const [id, piece] of Object.entries(pieces)) {
    if (piece.player !== player) continue;

    const moves = [];
    const directions = piece.isKing ? getAllDirections() : getForwardDirections(player);

    if (piece.isKing) {
      // King slides along diagonals until blocked
      for (const [dr, dc] of directions) {
        let r = piece.row + dr;
        let c = piece.col + dc;
        while (inBounds(r, c) && !board[r][c]) {
          moves.push({ path: [[piece.row, piece.col], [r, c]], captured: new Set() });
          r += dr;
          c += dc;
        }
      }
    } else {
      // Normal piece moves one step forward
      for (const [dr, dc] of directions) {
        const r = piece.row + dr;
        const c = piece.col + dc;
        if (inBounds(r, c) && !board[r][c]) {
          moves.push({ path: [[piece.row, piece.col], [r, c]], captured: new Set() });
        }
      }
    }

    if (moves.length > 0) movesMap[id] = moves;
  }

  return movesMap;
}

/**
 * Applies a move to the game state and returns the new state.
 * Handles promotion to king, removal of captured pieces, turn switching.
 *
 * @param {Object} state - Current game state
 * @param {string} pieceId - ID of piece being moved
 * @param {Array} path - Array of [row, col] positions in the move
 * @param {Set} captured - Set of captured piece IDs
 */
function applyMove(state, pieceId, path, captured) {
  const newBoard = state.board.map(row => [...row]);
  const newPieces = { ...state.pieces };
  const piece = { ...newPieces[pieceId] };

  const [fromRow, fromCol] = [piece.row, piece.col];
  const [toRow, toCol] = path[path.length - 1];

  // Move piece on board
  newBoard[fromRow][fromCol] = null;
  newBoard[toRow][toCol] = pieceId;
  piece.row = toRow;
  piece.col = toCol;

  // Remove captured pieces
  for (const capturedId of captured) {
    const cap = newPieces[capturedId];
    newBoard[cap.row][cap.col] = null;
    delete newPieces[capturedId];
  }

  // Promote to king if reaching the last row
  const promotionRow = piece.player === 'player1' ? 0 : BOARD_SIZE - 1;
  if (toRow === promotionRow && !piece.isKing) {
    piece.isKing = true;
  }

  newPieces[pieceId] = piece;

  // Switch turn
  const nextTurn = state.currentTurn === 'player1' ? 'player2' : 'player1';

  // Compute moves for next player
  const nextMoves = computeValidMoves(newBoard, newPieces, nextTurn);

  // Check win condition: no pieces or no legal moves
  const nextPlayerPieces = Object.values(newPieces).filter(p => p.player === nextTurn);
  let winner = null;
  let status = 'playing';

  if (nextPlayerPieces.length === 0 || Object.keys(nextMoves).length === 0) {
    winner = state.currentTurn;
    status = 'finished';
  }

  const newScores = { ...state.scores };
  if (winner) {
    newScores[winner] = (newScores[winner] || 0) + 1;
  }

  return {
    ...state,
    board: newBoard,
    pieces: newPieces,
    currentTurn: nextTurn,
    selectedPiece: null,
    validMoves: nextMoves,
    status,
    winner,
    scores: newScores,
    turnStartTime: Date.now()
  };
}

/**
 * Validates that a requested move is legal given the current valid moves.
 * Returns { valid, pieceId, path, captured } or { valid: false, error }.
 */
function validateMove(state, pieceId, toRow, toCol) {
  const validMoves = state.validMoves || {};

  if (!validMoves[pieceId]) {
    return { valid: false, error: 'No valid moves for this piece' };
  }

  const matchingMove = validMoves[pieceId].find(move => {
    const dest = move.path[move.path.length - 1];
    return dest[0] === toRow && dest[1] === toCol;
  });

  if (!matchingMove) {
    return { valid: false, error: 'Invalid destination' };
  }

  return {
    valid: true,
    pieceId,
    path: matchingMove.path,
    captured: matchingMove.captured
  };
}

/**
 * Resets the game for a rematch, preserving players and scores.
 */
function resetGame(state) {
  const { board, pieces } = createInitialBoard();
  const validMoves = computeValidMoves(board, pieces, 'player1');

  return {
    ...state,
    board,
    pieces,
    currentTurn: 'player1',
    selectedPiece: null,
    validMoves,
    status: 'playing',
    winner: null,
    turnStartTime: Date.now()
  };
}

/**
 * Starts the game once both players have joined.
 */
function startGame(state) {
  const { board, pieces } = createInitialBoard();
  const validMoves = computeValidMoves(board, pieces, 'player1');

  return {
    ...state,
    board,
    pieces,
    currentTurn: 'player1',
    selectedPiece: null,
    validMoves,
    status: 'playing',
    winner: null,
    turnStartTime: Date.now()
  };
}

module.exports = {
  createInitialGameState,
  computeValidMoves,
  applyMove,
  validateMove,
  resetGame,
  startGame
};
