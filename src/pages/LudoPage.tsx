import React, { useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { GameLayout } from '@/components/layout/GameLayout';
import { useGameStore } from '@/store/game-store';
import { NeoButton, NeoCard, NeoBadge } from '@/components/ui/neo-primitives';
import { Dice6, User, ShieldCheck, Star, ShieldX, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LudoToken } from '@/components/game/LudoToken';
import { WinnerModal, RoomInfo } from '@/components/game/GameModals';
import { BattleLog } from '@/components/game/BattleLog';
import { SAFE_ZONES, MAIN_PATH_COORDS, isCellBlocked } from '@/lib/game-logic/ludo-engine';
const COLORS = ['red', 'green', 'yellow', 'blue'];
export function LudoPage() {
  const diceRoll = useGameStore(s => s.ludo.diceRoll);
  const isRolling = useGameStore(s => s.ludo.isRolling);
  const rollDice = useGameStore(s => s.rollDice);
  const currentPlayer = useGameStore(s => s.ludo.currentPlayer);
  const tokens = useGameStore(s => s.ludo.tokens);
  const validMoves = useGameStore(s => s.ludo.validMoves);
  const lastMove = useGameStore(s => s.ludo.lastMove);
  const showTripleWarning = useGameStore(s => s.ludo.showTripleSixWarning);
  const gameMode = useGameStore(s => s.gameMode);
  const roomId = useGameStore(s => s.roomId);
  const localPlayerId = useGameStore(s => s.localPlayerId);
  const syncWithServer = useGameStore(s => s.syncWithServer);
  const selectedTokenId = useGameStore(s => s.selectedTokenId);
  // Memoized coordinate lookup for performance
  const coordsMap = useMemo(() => {
    const map = new Map<string, number>();
    MAIN_PATH_COORDS.forEach((coord, idx) => {
      map.set(`${coord[0]},${coord[1]}`, idx);
    });
    return map;
  }, []);
  const tokenStackIndex = useMemo(() => {
    const indices: Record<number, number> = {};
    const posCounts = new Map<number, number>();
    const baseCounts = new Map<string, number>();
    tokens.forEach(token => {
      if (token.position === -1) {
        const count = baseCounts.get(token.color) || 0;
        indices[token.id] = count;
        baseCounts.set(token.color, count + 1);
      } else {
        const count = posCounts.get(token.position) || 0;
        indices[token.id] = count;
        posCounts.set(token.position, count + 1);
      }
    });
    return indices;
  }, [tokens]);
  useEffect(() => {
    if (!roomId || gameMode !== 'online') return;
    const interval = setInterval(syncWithServer, 2000);
    return () => clearInterval(interval);
  }, [gameMode, roomId, syncWithServer]);
  const isMyTurn = gameMode === 'online' 
    ? (COLORS.indexOf(currentPlayer) === localPlayerId) 
    : (gameMode === 'pvc' ? currentPlayer === 'red' : true);
  const getCellClass = (r: number, c: number) => {
    if (r === 6 && c === 1) return 'bg-red-400 border-2 border-black';
    if (r === 1 && c === 8) return 'bg-green-500 border-2 border-black';
    if (r === 8 && c === 13) return 'bg-yellow-400 border-2 border-black';
    if (r === 13 && c === 6) return 'bg-blue-500 border-2 border-black';
    if (r === 7 && c >= 1 && c <= 6) return 'bg-red-300';
    if (c === 7 && r >= 1 && r <= 6) return 'bg-green-400';
    if (r === 7 && c >= 8 && c <= 13) return 'bg-yellow-300';
    if (c === 7 && r >= 8 && r <= 13) return 'bg-blue-400';
    return 'bg-white';
  };
  return (
    <GameLayout title="Ludu Arena">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-4 items-center">
              {gameMode === 'online' && (
                <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-black text-sm uppercase">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  You: {COLORS[localPlayerId]}
                </div>
              )}
              <NeoBadge className="bg-white border-2 border-black font-black uppercase">{gameMode}</NeoBadge>
            </div>
            {roomId && <RoomInfo roomId={roomId} />}
          </div>
          <div className="relative aspect-square w-full max-w-[600px] bg-black p-2 rounded-2xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] grid grid-cols-15 grid-rows-15 gap-px mx-auto overflow-hidden">
            {Array.from({ length: 15 * 15 }).map((_, i) => {
              const r = Math.floor(i / 15);
              const c = i % 15;
              const isBase = (r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6) || (r > 8 && c > 8);
              const isHome = r >= 6 && r <= 8 && c >= 6 && c <= 8;
              const pathIdx = coordsMap.get(`${r},${c}`);
              const isSafe = pathIdx !== undefined && SAFE_ZONES.includes(pathIdx);
              const blocked = pathIdx !== undefined && isCellBlocked(tokens, pathIdx);
              const isLastTarget = lastMove && lastMove.targetPos === pathIdx;
              return (
                <div key={i} className={cn(
                  isBase ? 'opacity-40' : '',
                  isHome ? 'bg-gradient-to-br from-red-500 via-green-500 to-yellow-500' : getCellClass(r, c),
                  "border-[0.5px] border-black/10 flex items-center justify-center relative"
                )}>
                  {isSafe && !isHome && <Star className="w-3 h-3 text-black/20 fill-current" />}
                  {blocked && <ShieldX className="w-4 h-4 text-red-600/60" />}
                  {isLastTarget && <div className="absolute inset-0 bg-black/10 animate-pulse" />}
                </div>
              );
            })}
            <AnimatePresence>
              {tokens.map((token) => (
                <LudoToken
                  key={token.id}
                  token={token}
                  indexInBase={tokenStackIndex[token.id] ?? 0}
                  isValidMove={validMoves.some(m => m.tokenId === token.id) && isMyTurn}
                  isSelected={selectedTokenId === token.id}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <BattleLog />
          <NeoCard className="p-6">
            <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Current Turn
            </h3>
            <AnimatePresence mode="wait">
              {showTripleWarning ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500 border-4 border-black p-4 rounded-xl text-white font-black uppercase text-center flex flex-col items-center gap-2 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Zap className="w-8 h-8 animate-pulse" />
                  Triple Six! Turn Canceled
                </motion.div>
              ) : (
                <div className={cn(
                  "flex items-center gap-4 mb-6 p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors",
                  currentPlayer === 'red' ? 'bg-red-400' : currentPlayer === 'green' ? 'bg-green-500' : currentPlayer === 'blue' ? 'bg-blue-500' : 'bg-yellow-400'
                )}>
                  <div className="w-10 h-10 rounded-full border-4 border-black bg-white flex items-center justify-center font-black">!</div>
                  <div className="flex-1">
                    <span className="font-black text-xl uppercase">{currentPlayer}</span>
                    <p className="text-[10px] font-bold opacity-80">{isMyTurn ? "Your Turn!" : "Waiting..."}</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
            <div className="flex flex-col items-center gap-6 p-6 bg-[#FFFDF5] rounded-xl border-4 border-black">
              <motion.div
                animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: isRolling ? Infinity : 0, duration: 0.2 }}
                className="bg-white w-20 h-20 flex items-center justify-center border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {diceRoll ? <span className="text-5xl font-black">{diceRoll}</span> : <Dice6 className="w-12 h-12 text-stone-300" />}
              </motion.div>
              <NeoButton
                onClick={rollDice}
                disabled={isRolling || diceRoll !== null || !isMyTurn || showTripleWarning}
                className={cn("w-full py-6 text-2xl bg-yellow-400 font-black", (!isMyTurn || showTripleWarning) && "opacity-30")}
              >
                ROLL
              </NeoButton>
            </div>
          </NeoCard>
        </div>
      </div>
      <WinnerModal />
    </GameLayout>
  );
}