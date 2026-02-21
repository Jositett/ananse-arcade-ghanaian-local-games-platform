import React from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { useGameStore } from '@/store/game-store';
import { NeoCard, NeoBadge } from '@/components/ui/neo-primitives';
import { motion } from 'framer-motion';
export function OwarePage() {
  const pits = useGameStore(s => s.oware.pits);
  const captured = useGameStore(s => s.oware.captured);
  const currentPlayer = useGameStore(s => s.oware.currentPlayer);
  const playPit = useGameStore(s => s.playOwarePit);
  const renderPit = (index: number) => {
    const isClickable = (currentPlayer === 0 && index < 6) || (currentPlayer === 1 && index >= 6);
    return (
      <motion.div
        key={index}
        whileHover={isClickable ? { scale: 1.05 } : {}}
        onClick={() => isClickable && playPit(index)}
        className={`aspect-square rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative cursor-pointer
          ${isClickable ? 'bg-yellow-100 hover:bg-yellow-200' : 'bg-gray-100'}
        `}
      >
        <span className="text-2xl font-black">{pits[index]}</span>
        <div className="absolute -top-3 -right-3">
          <NeoBadge className="bg-white text-[10px]">{index + 1}</NeoBadge>
        </div>
      </motion.div>
    );
  };
  return (
    <GameLayout title="Oware Pit">
      <div className="flex flex-col gap-12 max-w-4xl mx-auto w-full">
        {/* Score Board */}
        <div className="grid grid-cols-2 gap-8">
          <NeoCard className="p-4 bg-blue-100">
            <p className="font-black text-xs uppercase mb-1">Player 1 (Top)</p>
            <p className="text-3xl font-black">{captured[0]} Captured</p>
          </NeoCard>
          <NeoCard className="p-4 bg-red-100">
            <p className="font-black text-xs uppercase mb-1">Player 2 (Bottom)</p>
            <p className="text-3xl font-black">{captured[1]} Captured</p>
          </NeoCard>
        </div>
        {/* Oware Board */}
        <NeoCard className="bg-[#8B4513] p-8 md:p-12 border-8">
           <div className="space-y-12">
             {/* Player 2 Row (Top) - Reversed */}
             <div className="grid grid-cols-6 gap-4">
                {[11, 10, 9, 8, 7, 6].map(renderPit)}
             </div>
             <div className="h-4 bg-black/20 rounded-full" />
             {/* Player 1 Row (Bottom) */}
             <div className="grid grid-cols-6 gap-4">
                {[0, 1, 2, 3, 4, 5].map(renderPit)}
             </div>
           </div>
        </NeoCard>
        <div className="text-center">
          <NeoBadge className={`text-xl px-8 py-4 ${currentPlayer === 0 ? 'bg-blue-400' : 'bg-red-400'}`}>
            {currentPlayer === 0 ? "Player 1's Turn" : "Player 2's Turn"}
          </NeoBadge>
        </div>
      </div>
    </GameLayout>
  );
}