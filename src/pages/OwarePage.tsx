import React, { useEffect, useState } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { useGameStore } from '@/store/game-store';
import { NeoCard, NeoBadge } from '@/components/ui/neo-primitives';
import { motion, AnimatePresence } from 'framer-motion';
import { WinnerModal, RoomInfo } from '@/components/game/GameModals';
import { cn } from '@/lib/utils';
export function OwarePage() {
  const pits = useGameStore(s => s.oware.pits);
  const captured = useGameStore(s => s.oware.captured);
  const currentPlayer = useGameStore(s => s.oware.currentPlayer);
  const playPit = useGameStore(s => s.playOwarePit);
  const gameMode = useGameStore(s => s.gameMode);
  const roomId = useGameStore(s => s.roomId);
  const localPlayerId = useGameStore(s => s.localPlayerId);
  const syncWithServer = useGameStore(s => s.syncWithServer);
  const [highlightedPit, setHighlightedPit] = useState<number | null>(null);
  useEffect(() => {
    if (gameMode === 'online' && roomId) {
      const interval = setInterval(syncWithServer, 2000);
      return () => clearInterval(interval);
    }
  }, [gameMode, roomId, syncWithServer]);
  const isMyTurn = gameMode === 'online' ? currentPlayer === localPlayerId : 
                  gameMode === 'pvc' ? currentPlayer === 0 : true;
  const renderPit = (index: number) => {
    const isPlayerPit = index < 6;
    const isLocalSlot = (localPlayerId === 0 && isPlayerPit) || (localPlayerId === 1 && !isPlayerPit);
    const isClickable = isMyTurn && isLocalSlot && pits[index] > 0;
    return (
      <motion.div
        key={index}
        whileHover={isClickable ? { scale: 1.05, y: -5 } : {}}
        whileTap={isClickable ? { scale: 0.95 } : {}}
        onClick={() => isClickable && playPit(index)}
        className={cn(
          "aspect-square rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative transition-all duration-300",
          isClickable ? "bg-yellow-100 border-yellow-500 cursor-pointer" : "bg-stone-200 grayscale-[0.5]",
          highlightedPit === index && "bg-white ring-8 ring-green-400"
        )}
      >
        <span className="text-4xl font-black">{pits[index]}</span>
        <div className="absolute -top-3 -right-3">
          <NeoBadge className={cn("bg-white border-2", pits[index] === 0 && "opacity-50")}>
            {pits[index]}
          </NeoBadge>
        </div>
      </motion.div>
    );
  };
  return (
    <GameLayout title="Oware Pit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col gap-12">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-4 items-center">
            {gameMode === 'online' && (
              <div className="bg-black text-white px-4 py-2 rounded-xl font-black text-sm uppercase">
                You are Player {localPlayerId + 1}
              </div>
            )}
            <NeoBadge className="bg-white border-4 border-black px-6 py-2">{gameMode.toUpperCase()}</NeoBadge>
          </div>
          {roomId && <RoomInfo roomId={roomId} />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <NeoCard className={cn(
            "p-6 border-4 border-black transition-all",
            currentPlayer === 0 ? "bg-blue-400 translate-y-[-4px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "bg-blue-100 opacity-60"
          )}>
            <div className="flex justify-between items-end">
              <div>
                <p className="font-black text-sm uppercase mb-1">Player 1</p>
                <p className="text-5xl font-black">{captured[0]}</p>
              </div>
              <NeoBadge className="bg-white mb-1">Seeds Captured</NeoBadge>
            </div>
          </NeoCard>
          <NeoCard className={cn(
            "p-6 border-4 border-black transition-all text-right",
            currentPlayer === 1 ? "bg-red-400 translate-y-[-4px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "bg-red-100 opacity-60"
          )}>
             <div className="flex justify-between items-end flex-row-reverse">
              <div>
                <p className="font-black text-sm uppercase mb-1">{gameMode === 'pvc' ? 'CPU' : 'Player 2'}</p>
                <p className="text-5xl font-black">{captured[1]}</p>
              </div>
              <NeoBadge className="bg-white mb-1">Seeds Captured</NeoBadge>
            </div>
          </NeoCard>
        </div>
        <NeoCard className="bg-[#5D2E17] p-8 md:p-16 border-[12px] border-black rounded-[4rem] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
           <div className="space-y-16">
             {/* Opponent Row (top) */}
             <div className="grid grid-cols-6 gap-6 md:gap-10">
                {[11, 10, 9, 8, 7, 6].map(renderPit)}
             </div>
             <div className="relative">
               <div className="h-8 bg-black/30 rounded-full mx-10 shadow-inner" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-black text-white font-black text-xs uppercase px-4 py-1 rounded-full border-2 border-stone-400">Neutral Zone</div>
               </div>
             </div>
             {/* Player Row (bottom) */}
             <div className="grid grid-cols-6 gap-6 md:gap-10">
                {[0, 1, 2, 3, 4, 5].map(renderPit)}
             </div>
           </div>
        </NeoCard>
        <div className="flex justify-center">
          <motion.div 
            animate={isMyTurn ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className={cn(
              "px-16 py-8 border-4 border-black rounded-[2rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] font-black text-3xl uppercase tracking-widest",
              currentPlayer === 0 ? 'bg-blue-400' : 'bg-red-400'
            )}
          >
            {isMyTurn ? "YOUR TURN!" : (gameMode === 'pvc' && currentPlayer === 1 ? "CPU THINKING..." : "WAITING...")}
          </motion.div>
        </div>
      </div>
      <WinnerModal />
    </GameLayout>
  );
}