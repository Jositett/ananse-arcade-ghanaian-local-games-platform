import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Token, getGridCoords, isCellBlocked } from '@/lib/game-logic/ludo-engine';
import { useGameStore } from '@/store/game-store';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, Zap, Swords, RotateCcw, Shield } from 'lucide-react';
interface LudoTokenProps {
  token: Token;
  indexInBase: number;
  isValidMove: boolean;
  isSelected: boolean;
}
export const LudoToken = ({ token, indexInBase, isValidMove, isSelected }: LudoTokenProps) => {
  const selectLudoToken = useGameStore(s => s.selectLudoToken);
  const ludoValidMoves = useGameStore(s => s.ludo.validMoves);
  const executeMove = useGameStore(s => s.executeLudoMove);
  const allTokens = useGameStore(s => s.ludo.tokens);
  const coords = getGridCoords(token, indexInBase);
  const top = (coords[0] / 15) * 100;
  const left = (coords[1] / 15) * 100;
  const cellSize = 100 / 15;
  const samePosTokens = allTokens.filter(t => t.position === token.position && token.position !== -1);
  const isBlocked = isCellBlocked(allTokens, token.position);
  const stackOffset = token.position === -1 ? 0 : (indexInBase % 4) * 2;
  const colorMap = {
    red: 'bg-red-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-400',
    blue: 'bg-blue-500'
  };
  const tokenMoves = ludoValidMoves.filter(m => m.tokenId === token.id);
  const isTopEdge = coords[0] < 4;
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
        zIndex: isSelected ? 100 : (isValidMove ? 80 : 20 + indexInBase),
        padding: '2px',
        transform: token.position !== -1 ? `translate(${stackOffset}px, ${stackOffset}px)` : 'none'
      }}
      className="pointer-events-none"
    >
      <motion.button
        onClick={() => isValidMove && selectLudoToken(token.id)}
        animate={isValidMove ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className={cn(
          "w-full h-full rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] pointer-events-auto cursor-pointer flex items-center justify-center transition-all",
          colorMap[token.color],
          isBlocked && "border-dashed border-4",
          isValidMove ? "ring-2 ring-white scale-110 z-10" : "opacity-90",
          isSelected && "ring-black ring-offset-4 ring-2"
        )}
      >
        <div className="w-1/2 h-1/2 rounded-full border-2 border-black/20 bg-white/30 flex items-center justify-center">
          {isBlocked ? <Shield className="w-3 h-3 text-black" /> : null}
        </div>
      </motion.button>
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: isTopEdge ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto z-[200]",
              isTopEdge ? "top-12" : "-top-16"
            )}
          >
            {tokenMoves.map((m, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); executeMove(m); }}
                className={cn(
                  "w-12 h-12 rounded-xl border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none",
                  m.direction === 'bounce' ? "bg-purple-500 text-white" :
                  m.direction === 'backward' ? "bg-yellow-300" :
                  m.isKick ? "bg-gradient-to-br from-red-500 to-orange-500 text-white" : "bg-green-400"
                )}
              >
                {m.direction === 'bounce' ? (
                  <RotateCcw size={18} />
                ) : m.direction === 'backward' ? (
                  <ArrowLeft size={18} />
                ) : m.isKick ? (
                  <Zap size={18} />
                ) : (
                  <ArrowRight size={18} />
                )}
                <span className="text-[7px] font-black uppercase mt-0.5">
                  {m.direction === 'bounce' ? 'Bnc' : m.direction === 'backward' ? 'Bck' : m.isKick ? 'Zap' : 'Go'}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};