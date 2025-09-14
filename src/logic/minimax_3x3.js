/**
 * @param {Array} board
 * @param {string} aiPlayerSymbol
 * @param {string} humanPlayerSymbol
 */
export function findBestMove(board, aiPlayerSymbol) {
  const humanPlayerSymbol = aiPlayerSymbol === 'X' ? 'O' : 'X';
  let bestScore = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = aiPlayerSymbol;
      let score = minimax(board, 0, false, -Infinity, Infinity, aiPlayerSymbol, humanPlayerSymbol);
      board[i] = null;

      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function minimax(
  currentBoard,
  depth,
  isMaximizing,
  alpha,
  beta,
  aiPlayerSymbol,
  humanPlayerSymbol
) {
  const winnerInfo = checkWinner(currentBoard);

  if (winnerInfo.winner) {
    if (winnerInfo.winner === aiPlayerSymbol) {
      return 10 - depth;
    } else if (winnerInfo.winner === humanPlayerSymbol) {
      return depth - 10;
    }
  }

  if (!hasEmptySquares(currentBoard)) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = aiPlayerSymbol;
        let score = minimax(
          currentBoard,
          depth + 1,
          false,
          alpha,
          beta,
          aiPlayerSymbol,
          humanPlayerSymbol
        );
        currentBoard[i] = null;

        bestScore = Math.max(score, bestScore);
        alpha = Math.max(alpha, bestScore);
        if (beta <= alpha) {
          break;
        }
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = humanPlayerSymbol;
        let score = minimax(
          currentBoard,
          depth + 1,
          true,
          alpha,
          beta,
          aiPlayerSymbol,
          humanPlayerSymbol
        );
        currentBoard[i] = null;

        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, bestScore);
        if (beta <= alpha) {
          break;
        }
      }
    }
    return bestScore;
  }
}

function hasEmptySquares(board) {
  return board.some((square) => square === null);
}

export function checkWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }

  if (!hasEmptySquares(squares)) {
    return { winner: 'Draw', line: null };
  }

  return { winner: null, line: null };
}
