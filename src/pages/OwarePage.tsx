import React, { useEffect } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { useGameStore } from '@/store/game-store';
import { NeoCard, NeoBadge } from '@/components/ui/neo-primitives';
import { motion } from 'framer-motion';
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
  const winner = useGameStore(s => s.winner);
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
    const isClickable = isMyTurn && isLocalSlot && pits[index] > 0 && !winner;
    const isActiveSide = currentPlayer === (index < 6 ? 0 : 1);
    return (
      <motion.div
        key={index}
        whileHover={isClickable ? { scale: 1.05, y: -5 } : {}}
        whileTap={isClickable ? { scale: 0.95 } : {}}
        onClick={() => isClickable && playPit(index)}
        className={cn(
          "aspect-square rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative transition-all duration-300",
          isClickable ? "bg-amber-100 border-amber-600 cursor-pointer" : "bg-stone-300/50 grayscale-[0.2]",
          isActiveSide && "ring-4 ring-black ring-offset-2 ring-offset-white shadow-[0_0_15px_rgba(0,0,0,0.2)]"
        )}
      >
        <div className="absolute inset-0 rounded-full bg-black/5 inner-shadow pointer-events-none" />
        <span className="text-5xl font-black tabular-nums">{pits[index]}</span>
        <div className="absolute -top-3 -right-3">
          <NeoBadge className={cn("bg-white border-2 text-base px-2", pits[index] === 0 && "opacity-50")}>
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
                <p className="text-6xl font-black tabular-nums">{captured[0]}</p>
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
                <p className="text-6xl font-black tabular-nums">{captured[1]}</p>
              </div>
              <NeoBadge className="bg-white mb-1">Seeds Captured</NeoBadge>
            </div>
          </NeoCard>
        </div>
        <NeoCard className="bg-[#4a2411] p-8 md:p-16 border-[12px] border-black rounded-[4rem] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)]" />
           <div className="space-y-16 relative z-10">
             <div className="grid grid-cols-6 gap-6 md:gap-10">
                {[11, 10, 9, 8, 7, 6].map(renderPit)}
             </div>
             <div className="relative">
               <div className="h-6 bg-black/40 rounded-full mx-10 shadow-[inset_0px_4px_4px_rgba(0,0,0,0.5)] border-b-2 border-white/10" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-black text-white font-black text-[10px] uppercase px-6 py-1.5 rounded-full border-2 border-stone-600 tracking-widest shadow-lg">Traditional Board</div>
               </div>
             </div>
             <div className="grid grid-cols-6 gap-6 md:gap-10">
                {[0, 1, 2, 3, 4, 5].map(renderPit)}
             </div>
           </div>
        </NeoCard>
        <div className="flex justify-center">
          <motion.div
            animate={isMyTurn && !winner ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className={cn(
              "px-12 md:px-24 py-6 md:py-10 border-4 border-black rounded-[2.5rem] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] font-black text-2xl md:text-4xl uppercase tracking-widest text-center",
              currentPlayer === 0 ? 'bg-blue-400' : 'bg-red-400'
            )}
          >
            {winner ? "GAME OVER" : isMyTurn ? "YOUR TURN!" : (gameMode === 'pvc' && currentPlayer === 1 ? "CPU THINKING..." : "WAITING...")}
          </motion.div>
        </div>
      </div>
      <WinnerModal />
    </GameLayout>
  );
}