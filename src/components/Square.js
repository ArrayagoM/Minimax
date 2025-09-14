import React from 'react';
import './Square.css';
import { motion } from 'framer-motion';

const pieceVariants = {
  hidden: { scale: 0.2, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

const Square = ({ value, onClick, isWinningSquare }) => {
  const valueClass = value === 'X' ? 'value-x' : 'value-o';
  const highlightClass = isWinningSquare ? 'winning-square' : '';

  return (
    <motion.button
      className={`square ${highlightClass}`}
      onClick={onClick}
      whileHover={{ scale: 1.05, backgroundColor: '#16213e' }}
      whileTap={{ scale: 0.95 }}
    >
      {value && (
        <motion.span
          className={valueClass}
          variants={pieceVariants}
          initial="hidden"
          animate="visible"
          key={value}
        >
          {value}
        </motion.span>
      )}
    </motion.button>
  );
};

export default Square;
