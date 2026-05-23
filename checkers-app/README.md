# International Draughts — Real-time Multiplayer (10×10)

A full-stack multiplayer Checkers (Jeu de Dames International) app built with React, Node.js, Express, and Socket.io.

## Prerequisites

- [Node.js 18+](https://nodejs.org/) — download and install from nodejs.org

## Setup

```bash
# 1. Install root dependencies (Express, Socket.io, concurrently)
cd checkers-app
npm install

# 2. Install client dependencies (React, react-scripts, socket.io-client)
cd client
npm install
cd ..

# 3. Run both server and client together
npm run dev
```

- Client: http://localhost:3000
- Server: http://localhost:3001

## How to Play

1. Open http://localhost:3000 in two browser tabs (or two different browsers/devices on the same network)
2. In Tab 1: enter your name → **Create Room** → you get a 6-character code
3. In Tab 2: enter your name → **Join Room** → paste the code
4. Game starts automatically when both players are in

## Rules (International Draughts 10×10)

- **10×10 board** — pieces only on dark squares
- **20 pieces per player** — 4 rows each
- **Normal pieces** move diagonally forward only
- **Kings (♛)** move diagonally any distance in all 4 directions
- **Capture is mandatory** — you must capture if possible
- **Maximum capture rule** — you must take the largest number of pieces possible
- **Promotion** — reaching the back row promotes to King (but sequence stops there)
- **Win** — opponent has no pieces or no legal moves

## UI Guide

| Visual | Meaning |
|--------|---------|
| Yellow/gold glow | Selected piece |
| Green dot | Valid non-capturing move |
| Red dot | Valid capture destination |
| ♛ crown | King piece |
| Gold border on player card | Current player's turn |

## Project Structure

```
checkers-app/
├── server/
│   ├── index.js        # Express + Socket.io server (port 3001)
│   └── gameLogic.js    # Game rules engine
├── client/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx           # Main app + socket event handling
│   │   ├── App.css           # All styles
│   │   ├── socket.js         # Socket.io client instance
│   │   └── components/
│   │       ├── Board.jsx     # 10×10 board + interaction logic
│   │       ├── Cell.jsx      # Individual cell with piece/dot
│   │       ├── Piece.jsx     # Piece with king crown
│   │       ├── Lobby.jsx     # Create/join room screen
│   │       └── GameInfo.jsx  # Scores, turn indicator, timer
│   └── package.json
└── package.json
```

## Socket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `createRoom` | Client → Server | `{ playerName }` |
| `roomCreated` | Server → Client | `{ roomCode, playerRole, gameState }` |
| `joinRoom` | Client → Server | `{ roomCode, playerName }` |
| `roomJoined` | Server → Client | `{ roomCode, playerRole, gameState }` |
| `gameStarted` | Server → All | `{ gameState }` |
| `movePiece` | Client → Server | `{ pieceId, toRow, toCol }` |
| `gameUpdated` | Server → All | `{ gameState }` |
| `rematch` | Client → Server | — |
| `playerDisconnected` | Server → Client | `{ playerName }` |
| `error` | Server → Client | `{ message }` |
