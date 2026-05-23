import React, { useState, useEffect, useCallback } from 'react';
import socket from './socket';
import Lobby from './components/Lobby';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import './App.css';

export default function App() {
  const [screen, setScreen] = useState('lobby'); // 'lobby' | 'waiting' | 'game'
  const [gameState, setGameState] = useState(null);
  const [playerRole, setPlayerRole] = useState(null); // 'player1' | 'player2'
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [disconnectMsg, setDisconnectMsg] = useState('');

  useEffect(() => {
    socket.on('roomCreated', ({ roomCode: code, playerRole: role, gameState: state }) => {
      setRoomCode(code);
      setPlayerRole(role);
      setGameState(state);
      setScreen('waiting');
      setError('');
    });

    socket.on('roomJoined', ({ roomCode: code, playerRole: role, gameState: state }) => {
      setRoomCode(code);
      setPlayerRole(role);
      setGameState(state);
      setScreen('game');
      setError('');
    });

    socket.on('gameStarted', ({ gameState: state }) => {
      setGameState(state);
      setScreen('game');
      setDisconnectMsg('');
    });

    socket.on('gameUpdated', ({ gameState: state }) => {
      setGameState(state);
    });

    socket.on('playerDisconnected', ({ playerName }) => {
      setDisconnectMsg(`${playerName} disconnected. The room will close shortly.`);
    });

    socket.on('error', ({ message }) => {
      setError(message);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('gameStarted');
      socket.off('gameUpdated');
      socket.off('playerDisconnected');
      socket.off('error');
    };
  }, []);

  const handleCreateRoom = useCallback((playerName) => {
    setError('');
    socket.emit('createRoom', { playerName });
  }, []);

  const handleJoinRoom = useCallback((code, playerName) => {
    setError('');
    socket.emit('joinRoom', { roomCode: code, playerName });
  }, []);

  const handleMove = useCallback((pieceId, toRow, toCol) => {
    socket.emit('movePiece', { pieceId, toRow, toCol });
  }, []);

  const handleRematch = useCallback(() => {
    socket.emit('rematch');
  }, []);

  const handleLeave = useCallback(() => {
    setScreen('lobby');
    setGameState(null);
    setPlayerRole(null);
    setRoomCode('');
    setError('');
    setDisconnectMsg('');
    // Reconnect socket to get a fresh session
    socket.disconnect();
    socket.connect();
  }, []);

  if (screen === 'lobby') {
    return <Lobby onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} error={error} />;
  }

  if (screen === 'waiting') {
    return (
      <div className="waiting-screen">
        <div className="waiting-card">
          <h2>Room Created!</h2>
          <p>Share this code with your opponent:</p>
          <div className="big-room-code">{roomCode}</div>
          <p className="waiting-text">Waiting for opponent to join...</p>
          <div className="spinner"></div>
          <button className="btn btn-ghost" onClick={handleLeave}>Cancel</button>
        </div>
      </div>
    );
  }

  if (screen === 'game' && gameState) {
    return (
      <div className="game-screen">
        {disconnectMsg && (
          <div className="disconnect-banner">
            {disconnectMsg}
            <button className="btn btn-ghost btn-small" onClick={handleLeave}>Leave</button>
          </div>
        )}
        <div className="game-layout">
          <GameInfo
            gameState={gameState}
            playerRole={playerRole}
            roomCode={roomCode}
            onRematch={handleRematch}
          />
          <Board
            gameState={gameState}
            playerRole={playerRole}
            onMove={handleMove}
          />
        </div>
        <button className="btn btn-ghost leave-btn" onClick={handleLeave}>Leave Game</button>
      </div>
    );
  }

  return null;
}
