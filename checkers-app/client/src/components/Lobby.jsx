import React, { useState } from 'react';

export default function Lobby({ onCreateRoom, onJoinRoom, error }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState(null); // 'create' | 'join'

  const handleCreate = (e) => {
    e.preventDefault();
    if (name.trim()) onCreateRoom(name.trim());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (name.trim() && roomCode.trim()) onJoinRoom(roomCode.trim(), name.trim());
  };

  return (
    <div className="lobby">
      <div className="lobby-card">
        <h1 className="lobby-title">
          <span className="piece-icon">⬤</span> International Draughts
        </h1>
        <p className="lobby-subtitle">10×10 Multiplayer Checkers</p>

        {!mode && (
          <div className="mode-buttons">
            <button className="btn btn-primary" onClick={() => setMode('create')}>
              Create Room
            </button>
            <button className="btn btn-secondary" onClick={() => setMode('join')}>
              Join Room
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="lobby-form">
            <h2>Create a New Game</h2>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              autoFocus
              className="input"
            />
            <button type="submit" className="btn btn-primary" disabled={!name.trim()}>
              Create Room
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setMode(null)}>
              Back
            </button>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="lobby-form">
            <h2>Join a Game</h2>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              autoFocus
              className="input"
            />
            <input
              type="text"
              placeholder="Room code (e.g. ABC123)"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="input"
            />
            <button type="submit" className="btn btn-primary" disabled={!name.trim() || !roomCode.trim()}>
              Join Room
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setMode(null)}>
              Back
            </button>
          </form>
        )}

        {error && <p className="error-message">{error}</p>}

        <div className="rules-hint">
          <strong>Rules:</strong> Capture is mandatory · Maximum captures required · Kings move any distance
        </div>
      </div>
    </div>
  );
}
