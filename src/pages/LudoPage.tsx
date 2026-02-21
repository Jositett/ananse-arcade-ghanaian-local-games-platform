import React from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { useGameStore } from '@/store/game-store';
import { NeoButton, NeoCard } from '@/components/ui/neo-primitives';
import { Dice6 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LudoToken } from '@/components/game/LudoToken';
import { WinnerModal } from '@/components/game/GameModals';
export function LudoPage() {
  const diceRoll = useGameStore(s => s.ludo.diceRoll);
  const isRolling = useGameStore(s => s.ludo.isRolling);
  const rollDice = useGameStore(s => s.rollDice);
  const currentPlayer = useGameStore(s => s.ludo.currentPlayer);
  const tokens = useGameStore(s => s.ludo.tokens);
  const validMoveIds = useGameStore(s => s.ludo.validMoveIds);
  const getCellClass = (r: number, c: number) => {
    // Basic coloring for paths
    if (r === 7 && c > 0 && c < 6) return 'bg-red-400';
    if (c === 7 && r > 0 && r < 6) return 'bg-green-500';
    if (r === 7 && c > 8 && c < 14) return 'bg-yellow-400';
    if (c === 7 && r > 8 && r < 14) return 'bg-blue-500';
    // Safety & Starts
    if ((r === 6 && c === 1) || (r === 8 && c === 2)) return 'bg-red-200';
    if ((r === 1 && c === 8) || (r === 2 && c === 6)) return 'bg-green-200';
    return 'bg-white';
  };
  return (
    <GameLayout title="Ludo Arena">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="relative aspect-square w-full max-w-[600px] bg-black p-1 rounded-xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] grid grid-cols-15 grid-rows-15 gap-px">
            {Array.from({ length: 15 * 15 }).map((_, i) => {
              const r = Math.floor(i / 15);
              const c = i % 15;
              const isBase = (r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6) || (r > 8 && c > 8);
              const isHome = r >= 6 && r <= 8 && c >= 6 && c <= 8;
              return (
                <div 
                  key={i} 
                  className={`
                    ${isBase ? 'opacity-30' : ''} 
                    ${isHome ? 'bg-black' : getCellClass(r, c)}
                    border-[0.5px] border-black/10
                  `}
                />
              );
            })}
            <AnimatePresence>
              {tokens.map((token, idx) => (
                <LudoToken 
                  key={token.id} 
                  token={token} 
                  indexInBase={idx % 4}
                  isValidMove={validMoveIds.includes(token.id)} 
                />
              ))}
            </AnimatePresence>
          </div>
          <div className="w-full lg:w-80 space-y-6">
            <NeoCard className="p-6">
              <h3 className="text-xl font-black uppercase mb-4">Turn</h3>
              <div className="flex items-center gap-3 mb-6 p-3 rounded-lg border-2 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <div className={`w-8 h-8 rounded-full border-2 border-black ${
                  currentPlayer === 'red' ? 'bg-red-500' :
                  currentPlayer === 'green' ? 'bg-green-500' :
                  currentPlayer === 'blue' ? 'bg-blue-500' : 'bg-yellow-400'
                }`} />
                <span className="font-black text-xl uppercase">{currentPlayer}</span>
              </div>
              <div className="flex flex-col items-center gap-4 p-6 bg-[#FFFDF5] rounded-xl border-4 border-black">
                <motion.div
                  animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: isRolling ? Infinity : 0, duration: 0.2 }}
                  className="bg-white w-20 h-20 flex items-center justify-center border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                >
                  {diceRoll ? <span className="text-5xl font-black">{diceRoll}</span> : <Dice6 className="w-12 h-12" />}
                </motion.div>
                <NeoButton
                  onClick={rollDice}
                  disabled={isRolling || diceRoll !== null || (useGameStore.getState().gameMode === 'pvc' && currentPlayer !== 'red')}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 py-6 text-2xl"
                >
                  ROLL
                </NeoButton>
              </div>
            </NeoCard>
          </div>
        </div>
      </div>
      <WinnerModal />
    </GameLayout>
  );
}