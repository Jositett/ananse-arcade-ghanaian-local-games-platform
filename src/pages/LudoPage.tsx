import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GameLayout } from '@/components/layout/GameLayout';
import { useGameStore } from '@/store/game-store';
import { NeoButton, NeoCard, NeoBadge } from '@/components/ui/neo-primitives';
import { Dice6, User, ShieldCheck, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LudoToken } from '@/components/game/LudoToken';
import { WinnerModal, RoomInfo } from '@/components/game/GameModals';
import { SAFE_ZONES, MAIN_PATH_COORDS } from '@/lib/game-logic/ludo-engine';
const COLORS = ['red', 'green', 'yellow', 'blue'];
export function LudoPage() {
  const diceRoll = useGameStore(s => s.ludo.diceRoll);
  const isRolling = useGameStore(s => s.ludo.isRolling);
  const rollDice = useGameStore(s => s.rollDice);
  const currentPlayer = useGameStore(s => s.ludo.currentPlayer);
  const tokens = useGameStore(s => s.ludo.tokens);
  const validMoves = useGameStore(s => s.ludo.validMoves);
  const gameMode = useGameStore(s => s.gameMode);
  const roomId = useGameStore(s => s.roomId);
  const localPlayerId = useGameStore(s => s.localPlayerId);
  const syncWithServer = useGameStore(s => s.syncWithServer);
  const selectedTokenId = useGameStore(s => s.selectedTokenId);

  const getStackIndex = (token: any) => {
    const pos = token.position;
    if (pos === -1) {
      // Base stacking: per-color rank by id asc
      const sameColorBaseTokens = tokens.filter(t => t.color === token.color && t.position === -1);
      sameColorBaseTokens.sort((a, b) => a.id - b.id);
      return sameColorBaseTokens.findIndex(t => t.id === token.id);
    } else {
      // Path stacking: per-position global rank (color then id)
      const samePosTokens = tokens.filter(t => t.position === pos);
      samePosTokens.sort((a, b) => a.color.localeCompare(b.color) || (a.id - b.id));
      return samePosTokens.findIndex(t => t.id === token.id);
    }
  };
  useEffect(() => {
    if (gameMode === 'online' && roomId) {
      const interval = setInterval(syncWithServer, 2000);
      return () => clearInterval(interval);
    }
  }, [gameMode, roomId, syncWithServer]);
  const isMyTurn = gameMode === 'online' ? (COLORS.indexOf(currentPlayer) === localPlayerId) :
                  gameMode === 'pvc' ? currentPlayer === 'red' : true;
  const getCellClass = (r: number, c: number) => {
    if (r === 6 && c === 1) return 'bg-red-400 border-2 border-black ring-inset ring-2 ring-white/50';
    if (r === 1 && c === 8) return 'bg-green-500 border-2 border-black ring-inset ring-2 ring-white/50';
    if (r === 8 && c === 13) return 'bg-yellow-400 border-2 border-black ring-inset ring-2 ring-white/50';
    if (r === 13 && c === 6) return 'bg-blue-500 border-2 border-black ring-inset ring-2 ring-white/50';
    if (r === 7 && c >= 1 && c <= 6) return 'bg-red-300';
    if (c === 7 && r >= 1 && r <= 6) return 'bg-green-400';
    if (r === 7 && c >= 8 && c <= 13) return 'bg-yellow-300';
    if (c === 7 && r >= 8 && r <= 13) return 'bg-blue-400';
    return 'bg-white';
  };
  const isCellSafe = (r: number, c: number) => {
    return SAFE_ZONES.some(idx => {
      const coords = MAIN_PATH_COORDS[idx];
      return coords && coords[0] === r && coords[1] === c;
    });
  };
  return (
    <GameLayout title="Ludu Arena">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <div className="flex gap-4 items-center">
            {gameMode === 'online' && (
              <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-black text-sm uppercase">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                You are {COLORS[localPlayerId]}
              </div>
            )}
            <NeoBadge className="bg-white border-2 border-black font-black uppercase">{gameMode}</NeoBadge>
          </div>
          {roomId && <RoomInfo roomId={roomId} />}
        </div>
        <div className="py-8 md:py-10 flex flex-col lg:flex-row gap-12 items-center lg:items-start justify-center">
          <div className="relative aspect-square w-full max-w-[600px] bg-black p-2 rounded-2xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] grid grid-cols-15 grid-rows-15 gap-px">
            {Array.from({ length: 15 * 15 }).map((_, i) => {
              const r = Math.floor(i / 15);
              const c = i % 15;
              const isBase = (r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6) || (r > 8 && c > 8);
              const isHome = r >= 6 && r <= 8 && c >= 6 && c <= 8;
              const isSafe = isCellSafe(r, c);
              return (
                <div key={i} className={cn(
                  isBase ? 'opacity-40' : '',
                  isHome ? 'bg-gradient-to-br from-red-500 via-green-500 to-yellow-500' : getCellClass(r, c),
                  "border-[0.5px] border-black/10 flex items-center justify-center relative"
                )}>
                  {isSafe && !isHome && <Star className="w-3 h-3 text-black/20" />}
                </div>
              );
            })}
            <AnimatePresence>
              {tokens.map((token) => (
                <LudoToken
                  key={token.id}
                  token={token}
                  indexInBase={getStackIndex(token)}
                  isValidMove={validMoves.some(m => m.tokenId === token.id) && isMyTurn}
                  isSelected={selectedTokenId === token.id}
                />
              ))}
            </AnimatePresence>
          </div>
          <div className="w-full lg:w-96 space-y-6">
            <NeoCard className="p-8">
              <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                <User className="w-5 h-5" /> Current Player
              </h3>
              <div className={cn(
                "flex items-center gap-4 mb-4 p-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                currentPlayer === 'red' ? 'bg-red-400' : currentPlayer === 'green' ? 'bg-green-500' : currentPlayer === 'blue' ? 'bg-blue-500' : 'bg-yellow-400'
              )}>
                <div className="w-12 h-12 rounded-full border-4 border-black bg-white flex items-center justify-center font-black">!</div>
                <div className="flex-1">
                  <span className="font-black text-2xl uppercase tracking-wider">{currentPlayer}</span>
                  <p className="text-sm font-bold opacity-80">{isMyTurn ? "Your Turn!" : "Waiting..."}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-6 p-8 bg-[#FFFDF5] rounded-2xl border-4 border-black">
                <motion.div
                  animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
                  transition={{ repeat: isRolling ? Infinity : 0, duration: 0.2 }}
                  className="bg-white w-24 h-24 flex items-center justify-center border-8 border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                  {diceRoll ? <span className="text-6xl font-black">{diceRoll}</span> : <Dice6 className="w-16 h-16 text-stone-300" />}
                </motion.div>
                <NeoButton
                  onClick={rollDice}
                  disabled={isRolling || diceRoll !== null || !isMyTurn}
                  className={cn("w-full py-8 text-3xl bg-yellow-400", !isMyTurn && "opacity-30 grayscale")}
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