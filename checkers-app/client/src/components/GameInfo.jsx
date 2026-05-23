import React, { useEffect, useState } from 'react';

export default function GameInfo({ gameState, playerRole, roomCode, onRematch }) {
  const [timeLeft, setTimeLeft] = useState(30);

  const { players, currentTurn, status, winner, scores, turnStartTime } = gameState;

  const isMyTurn = currentTurn === playerRole;
  const myName = players[playerRole]?.name || 'You';
  const opponentRole = playerRole === 'player1' ? 'player2' : 'player1';
  const opponentName = players[opponentRole]?.name || 'Opponent';

  // Turn timer
  useEffect(() => {
    if (status !== 'playing') return;
    setTimeLeft(30);
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - turnStartTime) / 1000);
      const remaining = Math.max(0, 30 - elapsed);
      setTimeLeft(remaining);
    }, 500);
    return () => clearInterval(interval);
  }, [currentTurn, turnStartTime, status]);

  const player1Pieces = Object.values(gameState.pieces).filter(p => p.player === 'player1').length;
  const player2Pieces = Object.values(gameState.pieces).filter(p => p.player === 'player2').length;

  const winnerName = winner ? players[winner]?.name : null;

  return (
    <div className="game-info">
      <div className="room-code-display">
        Room: <span className="code">{roomCode}</span>
      </div>

      <div className="score-board">
        <div className={`player-card ${playerRole === 'player1' ? 'my-card' : ''} ${currentTurn === 'player1' ? 'active-turn' : ''}`}>
          <div className="player-piece dark-piece"></div>
          <div className="player-details">
            <span className="player-name">{players.player1?.name || '---'}</span>
            <span className="player-label">{playerRole === 'player1' ? '(You)' : ''}</span>
          </div>
          <div className="piece-count">{player1Pieces} pieces</div>
          <div className="score">{scores.player1} W</div>
        </div>

        <div className="vs-divider">VS</div>

        <div className={`player-card ${playerRole === 'player2' ? 'my-card' : ''} ${currentTurn === 'player2' ? 'active-turn' : ''}`}>
          <div className="player-piece light-piece"></div>
          <div className="player-details">
            <span className="player-name">{players.player2?.name || 'Waiting...'}</span>
            <span className="player-label">{playerRole === 'player2' ? '(You)' : ''}</span>
          </div>
          <div className="piece-count">{player2Pieces} pieces</div>
          <div className="score">{scores.player2} W</div>
        </div>
      </div>

      {status === 'playing' && (
        <div className={`turn-indicator ${isMyTurn ? 'my-turn' : 'their-turn'}`}>
          {isMyTurn ? 'Your turn!' : `${opponentName}'s turn`}
          <div className={`timer ${timeLeft <= 10 ? 'timer-urgent' : ''}`}>
            {timeLeft}s
          </div>
        </div>
      )}

      {status === 'waiting' && (
        <div className="waiting-message">
          Waiting for opponent to join...
          <div className="share-code">Share code: <strong>{roomCode}</strong></div>
        </div>
      )}

      {status === 'finished' && (
        <div className="game-over">
          <div className="winner-text">
            {winnerName === myName ? '🏆 You win!' : `${winnerName} wins!`}
          </div>
          <button className="btn btn-primary" onClick={onRematch}>
            Rematch
          </button>
        </div>
      )}
    </div>
  );
}
