import React from 'react';
import { useGameStore } from '@/store/game-store';
import { NeoCard, NeoButton } from '@/components/ui/neo-primitives';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Trophy, PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';
export function WinnerModal() {
  const winner = useGameStore(s => s.winner);
  const resetGame = useGameStore(s => s.resetGame);
  return (
    <Dialog open={!!winner} onOpenChange={() => {}}>
      <DialogContent className="border-none bg-transparent shadow-none max-w-md p-0">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 bg-white border-8 border-black rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center gap-6"
        >
          <div className="bg-yellow-400 p-6 rounded-full border-4 border-black animate-bounce">
            <Trophy className="w-16 h-16" />
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase mb-2">Game Over!</h2>
            <p className="text-2xl font-bold bg-green-400 px-4 py-2 border-4 border-black rounded-xl inline-block">
              {winner} WINS!
            </p>
          </div>
          <div className="flex gap-4 w-full">
            <NeoButton onClick={resetGame} className="flex-1 bg-yellow-400">Play Again</NeoButton>
            <NeoButton onClick={() => window.location.href = '/'} className="flex-1 bg-white">Home</NeoButton>
          </div>
          <PartyPopper className="absolute -top-10 -left-10 w-20 h-20 text-red-500 rotate-[-20deg]" />
          <PartyPopper className="absolute -top-10 -right-10 w-20 h-20 text-blue-500 rotate-[20deg]" />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}