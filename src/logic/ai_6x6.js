// src/logic/ai_6x6.js

const GRID_SIZE = 6;
const WIN_STREAK = 4; // 4 en raya para ganar
const MAX_DEPTH = 4; // Profundidad de búsqueda. 4 es rápido. 5 es más inteligente pero lento.

// --- 1. FUNCIÓN DE EVALUACIÓN HEURÍSTICA ---
// Esta es la parte más importante. Escanea "ventanas" de 4 casillas.
function evaluateWindow(window, playerSymbol, opponentSymbol) {
  let score = 0;
  let playerCount = 0;
  let opponentCount = 0;
  let emptyCount = 0;

  for (const piece of window) {
    if (piece === playerSymbol) playerCount++;
    else if (piece === opponentSymbol) opponentCount++;
    else emptyCount++;
  }

  // Esta heurística asigna puntuaciones a las ventanas de 4
  if (playerCount === 4) {
    score += 100000; // ¡Victoria!
  } else if (playerCount === 3 && emptyCount === 1) {
    score += 5000; // Gran amenaza (3 abiertos)
  } else if (playerCount === 2 && emptyCount === 2) {
    score += 50; // Amenaza menor (2 abiertos)
  }

  // Hace lo mismo para el oponente, pero RESTA la puntuación
  if (opponentCount === 4) {
    score -= 100000; // ¡Derrota inminente! (Bloqueo crítico)
  } else if (opponentCount === 3 && emptyCount === 1) {
    score -= 5000; // ¡Amenaza crítica del oponente!
  } else if (opponentCount === 2 && emptyCount === 2) {
    score -= 50;
  }
  
  return score;
}

// Función principal de puntuación del tablero
function scorePosition(board, playerSymbol, opponentSymbol) {
  let totalScore = 0;

  // Evaluar filas horizontales
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c <= GRID_SIZE - WIN_STREAK; c++) {
      const window = board.slice(r * GRID_SIZE + c, r * GRID_SIZE + c + WIN_STREAK);
      totalScore += evaluateWindow(window, playerSymbol, opponentSymbol);
    }
  }

  // Evaluar columnas verticales
  for (let c = 0; c < GRID_SIZE; c++) {
    for (let r = 0; r <= GRID_SIZE - WIN_STREAK; r++) {
      const window = [];
      for (let i = 0; i < WIN_STREAK; i++) window.push(board[(r + i) * GRID_SIZE + c]);
      totalScore += evaluateWindow(window, playerSymbol, opponentSymbol);
    }
  }

  // Evaluar diagonales (positivas /)
  for (let r = 0; r <= GRID_SIZE - WIN_STREAK; r++) {
    for (let c = 0; c <= GRID_SIZE - WIN_STREAK; c++) {
      const window = [];
      for (let i = 0; i < WIN_STREAK; i++) window.push(board[(r + i) * GRID_SIZE + (c + i)]);
      totalScore += evaluateWindow(window, playerSymbol, opponentSymbol);
    }
  }

  // Evaluar diagonales (negativas \)
  for (let r = 0; r <= GRID_SIZE - WIN_STREAK; r++) {
    for (let c = WIN_STREAK - 1; c < GRID_SIZE; c++) {
      const window = [];
      for (let i = 0; i < WIN_STREAK; i++) window.push(board[(r + i) * GRID_SIZE + (c - i)]);
      totalScore += evaluateWindow(window, playerSymbol, opponentSymbol);
    }
  }

  return totalScore;
}


