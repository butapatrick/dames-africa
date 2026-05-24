const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const {
  createInitialGameState,
  validateMove,
  applyMove,
  resetGame,
  startGame
} = require('./gameLogic');

const app = express();
const server = http.createServer(app);
// Allow web client (localhost:3000) and any mobile app origin.
// In production set CORS_ORIGIN env var to your specific domains.
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// In-memory store: roomCode -> gameState
const rooms = {};

/**
 * Generates a random 6-character uppercase room code.
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Serializes game state for transmission - converts Sets to arrays.
 */
function serializeState(state) {
  if (!state) return null;
  const validMoves = {};
  if (state.validMoves) {
    for (const [pieceId, moves] of Object.entries(state.validMoves)) {
      validMoves[pieceId] = moves.map(move => ({
        path: move.path,
        captured: Array.from(move.captured)
      }));
    }
  }
  return { ...state, validMoves };
}

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Create a new room
  socket.on('createRoom', ({ playerName }) => {
    let roomCode;
    do {
      roomCode = generateRoomCode();
    } while (rooms[roomCode]);

    const state = createInitialGameState({
      player1: { name: playerName, socketId: socket.id },
      player2: null
    });

    rooms[roomCode] = state;
    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.data.playerRole = 'player1';

    console.log(`Room created: ${roomCode} by ${playerName}`);
    socket.emit('roomCreated', { roomCode, playerRole: 'player1', gameState: serializeState(state) });
  });

  // Join an existing room
  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const code = roomCode.toUpperCase().trim();
    const state = rooms[code];

    if (!state) {
      socket.emit('error', { message: 'Room not found. Check the code and try again.' });
      return;
    }

    if (state.players.player2) {
      socket.emit('error', { message: 'Room is full.' });
      return;
    }

    if (state.status !== 'waiting') {
      socket.emit('error', { message: 'Game already in progress.' });
      return;
    }

    state.players.player2 = { name: playerName, socketId: socket.id };
    socket.join(code);
    socket.data.roomCode = code;
    socket.data.playerRole = 'player2';

    // Start the game now that both players are in
    const newState = startGame(state);
    rooms[code] = newState;

    console.log(`${playerName} joined room ${code}`);

    // Notify the joining player
    socket.emit('roomJoined', {
      roomCode: code,
      playerRole: 'player2',
      gameState: serializeState(newState)
    });

    // Notify all players in the room (including the creator) that game is starting
    io.to(code).emit('gameStarted', { gameState: serializeState(newState) });
  });

  // Handle a piece move
  socket.on('movePiece', ({ pieceId, toRow, toCol }) => {
    const roomCode = socket.data.roomCode;
    const playerRole = socket.data.playerRole;
    const state = rooms[roomCode];

    if (!state) {
      socket.emit('error', { message: 'Room not found.' });
      return;
    }

    if (state.status !== 'playing') {
      socket.emit('error', { message: 'Game is not in progress.' });
      return;
    }

    if (state.currentTurn !== playerRole) {
      socket.emit('error', { message: 'Not your turn.' });
      return;
    }

    const validation = validateMove(state, pieceId, toRow, toCol);
    if (!validation.valid) {
      socket.emit('error', { message: validation.error });
      return;
    }

    const newState = applyMove(state, validation.pieceId, validation.path, validation.captured);
    rooms[roomCode] = newState;

    console.log(`Move in room ${roomCode}: piece ${pieceId} to [${toRow},${toCol}]`);
    io.to(roomCode).emit('gameUpdated', { gameState: serializeState(newState) });
  });

  // Handle rematch request
  socket.on('rematch', () => {
    const roomCode = socket.data.roomCode;
    const state = rooms[roomCode];

    if (!state || state.status !== 'finished') return;

    const newState = resetGame(state);
    rooms[roomCode] = newState;

    console.log(`Rematch in room ${roomCode}`);
    io.to(roomCode).emit('gameStarted', { gameState: serializeState(newState) });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const roomCode = socket.data.roomCode;
    const playerRole = socket.data.playerRole;

    console.log(`Client disconnected: ${socket.id} from room ${roomCode}`);

    if (!roomCode || !rooms[roomCode]) return;

    const state = rooms[roomCode];

    if (state.status === 'playing' || state.status === 'waiting') {
      // Notify the other player
      socket.to(roomCode).emit('playerDisconnected', {
        playerName: state.players[playerRole]?.name || 'Opponent'
      });

      // Clean up the room after a short delay
      setTimeout(() => {
        if (rooms[roomCode]) {
          delete rooms[roomCode];
          console.log(`Room ${roomCode} cleaned up`);
        }
      }, 5000);
    }
  });
});

app.get('/', (req, res) => res.json({ status: 'ok', app: 'dames-africa-server' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

server.listen(PORT, () => {
  console.log(`Checkers server running on http://localhost:${PORT}`);
});
