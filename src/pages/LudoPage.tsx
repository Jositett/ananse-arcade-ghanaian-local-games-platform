import React from 'react';
import { GameLayout } from '@/components/layout/GameLayout';
import { useGameStore } from '@/store/game-store';
import { NeoButton, NeoCard } from '@/components/ui/neo-primitives';
import { Dice6 } from 'lucide-react';
import { motion } from 'framer-motion';
export function LudoPage() {
  const diceRoll = useGameStore(s => s.ludo.diceRoll);
  const isRolling = useGameStore(s => s.ludo.isRolling);
  const rollDice = useGameStore(s => s.rollDice);
  const currentPlayer = useGameStore(s => s.ludo.currentPlayer);
  return (
    <GameLayout title="Ludo Arena">
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
        {/* Ludo Board Placeholder */}
        <div className="relative aspect-square w-full max-w-[600px] bg-white border-8 border-black rounded-xl shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] grid grid-cols-15 grid-rows-15">
          {/* Static Board Mockup Background */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-0">
            <div className="bg-red-500 border-4 border-black" />
            <div className="bg-white border-4 border-black" />
            <div className="bg-green-500 border-4 border-black" />
            <div className="bg-white border-4 border-black" />
            <div className="bg-black/10 border-4 border-black" />
            <div className="bg-white border-4 border-black" />
            <div className="bg-blue-500 border-4 border-black" />
            <div className="bg-white border-4 border-black" />
            <div className="bg-yellow-400 border-4 border-black" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <p className="text-4xl font-black bg-white px-4 py-2 border-4 border-black rotate-[-10deg]">COMMING SOON</p>
          </div>
        </div>
        <div className="w-full lg:w-80 space-y-6">
          <NeoCard className="p-6">
            <h3 className="text-xl font-black uppercase mb-4">Game Status</h3>
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-6 h-6 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                currentPlayer === 'red' ? 'bg-red-500' : 
                currentPlayer === 'green' ? 'bg-green-500' :
                currentPlayer === 'blue' ? 'bg-blue-500' : 'bg-yellow-400'
              }`} />
              <span className="font-bold uppercase">{currentPlayer}'s Turn</span>
            </div>
            <div className="flex flex-col items-center gap-4 p-4 bg-muted rounded-xl border-2 border-black">
              <motion.div
                animate={isRolling ? { rotate: [0, 90, 180, 270, 360], scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: isRolling ? Infinity : 0, duration: 0.3 }}
                className="bg-white p-4 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {diceRoll ? <span className="text-4xl font-black">{diceRoll}</span> : <Dice6 className="w-10 h-10" />}
              </motion.div>
              <NeoButton 
                onClick={rollDice} 
                disabled={isRolling}
                className="w-full bg-yellow-400 hover:bg-yellow-300"
              >
                Roll Dice
              </NeoButton>
            </div>
          </NeoCard>
        </div>
      </div>
    </GameLayout>
  );
}