// --- 2. VERIFICADOR DE GANADOR (CHECKWINNER 6x6) ---
// (Esta lógica es similar a la heurística, pero solo busca 4 exactos)
export function checkWinner6x6(board) {
  const checkLine = (a, b, c, d) => {
    return (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] === board[d]);
  };

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (c <= GRID_SIZE - WIN_STREAK) { // Horizontal
        const i = r * GRID_SIZE + c;
        if (checkLine(i, i + 1, i + 2, i + 3)) return { winner: board[i], line: [i, i + 1, i + 2, i + 3] };
      }
      if (r <= GRID_SIZE - WIN_STREAK) { // Vertical
        const i = r * GRID_SIZE + c;
        if (checkLine(i, i + GRID_SIZE, i + 2 * GRID_SIZE, i + 3 * GRID_SIZE)) return { winner: board[i], line: [i, i + GRID_SIZE, i + 2 * GRID_SIZE, i + 3 * GRID_SIZE] };
      }
      if (r <= GRID_SIZE - WIN_STREAK && c <= GRID_SIZE - WIN_STREAK) { // Diag \
        const i = r * GRID_SIZE + c;
        const line = [i, i + GRID_SIZE + 1, i + 2 * GRID_SIZE + 2, i + 3 * GRID_SIZE + 3];
        if (checkLine(...line)) return { winner: board[i], line };
      }
      if (r <= GRID_SIZE - WIN_STREAK && c >= WIN_STREAK - 1) { // Diag /
        const i = r * GRID_SIZE + c;
        const line = [i, i + GRID_SIZE - 1, i + 2 * GRID_SIZE - 2, i + 3 * GRID_SIZE - 3];
        if (checkLine(...line)) return { winner: board[i], line };
      }
    }
  }
  // Chequeo de empate (si no hay nulls)
  if (!board.some(s => s === null)) return { winner: 'Draw', line: null };

  return { winner: null, line: null };
}

// Devuelve una lista de movimientos válidos (casillas vacías)
function getValidMoves(board) {
  const moves = [];
  // Optimización: Solo buscar casillas adyacentes a piezas existentes
  // (Por ahora, buscaremos todas las vacías para simplicidad, pero esto se puede optimizar)
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) moves.push(i);
  }
  return moves;
}

// Chequea si el nodo es terminal (fin de juego)
function isTerminalNode(board) {
  const winnerInfo = checkWinner6x6(board);
  return winnerInfo.winner !== null;
}


// --- 3. EL ALGORITMO MINIMAX 6x6 (con Profundidad Limitada) ---

function minimax(board, depth, alpha, beta, isMaximizing, aiPlayer, humanPlayer) {
  
  const isTerminal = isTerminalNode(board);

  // --- Casos Base ---
  if (depth === 0 || isTerminal) {
    if (isTerminal) {
      const winnerInfo = checkWinner6x6(board);
      if (winnerInfo.winner === aiPlayer) return 10000000; // Prioridad máxima a ganar
      if (winnerInfo.winner === humanPlayer) return -10000000; // Prioridad máxima a evitar perder
      if (winnerInfo.winner === 'Draw') return 0;
    }
    // Si depth === 0 (límite alcanzado), usamos la HEURÍSTICA:
    return scorePosition(board, aiPlayer, humanPlayer);
  }

  const validMoves = getValidMoves(board);

  if (isMaximizing) { // Turno IA
    let value = -Infinity;
    for (const move of validMoves) {
      const newBoard = [...board];
      newBoard[move] = aiPlayer;
      value = Math.max(value, minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer, humanPlayer));
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break; // Poda Beta
    }
    return value;
  } else { // Turno Humano (Minimizador)
    let value = Infinity;
    for (const move of validMoves) {
      const newBoard = [...board];
      newBoard[move] = humanPlayer;
      value = Math.min(value, minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer, humanPlayer));
      beta = Math.min(beta, value);
      if (alpha >= beta) break; // Poda Alfa
    }
    return value;
  }
}

// --- FUNCIÓN PRINCIPAL EXPORTADA ---
export function findBestMove6x6(board, aiPlayer, humanPlayer) {
  let bestScore = -Infinity;
  let bestMove = -1;
  
  const validMoves = getValidMoves(board);
  
  // Optimización simple: Si el centro está vacío, tómalo.
  const center1 = 14; // (2,2) en 0-index 6x6
  const center2 = 21; // (3,3)
  if (board[center1] === null) return center1;
  if (board[center2] === null) return center2;


  // Iterar sobre todos los movimientos posibles
  for (const move of validMoves) {
    const newBoard = [...board];
    newBoard[move] = aiPlayer;
    // Llamamos a minimax para el oponente (Minimizador)
    let moveScore = minimax(newBoard, MAX_DEPTH, -Infinity, Infinity, false, aiPlayer, humanPlayer);

    if (moveScore > bestScore) {
      bestScore = moveScore;
      bestMove = move;
    }
  }

  return bestMove;
}