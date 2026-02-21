import React from 'react';
import { motion } from 'framer-motion';
import { Token, getGridCoords } from '@/lib/game-logic/ludo-engine';
import { useGameStore } from '@/store/game-store';
import { cn } from '@/lib/utils';
interface LudoTokenProps {
  token: Token;
  indexInBase: number;
  isValidMove: boolean;
}
export const LudoToken = ({ token, indexInBase, isValidMove }: LudoTokenProps) => {
  const moveTokenAction = useGameStore(s => s.moveLudoToken);
  const coords = getGridCoords(token, indexInBase);
  // Convert 15x15 coords to percentage positions
  const top = (coords[0] / 15) * 100;
  const left = (coords[1] / 15) * 100;
  const cellSize = 100 / 15;
  const colorMap = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-500'
  };
  return (
    <motion.div
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ 
        position: 'absolute', 
        top: `${top}%`, 
        left: `${left}%`, 
        width: `${cellSize}%`, 
        height: `${cellSize}%`,
        zIndex: isValidMove ? 50 : 20,
        padding: '2px'
      }}
      className="pointer-events-none"
    >
      <motion.button
        onClick={() => isValidMove && moveTokenAction(token.id)}
        animate={isValidMove ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
        className={cn(
          "w-full h-full rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] pointer-events-auto cursor-pointer flex items-center justify-center transition-all",
          colorMap[token.color],
          isValidMove ? "ring-4 ring-white ring-offset-2 ring-offset-black z-50 scale-110" : "opacity-90"
        )}
      >
        <div className="w-1/2 h-1/2 rounded-full border-2 border-black/20 bg-white/30" />
      </motion.button>
    </motion.div>
  );
};