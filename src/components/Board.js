// src/components/Board.js (REEMPLAZAR)
import React from 'react';
import Square from './Square';
import './Board.css';

// El tablero ahora es dinámico
const Board = ({ squares, onClick, winningLine, boardSize }) => {
  
  // Define las propiedades CSS basadas en el tamaño del tablero
  const boardStyle = {
    '--grid-size': boardSize,
    '--cell-size': boardSize === 3 ? '150px' : '80px', // Celdas más pequeñas para 6x6
    '--cell-gap': boardSize === 3 ? '10px' : '5px',
  };

  const renderSquare = (i) => {
    const isWinningSquare = winningLine && winningLine.includes(i);
    
    return (
      <Square
        key={i}
        value={squares[i]}
        onClick={() => onClick(i)}
        isWinningSquare={isWinningSquare}
      />
    );
  };

  const boardRows = [];
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      boardRows.push(renderSquare(row * boardSize + col));
    }
  }

  // Nota: Eliminamos el 'board-row' div wrapper ya que grid se encarga de todo
  return (
    <div className="board" style={boardStyle}>
      {boardRows}
    </div>
  );
};

export default Board;