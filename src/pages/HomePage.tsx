import React, { useState } from 'react';
import { Sparkles, Gamepad2, Trophy, Info } from 'lucide-react';
import { NeoCard, NeoButton, NeoBadge } from '@/components/ui/neo-primitives';
import { GameModeSelector } from '@/components/game/GameModals';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
export function HomePage() {
  const [selectedGame, setSelectedGame] = useState<'ludo' | 'oware' | null>(null);
  const [showHow, setShowHow] = useState(false);
  const games = [
    {
      id: 'ludo' as const,
      title: 'Ludu',
      description: 'Race your tokens home! Be first to reach the goal with all 4 tokens.',
      color: 'bg-yellow-400',
      icon: <Gamepad2 className="w-12 h-12" />,
    },
    {
      id: 'oware' as const,
      title: 'Oware',
      description: 'Strategic board game. Capture more seeds than your opponent to win.',
      color: 'bg-green-500',
      icon: <Trophy className="w-12 h-12" />,
    }
  ];
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-20 flex flex-col items-center">
          <div className="mb-8 flex items-center gap-4 animate-bounce">
            <div className="p-4 bg-red-500 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">Ananse Arcade</h1>
          </div>
          <p className="text-xl md:text-2xl font-bold text-center max-w-2xl mb-8 text-muted-foreground">
            Ghana's favorite classic board games, now playable anywhere!
          </p>
          <NeoButton 
            variant="outline" 
            className="mb-16 gap-2"
            onClick={() => setShowHow(true)}
          >
            <Info className="w-5 h-5" /> How to Play
          </NeoButton>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
            {games.map((game) => (
              <NeoCard key={game.id} className="group flex flex-col">
                <div className={`${game.color} p-8 border-b-4 border-black flex justify-center`}>
                  <div className="bg-white p-6 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform group-hover:scale-110">
                    {game.icon}
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1 gap-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black uppercase">{game.title}</h2>
                    <NeoBadge className="bg-white">Ghana Classic</NeoBadge>
                  </div>
                  <p className="font-bold text-lg leading-tight flex-1">{game.description}</p>
                  <NeoButton
                    className="w-full bg-white hover:bg-black hover:text-white mt-4"
                    onClick={() => setSelectedGame(game.id)}
                  >
                    Play Now
                  </NeoButton>
                </div>
              </NeoCard>
            ))}
          </div>
          <footer className="mt-24 text-center">
            <p className="font-black text-sm uppercase tracking-widest border-b-4 border-black pb-2 inline-block">
              Made with ❤️ for the Culture
            </p>
          </footer>
        </div>
      </div>
      {selectedGame && (
        <GameModeSelector
          gameType={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
      <Dialog open={showHow} onOpenChange={setShowHow}>
        <DialogContent className="max-w-2xl bg-[#FFFDF5] border-8 border-black rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase">How to Play</DialogTitle>
          </DialogHeader>
          <div className="space-y-8 py-4">
            <section>
              <h3 className="text-2xl font-black text-yellow-500 uppercase mb-2">Ludu (Ludo)</h3>
              <p className="font-bold">Roll a 6 to bring a token out of the base. Move your tokens around the board and into the home stretch. First player with all 4 tokens in the center wins!</p>
            </section>
            <section>
              <h3 className="text-2xl font-black text-green-600 uppercase mb-2">Oware</h3>
              <p className="font-bold">Pick seeds from one of your pits and sow them counter-clockwise. Capture seeds by landing in an opponent's pit with a final count of 2 or 3. Most seeds wins!</p>
            </section>
          </div>
          <NeoButton onClick={() => setShowHow(false)} className="bg-red-500 text-white">Let's Go!</NeoButton>
        </DialogContent>
      </Dialog>
    </div>
  );
}