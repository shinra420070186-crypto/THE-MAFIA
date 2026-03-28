import React, { useState } from 'react';
import { useGameStore } from './store';

// --- THE NEW IMAGE-BASED ROLE CARD ---
const RoleCard = ({ isFlipped, role }) => {
  // Map roles to your exact uploaded filenames
  const roleImages = {
    'Mafia': '/mafia-card.jpg',
    'Doctor': '/doctor-card.jpg',
    'Detective': '/detective-card.jpg',
    'Sheriff': '/sheriff-card.jpg',
    'Civilian': '/civilian-card.jpg'
  };

  // Match the exact neon colors from your generated images for the 3D glow effect!
  const glowColors = { 
    'Mafia': '#ff003c',      // Neon Red
    'Doctor': '#00ff75',     // Neon Green
    'Detective': '#00d2ff',  // Neon Blue
    'Sheriff': '#f2994a',    // Neon Orange
    'Civilian': '#8e44ad'    // Neon Purple
  };

  return (
    <div className="my-6 relative w-[220px] h-[330px] [perspective:1000px] select-none touch-none">
      <div className={`relative w-full h-full transition-transform duration-[600ms] [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* Front of Card (Unflipped) */}
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-2xl bg-[#1a1a1a] border-2 border-slate-800 flex flex-col items-center justify-center p-4 shadow-xl">
           <p className="text-slate-500 font-black tracking-widest uppercase text-center text-xl">Secret Role</p>
           <p className="text-[10px] text-slate-600 mt-4 tracking-widest uppercase font-bold animate-pulse">Tap & Hold to Reveal</p>
        </div>
        
        {/* Back of Card (Your Custom Images!) */}
        <div 
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border-2 bg-black" 
          style={{ 
            borderColor: `${glowColors[role] || glowColors.Civilian}40`, // Slight tinted border
            boxShadow: isFlipped ? `0px 0px 40px 5px ${glowColors[role] || glowColors.Civilian}66` : 'none' // Massive neon drop shadow matching the image
          }}
        >
          <img 
            src={roleImages[role] || roleImages.Civilian} 
            alt={role} 
            className="w-full h-full object-cover rounded-xl pointer-events-none"
            draggable="false"
          />
        </div>

      </div>
    </div>
  );
};

export default function GameBoard() {
  const state = useGameStore();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  const alivePlayers = state.players.filter(p => p.isAlive);

  // Added disableCondition so we can dynamically gray out invalid targets
  const renderPlayerList = (onSelect, includeSkip = false, disableCondition = () => false) => (
    <div className="w-full max-w-sm space-y-2 mt-6 max-h-[50vh] overflow-y-auto pr-2">
      {alivePlayers.map(p => {
        const isDisabled = disableCondition(p);
        return (
          <button 
            key={p.id} 
            onClick={() => onSelect(p.id)}
            disabled={isDisabled}
            className={`w-full p-4 rounded-xl font-bold uppercase transition-all ${isDisabled ? 'bg-slate-900 text-slate-700 border border-slate-800' : 'bg-slate-800 text-white active:scale-95'}`}
          >
            {p.name} {isDisabled && <span className="text-[10px] ml-2 tracking-widest text-slate-600">(LOCKED)</span>}
          </button>
        );
      })}
      {includeSkip && (
        <button 
          onClick={() => onSelect(null)}
          className="w-full p-4 bg-transparent border border-slate-700 text-slate-400 rounded-xl font-bold uppercase mt-4 active:scale-95"
        >
          Skip / Nobody
        </button>
      )}
    </div>
  );

  // --- LOBBY ---
  if (state.phase === 'lobby') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6">
        <h1 className="text-4xl font-black uppercase mb-8 tracking-[0.2em] text-red-600 mt-10 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">THE MAFIA</h1>
        
        <div className="w-full max-w-sm bg-slate-900/80 border border-slate-800 p-4 rounded-2xl mb-6">
          <input 
            value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Add player..."
            className="w-full p-3 bg-black rounded-lg outline-none text-white font-bold mb-2"
          />
          <button 
            onClick={() => { if(newPlayerName) { state.addPlayer(newPlayerName); setNewPlayerName(''); }}}
            className="w-full p-3 bg-red-600/20 text-red-500 border border-red-500/50 rounded-lg font-bold uppercase tracking-widest active:scale-95 transition-transform"
          >Add</button>
        </div>

        <div className="w-full max-w-sm space-y-2 mb-6 max-h-48 overflow-y-auto pr-2">
          {state.players.map(p => (
            <div key={p.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              <span className="font-bold tracking-wider">{p.name}</span>
              <button onClick={() => state.removePlayer(p.id)} className="text-slate-500 text-lg active:scale-90">✕</button>
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-xl mb-6">
          <span className="font-bold text-[10px] tracking-widest uppercase text-slate-400">Reveal Roles on Death?</span>
          <button 
            onClick={state.toggleRevealRoles} 
            className={`px-4 py-2 rounded text-[10px] uppercase font-black tracking-widest transition-colors ${state.settings.revealRoles ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-slate-800 text-slate-500'}`}
          >
            {state.settings.revealRoles ? 'ON' : 'OFF'}
          </button>
        </div>

        <button 
          disabled={state.players.length < 4}
          onClick={state.startGame}
          className="w-full max-w-sm p-5 bg-white text-black rounded-xl font-black tracking-widest uppercase shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-20 active:scale-95 transition-all"
        >
          Begin Game ({state.players.length})
        </button>
      </div>
    );
  }

  // --- ROLE REVEAL PHASE ---
  if (state.phase === 'role_reveal') {
    const currentPlayer = state.players[state.revealIndex];
    const isLastPlayer = state.revealIndex === state.players.length - 1;

    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-2">Pass phone to</p>
        <h2 className="text-4xl font-black text-white uppercase mb-8 drop-shadow-md">{currentPlayer.name}</h2>
        
        <div 
          onMouseDown={() => setIsFlipped(true)}
          onMouseUp={() => setIsFlipped(false)}
          onMouseLeave={() => setIsFlipped(false)}
          onTouchStart={() => setIsFlipped(true)}
          onTouchEnd={() => setIsFlipped(false)}
          className="cursor-pointer"
        >
          <RoleCard isFlipped={isFlipped} role={currentPlayer.role} />
        </div>

        <button 
          onClick={() => { setIsFlipped(false); state.nextRoleReveal(); }}
          disabled={isFlipped} 
          className={`mt-12 p-5 w-full max-w-sm rounded-xl font-black uppercase tracking-widest transition-all duration-300 ${isFlipped ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0 bg-slate-800 text-white border border-slate-700 active:scale-95'}`}
        >
          {isLastPlayer ? 'Give to Moderator' : 'Next Player'}
        </button>
      </div>
    );
  }

  // --- NIGHT: MAFIA ---
  if (state.phase === 'night_mafia') {
    // Condition: Mafia cannot kill other Mafia
    const disableCondition = (p) => p.role === 'Mafia';
    
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 text-center">
        <h2 className="text-red-600 font-black text-2xl uppercase mt-10">Night Phase</h2>
        <p className="text-slate-400 mt-2 text-sm">Moderator: Ask the Mafia to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8">Who does the Mafia kill?</h3>
        {renderPlayerList((id) => state.submitNightAction('Mafia', id), true, disableCondition)}
      </div>
    );
  }

  // --- NIGHT: DOCTOR ---
  if (state.phase === 'night_doctor') {
    // Condition: Cannot save last saved person. Cannot self-save more than once.
    const disableCondition = (p) => 
      p.id === state.doctorLastSaved || 
      (p.role === 'Doctor' && state.doctorHasSelfSaved);

    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 text-center">
        <h2 className="text-blue-500 font-black text-2xl uppercase mt-10">Night Phase</h2>
        <p className="text-slate-400 mt-2 text-sm">Moderator: Ask the Doctor to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8">Who does the Doctor save?</h3>
        {renderPlayerList((id) => state.submitNightAction('Doctor', id), true, disableCondition)}
      </div>
    );
  }

  // --- NIGHT: DETECTIVE ---
  if (state.phase === 'night_detective') {
    if (state.investigationResult) {
      const isDeadRole = state.investigationResult === 'DEAD_ROLE';
      const isMafia = state.investigationResult === 'MAFIA';
      
      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 text-center justify-center">
          <p className="text-slate-400 uppercase font-bold tracking-widest text-[10px] mb-4">
            {isDeadRole ? "Moderator: Pretend to give an answer!" : "Moderator: Nod or shake your head."}
          </p>
          <h1 className={`text-6xl font-black uppercase ${isDeadRole ? 'text-slate-700' : isMafia ? 'text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]'}`}>
            {isDeadRole ? 'ROLE DEAD' : state.investigationResult}
          </h1>
          <button 
            onClick={state.advanceFromDetective}
            className="mt-12 p-5 w-full max-w-sm bg-slate-800 rounded-xl font-black tracking-widest uppercase active:scale-95"
          >
            Continue
          </button>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 text-center">
        <h2 className="text-yellow-500 font-black text-2xl uppercase mt-10">Night Phase</h2>
        <p className="text-slate-400 mt-2 text-sm">Moderator: Ask the Detective to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8">Who is investigated?</h3>
        {renderPlayerList((id) => state.submitNightAction('Detective', id), false)}
      </div>
    );
  }

  // --- NIGHT: SHERIFF ---
  if (state.phase === 'night_sheriff') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 text-center">
        <h2 className="text-purple-500 font-black text-2xl uppercase mt-10">Night Phase</h2>
        <p className="text-slate-400 mt-2 text-sm">Moderator: Ask the Sheriff to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8">Who does the Sheriff execute?</h3>
        {renderPlayerList((id) => state.submitNightAction('Sheriff', id), true)}
      </div>
    );
  }

  // --- DAY: RECAP ---
  if (state.phase === 'day_recap' || state.phase === 'day_recap_post_vote') {
    return (
      <div className="min-h-screen bg-[#111] text-white flex flex-col items-center p-6 text-center justify-center">
        <h2 className="text-3xl font-black uppercase mb-8 text-yellow-500 tracking-widest drop-shadow-md">The Town Awakens</h2>
        <div className="w-full max-w-sm space-y-4">
          {state.dayRecap.map((msg, i) => (
            <div key={i} className="p-6 bg-[#1a1a1a] rounded-xl text-lg font-bold border border-[#222] shadow-xl">
              {msg}
            </div>
          ))}
        </div>
        <button 
          onClick={state.phase === 'day_recap' ? state.startVoting : state.advanceToNight}
          className="mt-12 p-5 w-full max-w-sm bg-white text-black rounded-xl font-black tracking-widest uppercase active:scale-95 transition-transform"
        >
          {state.phase === 'day_recap' ? 'Begin Voting' : 'Go To Sleep (Next Night)'}
        </button>
      </div>
    );
  }

  // --- DAY: SEQUENTIAL VOTING ---
  if (state.phase === 'day_voting') {
    const currentVoter = alivePlayers[state.votingState.currentVoterIndex];
    return (
      <div className="min-h-screen bg-[#111] text-white flex flex-col items-center p-6 text-center">
        <h2 className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-10 mb-2">Town Voting</h2>
        <h3 className="text-4xl font-black text-white my-2 uppercase">{currentVoter.name}</h3>
        <p className="text-sm font-bold text-red-500 tracking-widest uppercase">Who do you exile?</p>
        
        <div className="w-full max-w-sm mt-8 space-y-2 max-h-[50vh] overflow-y-auto pr-2">
          {alivePlayers.filter(p => p.id !== currentVoter.id).map(p => (
            <button 
              key={p.id} 
              onClick={() => state.submitVote(p.id)}
              className="w-full p-4 bg-[#1a1a1a] text-white border border-[#222] rounded-xl font-bold uppercase active:scale-95 transition-transform"
            >
              Vote {p.name}
            </button>
          ))}
          <button 
            onClick={() => state.submitVote(null)}
            className="w-full p-4 bg-transparent border border-slate-700 text-slate-400 rounded-xl font-bold uppercase mt-4 active:scale-95"
          >
            Pass / No Vote
          </button>
        </div>
        <p className="mt-8 text-slate-600 font-bold text-[10px] uppercase tracking-widest">
          Vote {state.votingState.currentVoterIndex + 1} of {alivePlayers.length}
        </p>
      </div>
    );
  }

  // --- GAME OVER ---
  if (state.phase === 'gameover') {
    const isMafiaWin = state.winner === 'Mafia';
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className={`text-6xl font-black uppercase mb-4 ${isMafiaWin ? 'text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]' : 'text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]'}`}>
          {state.winner} WIN!
        </h1>
        
        <div className="w-full max-w-sm mt-8 space-y-2 text-left bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <p className="text-slate-500 uppercase text-[10px] tracking-widest font-bold mb-4">Final Roles:</p>
          {state.players.map(p => (
            <div key={p.id} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
              <span className={`font-bold uppercase text-sm tracking-wider ${p.isAlive ? 'text-white' : 'text-slate-600 line-through'}`}>{p.name}</span>
              <span className={`font-bold text-xs tracking-widest uppercase ${p.role === 'Mafia' ? 'text-red-500' : p.role === 'Doctor' ? 'text-blue-400' : p.role === 'Detective' ? 'text-yellow-500' : p.role === 'Sheriff' ? 'text-purple-500' : 'text-green-500'}`}>{p.role}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={state.playAgain}
          className="mt-12 p-5 w-full max-w-sm bg-white text-black rounded-xl font-black uppercase tracking-widest active:scale-95 transition-transform"
        >
          Play Again
        </button>
      </div>
    );
  }

  return null;
}