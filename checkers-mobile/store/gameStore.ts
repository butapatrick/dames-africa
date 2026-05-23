import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAX_HISTORY_ENTRIES } from '../constants/config';

export type PlayerRole = 'player1' | 'player2';
export type GameStatus = 'waiting' | 'playing' | 'finished';
export type NavState = 'lobby' | 'waiting' | 'game';

export interface Piece {
  id: string;
  player: PlayerRole;
  row: number;
  col: number;
  isKing: boolean;
}

export interface Move {
  path: [number, number][];
  captured: string[];
}

export interface GameState {
  board: (string | null)[][];
  pieces: Record<string, Piece>;
  currentTurn: PlayerRole;
  players: {
    player1: { name: string; socketId: string } | null;
    player2: { name: string; socketId: string } | null;
  };
  validMoves: Record<string, Move[]>;
  status: GameStatus;
  winner: PlayerRole | null;
  scores: { player1: number; player2: number };
  turnStartTime: number | null;
}

export interface GameRecord {
  date: string;
  opponentName: string;
  result: 'win' | 'loss';
  roomCode: string;
}

interface GameStore {
  navState: NavState;
  gameState: GameState | null;
  playerRole: PlayerRole | null;
  roomCode: string;
  playerName: string;
  error: string;
  disconnectMessage: string;
  gameHistory: GameRecord[];

  setNavState: (s: NavState) => void;
  setGameState: (s: GameState) => void;
  setPlayerRole: (r: PlayerRole) => void;
  setRoomCode: (c: string) => void;
  setPlayerName: (n: string) => void;
  setError: (e: string) => void;
  setDisconnectMessage: (m: string) => void;
  addGameRecord: (r: GameRecord) => Promise<void>;
  loadGameHistory: () => Promise<void>;
  reset: () => void;
}

const HISTORY_KEY = '@dames_africa_history';

export const useGameStore = create<GameStore>()((set, get) => ({
  navState: 'lobby',
  gameState: null,
  playerRole: null,
  roomCode: '',
  playerName: '',
  error: '',
  disconnectMessage: '',
  gameHistory: [],

  setNavState: (navState) => set({ navState }),
  setGameState: (gameState) => set({ gameState }),
  setPlayerRole: (playerRole) => set({ playerRole }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setPlayerName: (playerName) => set({ playerName }),
  setError: (error) => set({ error }),
  setDisconnectMessage: (disconnectMessage) => set({ disconnectMessage }),

  addGameRecord: async (record) => {
    const history = [record, ...get().gameHistory].slice(0, MAX_HISTORY_ENTRIES);
    set({ gameHistory: history });
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {}
  },

  loadGameHistory: async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) set({ gameHistory: JSON.parse(stored) });
    } catch {}
  },

  reset: () =>
    set({
      navState: 'lobby',
      gameState: null,
      playerRole: null,
      roomCode: '',
      error: '',
      disconnectMessage: '',
    }),
}));
