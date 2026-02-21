import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { NeoButton } from '@/components/ui/neo-primitives';
import { useGameStore } from '@/store/game-store';
interface GameLayoutProps {
  children: React.ReactNode;
  title: string;
}
export function GameLayout({ children, title }: GameLayoutProps) {
  const resetGame = useGameStore(s => s.resetGame);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-black">
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <NeoButton 
              className="p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="w-6 h-6" />
            </NeoButton>
            <h1 className="text-2xl font-black uppercase hidden sm:block">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <NeoButton 
              className="p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-red-400"
              onClick={resetGame}
            >
              <RefreshCw className="w-5 h-5" />
            </NeoButton>
            <Link to="/">
              <NeoButton className="p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-yellow-400">
                <Home className="w-5 h-5" />
              </NeoButton>
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}