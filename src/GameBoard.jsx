import React, { useState } from 'react';
import { useGameStore } from './store';

export default function GameBoard() {
  const state = useGameStore();
  const [newPlayerName, setNewPlayerName] = useState('');

  const alivePlayers = state.players.filter(p => p.isAlive);

  const renderPlayerList = (onSelect, includeSkip = false) => (
    <div className="w-full max-w-sm space-y-2 mt-6">
      {alivePlayers.map(p => (
        <button 
          key={p.id} 
          onClick={() => onSelect(p.id)}
          className="w-full p-4 bg-slate-800 text-white rounded-xl font-bold uppercase active:scale-95 transition-transform"
        >
          {p.name}
        </button>
      ))}
      {includeSkip && (
        <button 
          onClick={() => onSelect(null)}
          className="w-full p-4 bg-slate-600 text-white rounded-xl font-bold uppercase mt-4 active:scale-95 transition-transform"
        >
          Skip / Nobody
        </button>
      )}
    </div>
  );

  if (state.phase === 'lobby') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6">
        <h1 className="text-4xl font-black uppercase mb-8 tracking-[0.2em] text-red-600 mt-10">THE MAFIA</h1>
        
        <div className="w-full max-w-sm bg-slate-900 p-4 rounded-2xl mb-6">
          <input 
            value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Add player..."
            className="w-full p-3 bg-black rounded-lg outline-none text-white font-bold mb-2"
          />
          <button 
            onClick={() => { if(newPlayerName) { state.addPlayer(newPlayerName); setNewPlayerName(''); }}}
            className="w-full p-3 bg-blue-600 rounded-lg font-bold uppercase"
          >Add</button>
        </div>

        <div className="w-full max-w-sm space-y-2 mb-6">
          {state.players.map(p => (
            <div key={p.id} className="flex justify-between bg-slate-800 p-3 rounded-lg">
              <span className="font-bold">{p.name}</span>
              <button onClick={() => state.removePlayer(p.id)} className="text-red-400">✕</button>
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm flex items-center justify-between bg-slate-900 p-4 rounded-xl mb-6">
          <span className="font-bold text-sm uppercase">Reveal Roles on Death?</span>
          <button 
            onClick={state.toggleRevealRoles} 
            className={`px-4 py-2 rounded font-bold ${state.settings.revealRoles ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {state.settings.revealRoles ? 'ON' : 'OFF'}
          </button>
        </div>

        <button 
          disabled={state.players.length < 4}
          onClick={state.startGame}
          className="w-full max-w-sm p-4 bg-red-600 rounded-xl font-black tracking-widest uppercase disabled:opacity-50"
        >
          Start Game ({state.players.length})
        </button>
      </div>
    );
  }

  if (state.phase === 'night_mafia') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 text-center">
        <h2 className="text-red-600 font-black text-2xl uppercase mt-10">Night Phase</h2>
        <p className="text-slate-400 mt-2">Moderator: Ask the Mafia to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8">Who does the Mafia kill?</h3>
        {renderPlayerList((id) => state.submitNightAction('Mafia', id), true)}
      </div>
    );
  }

  if (state.phase === 'night_doctor') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 text-center">
        <h2 className="text-blue-500 font-black text-2xl uppercase mt-10">Night Phase</h2>
        <p className="text-slate-400 mt-2">Moderator: Ask the Doctor to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8">Who does the Doctor save?</h3>
        {renderPlayerList((id) => state.submitNightAction('Doctor', id), true)}
      </div>
    );
  }

  if (state.phase === 'night_detective') {
    if (state.investigationResult) {
      const isMafia = state.investigationResult === 'MAFIA';
      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 text-center justify-center">
          <p className="text-slate-400 uppercase tracking-widest mb-4">Moderator: Nod or shake your head.</p>
          <h1 className={`text-6xl font-black uppercase ${isMafia ? 'text-red-600' : 'text-green-500'}`}>
            {state.investigationResult}
          </h1>
          <button 
            onClick={state.advanceFromDetective}
            className="mt-12 p-4 w-full max-w-sm bg-slate-800 rounded-xl font-bold uppercase"
          >
            Continue
          </button>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 text-center">
        <h2 className="text-yellow-500 font-black text-2xl uppercase mt-10">Night Phase</h2>
        <p className="text-slate-400 mt-2">Moderator: Ask the Detective to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8">Who does the Detective investigate?</h3>
        {renderPlayerList((id) => state.submitNightAction('Detective', id), false)}
      </div>
    );
  }

  if (state.phase === 'night_sheriff') {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-6 text-center">
        <h2 className="text-purple-500 font-black text-2xl uppercase mt-10">Night Phase</h2>
        <p className="text-slate-400 mt-2">Moderator: Ask the Sheriff to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8">Who does the Sheriff execute?</h3>
        {renderPlayerList((id) => state.submitNightAction('Sheriff', id), true)}
      </div>
    );
  }

  if (state.phase === 'day_recap' || state.phase === 'day_recap_post_vote') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6 text-center justify-center">
        <h2 className="text-3xl font-black uppercase mb-8 text-yellow-500">The Town Awakens</h2>
        <div className="w-full max-w-sm space-y-4">
          {state.dayRecap.map((msg, i) => (
            <div key={i} className="p-6 bg-slate-800 rounded-xl text-lg font-bold border border-slate-700">
              {msg}
            </div>
          ))}
        </div>
        <button 
          onClick={state.phase === 'day_recap' ? state.startVoting : state.advanceToNight}
          className="mt-12 p-4 w-full max-w-sm bg-white text-black rounded-xl font-black tracking-widest uppercase"
        >
          {state.phase === 'day_recap' ? 'Begin Voting' : 'Go To Sleep (Next Night)'}
        </button>
      </div>
    );
  }

  if (state.phase === 'day_voting') {
    const currentVoter = alivePlayers[state.votingState.currentVoterIndex];
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6 text-center">
        <h2 className="text-slate-400 font-bold uppercase tracking-widest mt-10">Town Voting</h2>
        <h3 className="text-4xl font-black text-yellow-400 my-4 uppercase">{currentVoter.name}</h3>
        <p className="text-lg">Who do you vote to exile?</p>
        
        <div className="w-full max-w-sm mt-8 space-y-2">
          {alivePlayers.filter(p => p.id !== currentVoter.id).map(p => (
            <button 
              key={p.id} 
              onClick={() => state.submitVote(p.id)}
              className="w-full p-4 bg-slate-800 text-white rounded-xl font-bold uppercase active:scale-95 transition-transform"
            >
              Vote {p.name}
            </button>
          ))}
          <button 
            onClick={() => state.submitVote(null)}
            className="w-full p-4 bg-slate-700 text-slate-300 rounded-xl font-bold uppercase mt-4"
          >
            Pass / No Vote
          </button>
        </div>
        <p className="mt-8 text-slate-500 font-bold text-xs uppercase">
          Vote {state.votingState.currentVoterIndex + 1} of {alivePlayers.length}
        </p>
      </div>
    );
  }

  if (state.phase === 'gameover') {
    const isMafiaWin = state.winner === 'Mafia';
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className={`text-6xl font-black uppercase mb-4 ${isMafiaWin ? 'text-red-600' : 'text-blue-500'}`}>
          {state.winner} WIN!
        </h1>
        
        <div className="w-full max-w-sm mt-8 space-y-2 text-left">
          <p className="text-slate-400 uppercase text-xs font-bold mb-2">Final Roles:</p>
          {state.players.map(p => (
            <div key={p.id} className="flex justify-between bg-slate-900 p-3 rounded border border-slate-800">
              <span className={`font-bold ${p.isAlive ? 'text-white' : 'text-slate-600 line-through'}`}>{p.name}</span>
              <span className={`font-bold ${p.role === 'Mafia' ? 'text-red-400' : 'text-blue-400'}`}>{p.role}</span>
            </div>
          ))}
        </div>

        <button 
          onClick={state.playAgain}
          className="mt-12 p-4 w-full max-w-sm bg-white text-black rounded-xl font-black uppercase tracking-widest"
        >
          Play Again
        </button>
      </div>
    );
  }

  return null;
}
