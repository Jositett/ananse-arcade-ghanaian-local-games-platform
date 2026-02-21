import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Gamepad2, Trophy } from 'lucide-react';
import { NeoCard, NeoButton, NeoBadge } from '@/components/ui/neo-primitives';
import { useGameStore } from '@/store/game-store';
export function HomePage() {
  const navigate = useNavigate();
  const setGame = useGameStore(s => s.setGame);
  const games = [
    {
      id: 'ludo',
      title: 'Ludu',
      description: 'Race your tokens home in this classic board game!',
      color: 'bg-yellow-400',
      icon: <Gamepad2 className="w-12 h-12" />,
      path: '/ludo'
    },
    {
      id: 'oware',
      title: 'Oware',
      description: 'The world-famous strategy game of pits and seeds.',
      color: 'bg-green-500',
      icon: <Trophy className="w-12 h-12" />,
      path: '/oware'
    }
  ];
  const handleSelect = (id: 'ludo' | 'oware', path: string) => {
    setGame(id);
    navigate(path);
  };
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
          <p className="text-xl md:text-2xl font-bold text-center max-w-2xl mb-16 text-muted-foreground">
            Experience the vibrant spirit of Ghana through our classic local games!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl">
            {games.map((game) => (
              <NeoCard key={game.id} className="group cursor-pointer hover:-translate-y-2 transition-transform duration-300">
                <div className={`${game.color} p-8 border-b-4 border-black flex justify-center`}>
                  <div className="bg-white p-6 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {game.icon}
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-black uppercase">{game.title}</h2>
                    <NeoBadge className="bg-white">Classic</NeoBadge>
                  </div>
                  <p className="font-bold text-lg leading-tight">{game.description}</p>
                  <NeoButton 
                    className="w-full bg-white hover:bg-black hover:text-white"
                    onClick={() => handleSelect(game.id as any, game.path)}
                  >
                    Play Now
                  </NeoButton>
                </div>
              </NeoCard>
            ))}
          </div>
          <footer className="mt-24 text-center">
            <p className="font-black text-sm uppercase tracking-widest border-b-4 border-black pb-2 inline-block">
              Made with ❤️ for Ghana
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}