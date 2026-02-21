import React, { useEffect } from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { useGameStore } from '@/store/game-store';
import { NeoCard, NeoBadge } from '@/components/ui/neo-primitives';
import { motion, AnimatePresence } from 'framer-motion';
import { WinnerModal, RoomInfo } from '@/components/game/GameModals';
import { BattleLog } from '@/components/game/BattleLog';
import { cn } from '@/lib/utils';
import { getValidOwareMoves } from '@/lib/game-logic/oware-engine';
import { Ban } from 'lucide-react';
export function OwarePage() {
  const pits = useGameStore(s => s.oware.pits);
  const captured = useGameStore(s => s.oware.captured);
  const currentPlayer = useGameStore(s => s.oware.currentPlayer);
  const lastPitPlayed = useGameStore(s => s.oware.lastPitPlayed);
  const isAnimating = useGameStore(s => s.isAnimating);
  const playPit = useGameStore(s => s.playOwarePit);
  const gameMode = useGameStore(s => s.gameMode);
  const roomId = useGameStore(s => s.roomId);
  const localPlayerId = useGameStore(s => s.localPlayerId);
  const syncWithServer = useGameStore(s => s.syncWithServer);
  const winner = useGameStore(s => s.winner);
  const owareState = useGameStore(s => s.oware);
  useEffect(() => {
    if (gameMode === 'online' && roomId) {
      const interval = setInterval(syncWithServer, 2000);
      return () => clearInterval(interval);
    }
  }, [gameMode, roomId, syncWithServer]);
  const validMoves = getValidOwareMoves(owareState);
  const isMyTurn = gameMode === 'online' ? currentPlayer === localPlayerId :
                  gameMode === 'pvc' ? currentPlayer === 0 : true;
  const renderPit = (index: number) => {
    const isPlayerPit = index < 6;
    const isLocalSlot = (localPlayerId === 0 && isPlayerPit) || (localPlayerId === 1 && !isPlayerPit);
    const isLegal = validMoves.includes(index);
    const isClickable = isMyTurn && isLocalSlot && isLegal && !winner && !isAnimating;
    const isHighlight = lastPitPlayed === index && isAnimating;
    const isForbidden = isLocalSlot && pits[index] > 0 && !isLegal;
    return (
      <motion.div
        key={index}
        whileHover={isClickable ? { scale: 1.05, y: -5 } : {}}
        whileTap={isClickable ? { scale: 0.95 } : {}}
        onClick={() => isClickable && playPit(index)}
        className={cn(
          "aspect-square rounded-full border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative transition-all duration-300",
          isClickable ? "bg-amber-100 border-amber-600 cursor-pointer" : "bg-stone-300/50 grayscale-[0.2]",
          isHighlight && "bg-yellow-400 border-yellow-600 scale-110 shadow-[0_0_25px_rgba(255,215,0,0.6)]",
          isForbidden && "bg-red-50 cursor-not-allowed opacity-80"
        )}
      >
        <div className="absolute inset-0 rounded-full bg-black/5 inner-shadow pointer-events-none" />
        {isForbidden && (
          <div className="absolute -top-1 -left-1 z-20 bg-red-500 rounded-full p-1 border-2 border-black">
            <Ban className="w-4 h-4 text-white" />
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.span
            key={pits[index]}
            initial={isHighlight ? { scale: 1.5, color: '#000' } : {}}
            animate={{ scale: 1 }}
            className="text-4xl md:text-5xl font-black tabular-nums"
          >
            {pits[index]}
          </motion.span>
        </AnimatePresence>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-4 items-center">
              {gameMode === 'online' && (
                <div className="bg-black text-white px-4 py-2 rounded-xl font-black text-sm uppercase">
                  You: Player {localPlayerId + 1}
                </div>
              )}
              <NeoBadge className="bg-white border-4 border-black px-6 py-2">{gameMode.toUpperCase()}</NeoBadge>
            </div>
            {roomId && <RoomInfo roomId={roomId} />}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <NeoCard className={cn(
              "p-4 border-4 border-black transition-all",
              currentPlayer === 0 ? "bg-blue-400 translate-y-[-4px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "bg-blue-100 opacity-60"
            )}>
              <div className="flex justify-between items-end">
                <div>
                  <p className="font-black text-xs uppercase mb-1">Player 1</p>
                  <p className="text-4xl font-black tabular-nums">{captured[0]}</p>
                </div>
                <NeoBadge className="bg-white text-[10px]">Captured</NeoBadge>
              </div>
            </NeoCard>
            <NeoCard className={cn(
              "p-4 border-4 border-black transition-all text-right",
              currentPlayer === 1 ? "bg-red-400 translate-y-[-4px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" : "bg-red-100 opacity-60"
            )}>
               <div className="flex justify-between items-end flex-row-reverse">
                <div>
                  <p className="font-black text-xs uppercase mb-1">{gameMode === 'pvc' ? 'CPU' : 'Player 2'}</p>
                  <p className="text-4xl font-black tabular-nums">{captured[1]}</p>
                </div>
                <NeoBadge className="bg-white text-[10px]">Captured</NeoBadge>
              </div>
            </NeoCard>
          </div>
          <NeoCard className="bg-[#4a2411] p-6 md:p-12 border-[12px] border-black rounded-[3rem] shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
             <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)]" />
             <div className="space-y-12 relative z-10">
               <div className="grid grid-cols-6 gap-3 md:gap-6">
                  {[11, 10, 9, 8, 7, 6].map(renderPit)}
               </div>
               <div className="relative h-2 bg-black/40 rounded-full mx-8" />
               <div className="grid grid-cols-6 gap-3 md:gap-6">
                  {[0, 1, 2, 3, 4, 5].map(renderPit)}
               </div>
             </div>
          </NeoCard>
          <div className="flex justify-center">
            <motion.div
              animate={isMyTurn && !winner && !isAnimating ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={cn(
                "px-8 md:px-16 py-4 md:py-6 border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black text-xl md:text-2xl uppercase tracking-widest text-center",
                currentPlayer === 0 ? 'bg-blue-400' : 'bg-red-400'
              )}
            >
              {winner ? "GAME OVER" : isAnimating ? "SOWING SEEDS..." : isMyTurn ? "YOUR TURN!" : "WAITING..."}
            </motion.div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <BattleLog />
        </div>
      </div>
      <WinnerModal />
    </GameLayout>
  );
}