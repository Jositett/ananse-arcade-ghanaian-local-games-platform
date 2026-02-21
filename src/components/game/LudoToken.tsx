import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Token, getGridCoords } from '@/lib/game-logic/ludo-engine';
import { useGameStore } from '@/store/game-store';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';
interface LudoTokenProps {
  token: Token;
  indexInBase: number;
  isValidMove: boolean;
  isSelected: boolean;
}
export const LudoToken = ({ token, indexInBase, isValidMove, isSelected }: LudoTokenProps) => {
  const selectLudoToken = useGameStore(s => s.selectLudoToken);
  const validMoves = useGameStore(s => s.ludo.validMoves);
  const executeMove = useGameStore(s => s.executeLudoMove);
  const coords = getGridCoords(token, indexInBase);
  const top = (coords[0] / 15) * 100;
  const left = (coords[1] / 15) * 100;
  const cellSize = 100 / 15;
  const colorMap = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-500'
  };
  const tokenMoves = validMoves.filter(m => m.tokenId === token.id);
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
        zIndex: isSelected ? 100 : (isValidMove ? 50 : 20),
        padding: '2px'
      }}
      className="pointer-events-none"
    >
      <motion.button
        onClick={() => isValidMove && selectLudoToken(token.id)}
        animate={isValidMove ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
        transition={{ repeat: Infinity, duration: 1 }}
        className={cn(
          "w-full h-full rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] pointer-events-auto cursor-pointer flex items-center justify-center transition-all",
          colorMap[token.color],
          isValidMove ? "ring-4 ring-white ring-offset-2 ring-offset-black scale-110" : "opacity-90",
          isSelected && "ring-black ring-offset-4"
        )}
      >
        <div className="w-1/2 h-1/2 rounded-full border-2 border-black/20 bg-white/30" />
      </motion.button>
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute -top-16 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto z-[200]"
          >
            {tokenMoves.map((m, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); executeMove(m); }}
                className={cn(
                  "w-12 h-12 rounded-xl border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center transition-transform active:scale-90",
                  m.isKick ? "bg-red-500 text-white" : 
                  m.direction === 'forward' ? "bg-green-400" : "bg-yellow-400"
                )}
              >
                {m.isKick ? <Zap size={20} /> : m.direction === 'forward' ? <ArrowRight size={20} /> : <ArrowLeft size={20} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};