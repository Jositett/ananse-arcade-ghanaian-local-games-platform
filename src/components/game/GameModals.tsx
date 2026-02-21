import React, { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { NeoCard, NeoButton } from '@/components/ui/neo-primitives';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, PartyPopper, Users, Monitor, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
export function WinnerModal() {
  const winner = useGameStore(s => s.winner);
  const resetGame = useGameStore(s => s.resetGame);
  const navigate = useNavigate();
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
            <NeoButton onClick={() => navigate('/')} className="flex-1 bg-white">Home</NeoButton>
          </div>
          <PartyPopper className="absolute -top-10 -left-10 w-20 h-20 text-red-500 rotate-[-20deg]" />
          <PartyPopper className="absolute -top-10 -right-10 w-20 h-20 text-blue-500 rotate-[20deg]" />
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
export function GameModeSelector({ gameType, onClose }: { gameType: 'ludo' | 'oware', onClose: () => void }) {
  const navigate = useNavigate();
  const setGame = useGameStore(s => s.setGame);
  const [showJoin, setShowJoin] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const handleMode = (mode: 'pvp' | 'pvc' | 'online') => {
    if (mode === 'online') {
      setShowJoin(true);
      return;
    }
    setGame(gameType, mode);
    navigate(`/${gameType}`);
  };
  const handleCreateOnline = async () => {
    setGame(gameType, 'online');
    const state = useGameStore.getState();
    const res = await fetch('/api/games/create', {
      method: 'POST',
      body: JSON.stringify({ gameType, state })
    });
    const json = await res.json();
    if (json.success) {
      setGame(gameType, 'online', json.data.id);
      navigate(`/${gameType}`);
    }
  };
  const handleJoinOnline = async () => {
    if (!roomCode) return;
    const res = await fetch(`/api/games/${roomCode}`);
    const json = await res.json();
    if (json.success) {
      setGame(gameType, 'online', roomCode);
      navigate(`/${gameType}`);
    }
  };
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md">
        <NeoCard className="p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase text-center">Select Mode</DialogTitle>
          </DialogHeader>
          {!showJoin ? (
            <div className="space-y-4">
              <ModeButton icon={<Users />} title="Pass & Play" desc="Local multiplayer" onClick={() => handleMode('pvp')} color="bg-blue-400" />
              <ModeButton icon={<Monitor />} title="Vs CPU" desc="Test your skills" onClick={() => handleMode('pvc')} color="bg-green-400" />
              <ModeButton icon={<Globe />} title="Online" desc="Play with rooms" onClick={() => handleMode('online')} color="bg-yellow-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <NeoButton className="w-full bg-yellow-400" onClick={handleCreateOnline}>Create New Room</NeoButton>
              <div className="flex gap-2">
                <input 
                  className="flex-1 border-4 border-black rounded-xl px-4 font-bold" 
                  placeholder="Enter Code" 
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                />
                <NeoButton onClick={handleJoinOnline}>Join</NeoButton>
              </div>
              <NeoButton variant="ghost" className="w-full border-none shadow-none" onClick={() => setShowJoin(false)}>Back</NeoButton>
            </div>
          )}
        </NeoCard>
      </DialogContent>
    </Dialog>
  );
}
function ModeButton({ icon, title, desc, onClick, color }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-4 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${color} text-left`}
    >
      <div className="bg-white p-3 border-4 border-black rounded-xl">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div className="flex-1">
        <h4 className="font-black text-xl uppercase leading-none">{title}</h4>
        <p className="font-bold text-sm opacity-80">{desc}</p>
      </div>
      <ChevronRight className="opacity-50" />
    </button>
  );
}