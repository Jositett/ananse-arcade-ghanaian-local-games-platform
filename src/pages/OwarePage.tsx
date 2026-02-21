import React from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { useGameStore } from '@/store/game-store';
import { NeoCard, NeoBadge } from '@/components/ui/neo-primitives';
import { motion } from 'framer-motion';
import { WinnerModal } from '@/components/game/GameModals';
export function OwarePage() {
  const pits = useGameStore(s => s.oware.pits);
  const captured = useGameStore(s => s.oware.captured);
  const currentPlayer = useGameStore(s => s.oware.currentPlayer);
  const playPit = useGameStore(s => s.playOwarePit);
  const gameMode = useGameStore(s => s.gameMode);
  const renderPit = (index: number) => {
    const isMyTurn = (currentPlayer === 0 && index < 6) || (currentPlayer === 1 && index >= 6);
    const isCPU = gameMode === 'pvc' && currentPlayer === 1;
    const isClickable = isMyTurn && !isCPU && pits[index] > 0;
    return (
      <motion.div
        key={index}
        whileHover={isClickable ? { scale: 1.05, rotate: 2 } : {}}
        whileTap={isClickable ? { scale: 0.95 } : {}}
        onClick={() => isClickable && playPit(index)}
        className={`aspect-square rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative cursor-pointer transition-colors duration-200
          ${isClickable ? 'bg-yellow-100 hover:bg-yellow-200' : 'bg-stone-200'}
        `}
      >
        <span className="text-3xl font-black">{pits[index]}</span>
        <div className="absolute -top-3 -right-3">
          <NeoBadge className="bg-white border-2">{pits[index] === 0 ? 'Empty' : 'Seeds'}</NeoBadge>
        </div>
      </motion.div>
    );
  };
  return (
    <GameLayout title="Oware Pit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <NeoCard className="p-6 bg-blue-100 border-4 border-black">
            <p className="font-black text-sm uppercase mb-1">Player 1</p>
            <p className="text-4xl font-black">{captured[0]} <span className="text-xl">Seeds</span></p>
          </NeoCard>
          <NeoCard className="p-6 bg-red-100 border-4 border-black text-right">
            <p className="font-black text-sm uppercase mb-1">{gameMode === 'pvc' ? 'CPU' : 'Player 2'}</p>
            <p className="text-4xl font-black">{captured[1]} <span className="text-xl">Seeds</span></p>
          </NeoCard>
        </div>
        <NeoCard className="bg-[#5D2E17] p-8 md:p-16 border-[12px] border-black rounded-[3rem] shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
           <div className="space-y-16">
             <div className="grid grid-cols-6 gap-6 md:gap-8">
                {[11, 10, 9, 8, 7, 6].map(renderPit)}
             </div>
             <div className="h-6 bg-black/40 rounded-full mx-10 shadow-inner" />
             <div className="grid grid-cols-6 gap-6 md:gap-8">
                {[0, 1, 2, 3, 4, 5].map(renderPit)}
             </div>
           </div>
        </NeoCard>
        <div className="flex justify-center">
          <div className={`px-12 py-6 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black text-2xl uppercase tracking-widest ${
            currentPlayer === 0 ? 'bg-blue-400' : 'bg-red-400'
          }`}>
            {currentPlayer === 0 ? "Player 1's Turn" : (gameMode === 'pvc' ? "CPU is Thinking..." : "Player 2's Turn")}
          </div>
        </div>
      </div>
      <WinnerModal />
    </GameLayout>
  );
}