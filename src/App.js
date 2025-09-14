// src/App.js (REEMPLAZAR TODO)

import React, { useState, useEffect } from 'react';
import Board from './components/Board';
// Importamos AMBAS lógicas de IA
import {
  checkWinner as checkWinner3x3,
  findBestMove as findBestMove3x3,
} from './logic/minimax_3x3';
import { checkWinner6x6, findBestMove6x6 } from './logic/ai_6x6';

import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

const PLAYER_X = 'X';
const PLAYER_O = 'O';

// Configuración de los modos de juego
const gameModes = {
  '3x3': {
    size: 3,
    squares: 9,
    checkWinner: checkWinner3x3,
    findBestMove: findBestMove3x3,
  },
  '6x6': {
    size: 6,
    squares: 36, // 6x6
    checkWinner: checkWinner6x6,
    findBestMove: findBestMove6x6,
  },
};

const createInitialBoardState = (squares) => ({
  board: Array(squares).fill(null),
  currentPlayer: PLAYER_X,
  winnerInfo: { winner: null, line: null },
});

// Componente Selector de Jugador (igual que antes)
const PlayerSelector = ({ onSelect }) => (
  <motion.div
    className="player-selection-screen"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <h2>Elige tu lado:</h2>
    <div className="player-buttons">
      <button className="player-button" onClick={() => onSelect(PLAYER_X)}>
        <span className="value-x">{PLAYER_X}</span>
      </button>
      <button className="player-button" onClick={() => onSelect(PLAYER_O)}>
        <span className="value-o">{PLAYER_O}</span>
      </button>
    </div>
  </motion.div>
);

// --- Componente Principal ---
function App() {
  const [gameMode, setGameMode] = useState('3x3'); // Estado para el modo (3x3 o 6x6)
  const [humanPlayer, setHumanPlayer] = useState(null); // Estado para X o O

  const currentModeConfig = gameModes[gameMode];
  const [gameState, setGameState] = useState(createInitialBoardState(currentModeConfig.squares));

  const { board, currentPlayer, winnerInfo } = gameState;
  const aiPlayer = humanPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;

  // El tablero está bloqueado si es turno de la IA o si hay un ganador
  const isBoardLocked = (currentPlayer === aiPlayer && !winnerInfo.winner) || winnerInfo.winner;

  // --- LÓGICA DE LA IA (Se activa cuando es turno de la IA) ---
  useEffect(() => {
    // Solo corre si el juego empezó Y es el turno de la IA Y no hay ganador
    if (humanPlayer !== null && currentPlayer === aiPlayer && !winnerInfo.winner) {
      const thinkTimer = setTimeout(() => {
        const boardCopy = [...board];

        // ¡¡AQUÍ ESTÁ LA MAGIA!!
        // Llama a la función 'findBestMove' correcta BASADA EN EL MODO DE JUEGO
        const bestMoveIndex = currentModeConfig.findBestMove(boardCopy, aiPlayer, humanPlayer);

        if (bestMoveIndex !== -1) {
          const newBoard = [...board];
          newBoard[bestMoveIndex] = aiPlayer;
          const newWinnerInfo = currentModeConfig.checkWinner(newBoard);

          setGameState({
            board: newBoard,
            winnerInfo: newWinnerInfo,
            currentPlayer: humanPlayer, // Devuelve turno al humano
          });
        }
      }, 150); // Delay corto para respuesta

      return () => clearTimeout(thinkTimer);
    }
  }, [currentPlayer, winnerInfo.winner, board, humanPlayer, aiPlayer, currentModeConfig]);

  // --- MANEJADORES DE JUEGO ---

  const handleHumanPlay = (index) => {
    if (board[index] || isBoardLocked) {
      return;
    }
    const newBoard = [...board];
    newBoard[index] = humanPlayer;
    const newWinnerInfo = currentModeConfig.checkWinner(newBoard); // Usa el checker del modo actual

    setGameState({
      board: newBoard,
      winnerInfo: newWinnerInfo,
      currentPlayer: aiPlayer, // Pasa turno a la IA
    });
  };

  const startGame = (selectedPlayer) => {
    setHumanPlayer(selectedPlayer);
    setGameState(createInitialBoardState(currentModeConfig.squares));
  };

  const resetBoard = () => {
    setGameState(createInitialBoardState(currentModeConfig.squares));
  };

  // Vuelve a la pantalla de selección de X/O
  const changeSide = () => {
    setHumanPlayer(null);
  };

  // Cambia el MODO (3x3 o 6x6) y resetea todo
  const selectGameMode = (mode) => {
    setGameMode(mode);
    setHumanPlayer(null); // Fuerza a seleccionar jugador de nuevo
    setGameState(createInitialBoardState(gameModes[mode].squares));
  };

  // --- MENSAJES DE ESTADO (UI) ---
  const getStatusMessage = () => {
    const { winner } = winnerInfo;
    if (winner === 'Draw') return { text: '¡EMPATE!', className: 'status-draw' };
    if (winner === humanPlayer)
      return { text: '¡GANASTE!', className: `status-winner-${humanPlayer === 'X' ? 'X' : 'O'}` };
    if (winner === aiPlayer)
      return { text: '¡IA GANA!', className: `status-winner-${aiPlayer === 'X' ? 'X' : 'O'}` };
    if (currentPlayer === humanPlayer) return { text: 'TU TURNO', className: '' };
    return { text: 'IA PENSANDO...', className: '' };
  };

  const status = getStatusMessage();

  // --- RENDERIZADO ---
  return (
    <div className="App">
      <motion.h1
        className="game-title"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        TA-TE-TI <span>COMPETENTE</span>
      </motion.h1>

      {/* Si el juego ya empezó, muestra el botón de cambiar lado */}
      {humanPlayer && !winnerInfo.winner && (
        <button className="change-side-button" onClick={changeSide}>
          Elegir Lado
        </button>
      )}

      {/* Si NO se ha elegido jugador, muestra los selectores */}
      {!humanPlayer && (
        <motion.div
          className="mode-selection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            className={`mode-button ${gameMode === '3x3' ? 'active' : ''}`}
            onClick={() => selectGameMode('3x3')}
          >
            3x3 (Imbatible)
          </button>
          <button
            className={`mode-button ${gameMode === '6x6' ? 'active' : ''}`}
            onClick={() => selectGameMode('6x6')}
          >
            6x6 (Heurístico)
          </button>
        </motion.div>
      )}

      {/* RENDERIZADO CONDICIONAL: SELECCIÓN DE JUGADOR O TABLERO */}
      {!humanPlayer ? (
        <PlayerSelector onSelect={startGame} />
      ) : (
        <motion.div key={gameMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AnimatePresence mode="wait">
            <motion.h2
              key={status.text}
              className={`status-message ${status.className}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {status.text}
            </motion.h2>
          </AnimatePresence>

          <Board
            squares={board}
            onClick={handleHumanPlay}
            winningLine={winnerInfo.line}
            boardSize={currentModeConfig.size} // ¡Pasamos el tamaño al tablero!
          />

          <AnimatePresence>
            {winnerInfo.winner && (
              <motion.button
                className="reset-button"
                onClick={resetBoard}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.5 }}
              >
                Jugar de Nuevo
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <div className="tiktok-footer">
        Modo Actual: {gameMode === '3x3' ? 'Solver Perfecto' : 'IA Heurística (6x6)'}
      </div>
    </div>
  );
}

export default App;
