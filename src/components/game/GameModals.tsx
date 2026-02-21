import React, { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { NeoCard, NeoButton } from '@/components/ui/neo-primitives';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Trophy, PartyPopper, Users, Monitor, Globe, ChevronRight, Copy, Check, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
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
            <DialogDescription className="sr-only">Announcement of the game winner.</DialogDescription>
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
  const [isJoining, setIsJoining] = useState(false);
  const handleMode = (mode: 'pvp' | 'pvc' | 'online') => {
    if (mode === 'online') {
      setShowJoin(true);
      return;
    }
    setGame(gameType, mode, undefined, 0);
    navigate(`/${gameType}`);
  };
  const handleCreateOnline = async () => {
    setIsJoining(true);
    try {
      setGame(gameType, 'online');
      const state = useGameStore.getState();
      const res = await fetch('/api/games/create', {
        method: 'POST',
        body: JSON.stringify({ gameType, state })
      });
      const json = await res.json();
      if (json.success) {
        setGame(gameType, 'online', json.data.id, 0);
        navigate(`/${gameType}`);
      }
    } catch (e) {
      toast.error("Failed to create room");
    } finally {
      setIsJoining(false);
    }
  };
  const handleJoinOnline = async () => {
    if (!roomCode) return;
    setIsJoining(true);
    try {
      const res = await fetch(`/api/games/${roomCode}/join`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setGame(gameType, 'online', roomCode, json.data.playerCount - 1);
        navigate(`/${gameType}`);
      } else {
        toast.error("Room not found");
      }
    } catch (e) {
      toast.error("Connection error");
    } finally {
      setIsJoining(false);
    }
  };
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md">
        <NeoCard className="p-8 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase text-center">Select Mode</DialogTitle>
            <DialogDescription className="sr-only">Choose your preferred game mode.</DialogDescription>
          </DialogHeader>
          {!showJoin ? (
            <div className="space-y-4">
              <ModeButton icon={<Users />} title="Pass & Play" desc="Local multiplayer" onClick={() => handleMode('pvp')} color="bg-blue-400" />
              <ModeButton icon={<Monitor />} title="Vs CPU" desc="Test your skills" onClick={() => handleMode('pvc')} color="bg-green-400" />
              <ModeButton icon={<Globe />} title="Online" desc="Play with rooms" onClick={() => handleMode('online')} color="bg-yellow-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <NeoButton 
                className="w-full bg-yellow-400" 
                onClick={handleCreateOnline}
                disabled={isJoining}
              >
                {isJoining ? "Creating..." : "Create New Room"}
              </NeoButton>
              <div className="flex gap-2">
                <input
                  className="flex-1 border-4 border-black rounded-xl px-4 font-bold h-14"
                  placeholder="CODE"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                />
                <NeoButton onClick={handleJoinOnline} disabled={isJoining}>Join</NeoButton>
              </div>
              <NeoButton variant="ghost" className="w-full" onClick={() => setShowJoin(false)}>Back</NeoButton>
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
export function RoomInfo({ roomId }: { roomId: string }) {
  const [copied, setCopied] = useState(false);
  const copyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2 bg-white border-4 border-black rounded-xl px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <span className="font-black text-sm uppercase opacity-60">Room:</span>
      <span className="font-black text-lg">{roomId}</span>
      <button 
        onClick={copyCode}
        className="p-1 hover:bg-stone-100 rounded transition-colors ml-2"
      >
        {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
      </button>
    </div>
  );
}