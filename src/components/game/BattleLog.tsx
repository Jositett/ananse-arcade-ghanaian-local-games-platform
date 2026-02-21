import React from 'react';
import { useGameStore } from '@/store/game-store';
import { NeoCard } from '@/components/ui/neo-primitives';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, Dice6, Trophy, Info, AlertTriangle, Zap, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
export function BattleLog() {
  const battleLog = useGameStore(s => s.battleLog);
  const getIcon = (type: string) => {
    switch (type) {
      case 'roll': return <Dice6 className="w-4 h-4" />;
      case 'kick': return <Sword className="w-4 h-4" />;
      case 'home': return <LogIn className="w-4 h-4" />;
      case 'win': return <Trophy className="w-4 h-4" />;
      case 'turn_skip': return <AlertTriangle className="w-4 h-4" />;
      case 'capture': return <Zap className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };
  const getPlayerColor = (player: string) => {
    const p = player.toLowerCase();
    if (p.includes('red')) return 'bg-red-400';
    if (p.includes('green')) return 'bg-green-500';
    if (p.includes('yellow')) return 'bg-yellow-400';
    if (p.includes('blue')) return 'bg-blue-500';
    if (p.includes('1')) return 'bg-blue-400';
    if (p.includes('2')) return 'bg-red-400';
    return 'bg-stone-200';
  };
  return (
    <NeoCard className="flex flex-col h-[300px] lg:h-[400px] bg-[#FFFDF5]">
      <div className="p-4 border-b-4 border-black bg-white flex items-center justify-between">
        <h3 className="font-black uppercase tracking-tight text-lg">Battle Log</h3>
        <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full">LIVE</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <AnimatePresence initial={false}>
          {battleLog.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3"
            >
              <div className={cn(
                "mt-0.5 p-1.5 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                getPlayerColor(event.player)
              )}>
                {getIcon(event.type)}
              </div>
              <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-tight leading-none mb-1">{event.player}</p>
                <p className="text-sm font-bold leading-tight">{event.message}</p>
              </div>
            </motion.div>
          ))}
          {battleLog.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-40 italic font-bold">
              Waiting for actions...
            </div>
          )}
        </AnimatePresence>
      </div>
    </NeoCard>
  );
}