import { io, Socket } from 'socket.io-client';
import { SERVER_URL } from '../constants/config';
import { useGameStore } from '../store/gameStore';

let socket: Socket | null = null;
let initialized = false;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
      // Start with polling so browsers behind strict proxies can still connect,
      // then upgrade to WebSocket once the connection is established.
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });
  }
  return socket;
}

/**
 * Called once at app startup from _layout.tsx.
 * Sets up all socket listeners that update the Zustand store.
 * Using getState() instead of hooks so listeners are stable across navigations.
 */
export function initSocket() {
  if (initialized) return;
  initialized = true;

  const s = getSocket();
  s.connect();

  s.on('connect_error', () => {
    useGameStore.getState().setError('Cannot connect to server. Check your connection.');
  });

  s.on('connect', () => {
    useGameStore.getState().setError('');
  });

  s.on('roomCreated', ({ roomCode, playerRole, gameState }) => {
    const store = useGameStore.getState();
    store.setRoomCode(roomCode);
    store.setPlayerRole(playerRole);
    store.setGameState(gameState);
    store.setError('');
    store.setNavState('waiting');
  });

  s.on('roomJoined', ({ roomCode, playerRole, gameState }) => {
    const store = useGameStore.getState();
    store.setRoomCode(roomCode);
    store.setPlayerRole(playerRole);
    store.setGameState(gameState);
    store.setError('');
    // gameStarted fires immediately after from server, triggering nav to 'game'
  });

  s.on('gameStarted', ({ gameState }) => {
    const store = useGameStore.getState();
    store.setGameState(gameState);
    store.setDisconnectMessage('');
    store.setNavState('game');
  });

  s.on('gameUpdated', ({ gameState }) => {
    useGameStore.getState().setGameState(gameState);
  });

  s.on('playerDisconnected', ({ playerName }) => {
    useGameStore.getState().setDisconnectMessage(`${playerName} disconnected. Room closing.`);
  });

  s.on('error', ({ message }: { message: string }) => {
    useGameStore.getState().setError(message);
  });
}

export function createRoom(playerName: string) {
  getSocket().emit('createRoom', { playerName });
}

export function joinRoom(roomCode: string, playerName: string) {
  getSocket().emit('joinRoom', { roomCode, playerName });
}

export function movePiece(pieceId: string, toRow: number, toCol: number) {
  getSocket().emit('movePiece', { pieceId, toRow, toCol });
}

export function requestRematch() {
  getSocket().emit('rematch');
}

export function reconnectSocket() {
  const s = getSocket();
  s.disconnect();
  initialized = false;
  // Reset so a fresh connection is made on next initSocket call
  socket = null;
  initialized = false;
}
