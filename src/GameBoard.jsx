import React, { useState, useEffect } from 'react';
import { useGameStore } from './store';

// ==============================================
// 1. NIGHT SKY BACKGROUND (Lobby, Transitions, Game Over)
// ==============================================
const MidnightSky = () => (
  <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none" style={{ backgroundColor: '#050505' }}>
    <style>{`
      .stars { position: absolute; inset: 0; background-repeat: repeat; pointer-events: none; will-change: opacity; transform: translateZ(0); }
      .stars-1 { background-image: radial-gradient(1px 1px at 10% 10%, #fff, transparent), radial-gradient(1px 1px at 30% 20%, #fff, transparent), radial-gradient(1px 1px at 50% 50%, #fff, transparent), radial-gradient(1px 1px at 70% 30%, #fff, transparent), radial-gradient(1px 1px at 90% 10%, #fff, transparent); background-size: 100px 100px; animation: twinkle 3s ease-in-out infinite; }
      .stars-2 { background-image: radial-gradient(1.5px 1.5px at 20% 40%, #fff, transparent), radial-gradient(1.5px 1.5px at 60% 85%, #fff, transparent), radial-gradient(1.5px 1.5px at 85% 65%, #fff, transparent); background-size: 150px 150px; animation: twinkle 5s ease-in-out infinite 1s; }
      .stars-3 { background-image: radial-gradient(2px 2px at 40% 70%, #fff, transparent), radial-gradient(2px 2px at 10% 80%, #fff, transparent), radial-gradient(2px 2px at 80% 40%, #fff, transparent); background-size: 200px 200px; animation: twinkle 7s ease-in-out infinite 2s; }
      .meteor { position: absolute; width: 1.5px; height: 1.5px; background: #fff; border-radius: 50%; box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.5); opacity: 0; pointer-events: none; will-change: transform, opacity; transform: translateZ(0); }
      .meteor::after { content: ""; position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 1px; background: linear-gradient(90deg, #fff, transparent); }
      .m1 { top: 10%; left: 110%; animation: shoot 8s linear infinite; }
      .m2 { top: 30%; left: 110%; animation: shoot 12s linear infinite 4s; }
      .m3 { top: 50%; left: 110%; animation: shoot 10s linear infinite 2s; }
      .moon { position: absolute; top: 15%; right: 15%; width: 40px; height: 40px; border-radius: 50%; background: transparent; box-shadow: 7px 7px 0 0 #fdfbd3; filter: drop-shadow(0 0 7px rgba(253, 251, 211, 0.4)); z-index: 10; transform: translateZ(0); }
      @keyframes twinkle { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
      @keyframes shoot { 0% { transform: translateX(0) translateY(0) rotate(-35deg); opacity: 0; } 5% { opacity: 1; } 15% { transform: translateX(-1500px) translateY(1000px) rotate(-35deg); opacity: 0; } 100% { transform: translateX(-1500px) translateY(1000px) rotate(-35deg); opacity: 0; } }
    `}</style>
    <div className="stars stars-1"></div>
    <div className="stars stars-2"></div>
    <div className="stars stars-3"></div>
    <div className="meteor m1"></div>
    <div className="meteor m2"></div>
    <div className="meteor m3"></div>
    <div className="moon"></div>
  </div>
);

// ==============================================
// 2. MORNING SKY BACKGROUND (Day Phases)
// ==============================================
const MorningSky = () => (
  <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, #4A90E2 0%, #FFB75E 100%)' }}>
    <style>{`
      .motes { position: absolute; inset: 0; background-repeat: repeat; pointer-events: none; will-change: opacity; transform: translateZ(0); }
      .motes-1 { background-image: radial-gradient(1.5px 1.5px at 15% 15%, rgba(255,255,255,0.7), transparent), radial-gradient(1.5px 1.5px at 35% 25%, rgba(255,255,255,0.7), transparent), radial-gradient(1.5px 1.5px at 55% 55%, rgba(255,255,255,0.7), transparent), radial-gradient(1.5px 1.5px at 75% 35%, rgba(255,255,255,0.7), transparent), radial-gradient(1.5px 1.5px at 95% 15%, rgba(255,255,255,0.7), transparent); background-size: 100px 100px; animation: twinkle 4s ease-in-out infinite; }
      .motes-2 { background-image: radial-gradient(2px 2px at 25% 45%, rgba(255,255,255,0.5), transparent), radial-gradient(2px 2px at 65% 85%, rgba(255,255,255,0.5), transparent), radial-gradient(2px 2px at 85% 70%, rgba(255,255,255,0.5), transparent); background-size: 150px 150px; animation: twinkle 6s ease-in-out infinite 2s; }
      .wind { position: absolute; width: 60px; height: 2px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent); border-radius: 50%; opacity: 0; pointer-events: none; will-change: transform, opacity; transform: translateZ(0); }
      .w1 { top: 15%; left: 110%; animation: breeze 6s linear infinite; }
      .w2 { top: 40%; left: 110%; animation: breeze 10s linear infinite 3s; }
      .w3 { top: 60%; left: 110%; animation: breeze 8s linear infinite 1s; }
      .sun { position: absolute; top: 15%; right: 15%; width: 50px; height: 50px; border-radius: 50%; background: #FFD700; box-shadow: 0 0 40px 15px rgba(255, 215, 0, 0.5); z-index: 10; transform: translateZ(0); }
      @keyframes breeze { 0% { transform: translateX(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateX(-1500px); opacity: 0; } }
    `}</style>
    <div className="motes motes-1"></div>
    <div className="motes motes-2"></div>
    <div className="wind w1"></div>
    <div className="wind w2"></div>
    <div className="wind w3"></div>
    <div className="sun"></div>
  </div>
);

// ==============================================
// 3. DARK COSMIC BACKGROUND (For Role Reveal)
// ==============================================
const DarkCosmicSky = () => (
  <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)' }}>
    <style>{`
      .cosmic-stars { position: absolute; inset: 0; background-repeat: repeat; pointer-events: none; will-change: opacity; transform: translateZ(0); }
      .c-stars-1 { background-image: radial-gradient(1px 1px at 10% 10%, #fff, transparent), radial-gradient(1px 1px at 30% 20%, #fff, transparent), radial-gradient(1px 1px at 50% 50%, #fff, transparent), radial-gradient(1px 1px at 70% 30%, #fff, transparent), radial-gradient(1px 1px at 90% 10%, #fff, transparent); background-size: 100px 100px; animation: twinkle 3s ease-in-out infinite; }
      .c-stars-2 { background-image: radial-gradient(1.5px 1.5px at 20% 40%, rgba(255,255,255,0.8), transparent), radial-gradient(1.5px 1.5px at 60% 85%, rgba(255,255,255,0.8), transparent), radial-gradient(1.5px 1.5px at 85% 65%, rgba(255,255,255,0.8), transparent); background-size: 150px 150px; animation: twinkle 5s ease-in-out infinite 1s; }
      .c-stars-3 { background-image: radial-gradient(2px 2px at 40% 70%, rgba(255,255,255,0.6), transparent), radial-gradient(2px 2px at 10% 80%, rgba(255,255,255,0.6), transparent), radial-gradient(2px 2px at 80% 40%, rgba(255,255,255,0.6), transparent); background-size: 200px 200px; animation: twinkle 7s ease-in-out infinite 2s; }
      .c-meteor { position: absolute; width: 1.5px; height: 1.5px; background: #fff; border-radius: 50%; box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.5); opacity: 0; pointer-events: none; will-change: transform, opacity; transform: translateZ(0); }
      .c-meteor::after { content: ""; position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 1px; background: linear-gradient(90deg, #fff, transparent); }
      .c-m1 { top: 15%; left: 110%; animation: shoot 6s linear infinite; }
      .c-m2 { top: 45%; left: 110%; animation: shoot 10s linear infinite 3s; }
      .c-m3 { top: 65%; left: 110%; animation: shoot 8s linear infinite 1s; }
      .cosmic-glow { position: absolute; top: 50%; left: 50%; width: 600px; height: 600px; transform: translate(-50%, -50%); border-radius: 50%; background: radial-gradient(circle, rgba(138,43,226,0.1) 0%, transparent 70%); animation: pulseGlow 8s infinite alternate; }
      @keyframes pulseGlow { 0% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.8); } 100% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); } }
    `}</style>
    <div className="cosmic-stars c-stars-1"></div>
    <div className="cosmic-stars c-stars-2"></div>
    <div className="cosmic-stars c-stars-3"></div>
    <div className="c-meteor c-m1"></div>
    <div className="c-meteor c-m2"></div>
    <div className="c-meteor c-m3"></div>
    <div className="cosmic-glow"></div>
  </div>
);

// --- IMAGE PRELOADER ---
const roleImages = {
  'Mafia': '/mafia-card.jpg',
  'Doctor': '/doctor-card.jpg',
  'Detective': '/detective-card.jpg',
  'Sheriff': '/sheriff-card.jpg',
  'Civilian': '/civilian-card.jpg'
};

const glowColors = { 
  'Mafia': '#ff003c',      
  'Doctor': '#00ff75',     
  'Detective': '#00d2ff',  
  'Sheriff': '#f2994a',    
  'Civilian': '#8e44ad'    
};

const ImagePreloader = () => (
  <div className="hidden">
    {Object.values(roleImages).map((src, index) => (
      <img key={index} src={src} alt="preload" fetchpriority="high" />
    ))}
  </div>
);

// --- THE PERFECT AI PHOTO CARD ---
const RoleCard = ({ isFlipped, role }) => {
  return (
    <div className="my-6 relative w-[240px] h-[360px] [perspective:1000px] select-none touch-none">
      <div className={`relative w-full h-full transition-transform duration-[600ms] [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* Front of Card (Unflipped) */}
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-[2rem] bg-[#0a0a0a] border-2 border-slate-800 flex flex-col items-center justify-center p-4 shadow-xl">
           <p className="text-slate-500 font-black tracking-widest uppercase text-center text-xl">Secret Role</p>
           <p className="text-[10px] text-slate-600 mt-4 tracking-widest uppercase font-bold animate-pulse">Tap & Hold to Reveal</p>
        </div>
        
        {/* Back of Card */}
        <div 
          className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[2rem] bg-black" 
          style={{ 
            backgroundImage: `url(${roleImages[role] || roleImages.Civilian})`,
            backgroundPosition: 'center',
            backgroundSize: '105%',
            backgroundRepeat: 'no-repeat',
            boxShadow: isFlipped ? `0px 0px 50px 10px ${glowColors[role] || glowColors.Civilian}40` : 'none' 
          }}
        >
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

  // Background Engine: Decides which sky to render based on phase
  const renderBackground = () => {
    if (state.phase === 'role_reveal') return <DarkCosmicSky />;
    if (state.phase.startsWith('day_')) return <MorningSky />;
    return <MidnightSky />; // Lobby, Night phases, and Game Over use MidnightSky
  };

  const renderBackButton = () => {
    if (state.phase === 'lobby') return null;
    return (
      <button 
        onClick={() => {
          if (window.confirm("Abort current game and go back to Lobby?")) {
            state.resetToLobby();
          }
        }}
        className="absolute top-4 left-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 active:scale-90 z-50 p-3 bg-[#0a0a0a]/80 backdrop-blur-md rounded-lg border border-slate-800 shadow-xl"
      >
        <span>◀</span> LOBBY
      </button>
    );
  };

  const renderPlayerList = (onSelect, includeSkip = false, disableCondition = () => false) => (
    <div className="w-full max-w-sm space-y-2 mt-6 max-h-[50vh] overflow-y-auto pr-2 relative z-10">
      {alivePlayers.map(p => {
        const isDisabled = disableCondition(p);
        return (
          <button 
            key={p.id} 
            onClick={() => onSelect(p.id)}
            disabled={isDisabled}
            className={`w-full p-4 rounded-xl font-bold uppercase transition-all ${isDisabled ? 'bg-slate-900/80 text-slate-500 border border-slate-800' : 'bg-slate-800/90 backdrop-blur-sm text-white active:scale-95 border border-slate-700'}`}
          >
            {p.name} {isDisabled && <span className="text-[10px] ml-2 tracking-widest text-slate-600">(LOCKED)</span>}
          </button>
        );
      })}
      {includeSkip && (
        <button 
          onClick={() => onSelect(null)}
          className="w-full p-4 bg-transparent border border-slate-700/80 backdrop-blur-sm text-slate-300 rounded-xl font-bold uppercase mt-4 active:scale-95"
        >
          Skip / Nobody
        </button>
      )}
    </div>
  );

  // --- LOBBY ---
  if (state.phase === 'lobby') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 overflow-hidden">
        {renderBackground()}
        <ImagePreloader />
        
        <h1 className="text-4xl font-black uppercase mb-8 tracking-[0.2em] text-red-600 mt-14 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)] relative z-10">THE MAFIA</h1>
        
        <div className="w-full max-w-sm bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl mb-6 relative z-10">
          <input 
            value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && newPlayerName) { state.addPlayer(newPlayerName); setNewPlayerName(''); }}}
            placeholder="Add player..."
            className="w-full p-3 bg-black/80 rounded-lg outline-none text-white font-bold mb-2"
          />
          <button 
            onClick={() => { if(newPlayerName) { state.addPlayer(newPlayerName); setNewPlayerName(''); }}}
            className="w-full p-3 bg-red-600/20 text-red-500 border border-red-500/50 rounded-lg font-bold uppercase tracking-widest active:scale-95 transition-transform"
          >Add</button>
        </div>

        <div className="w-full max-w-sm space-y-2 mb-6 max-h-48 overflow-y-auto pr-2 relative z-10">
          {state.players.map(p => (
            <div key={p.id} className="flex justify-between items-center bg-slate-800/50 backdrop-blur-md p-3 rounded-lg border border-slate-700">
              <span className="font-bold tracking-wider text-slate-100">{p.name}</span>
              <button onClick={() => state.removePlayer(p.id)} className="text-slate-400 text-lg active:scale-90">✕</button>
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm flex items-center justify-between bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-xl mb-6 relative z-10">
          <span className="font-bold text-[10px] tracking-widest uppercase text-slate-300">Reveal Roles on Death?</span>
          <button 
            onClick={state.toggleRevealRoles} 
            className={`px-4 py-2 rounded text-[10px] uppercase font-black tracking-widest transition-colors ${state.settings.revealRoles ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-slate-800 text-slate-500'}`}
          >
            {state.settings.revealRoles ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* EXACT STEALTHWORM START MATCH BUTTON */}
        <div className="w-full flex justify-center relative z-10 mb-6">
          <button 
            disabled={state.players.length < 4}
            onClick={() => {
              setTimeout(() => { state.startGame(); }, 250); 
            }}
            className="stealth-btn"
          >
            <strong className="stealth-strong">BEGIN GAME ({state.players.length})</strong>
            <div className="stealth-container-stars">
              <div className="stealth-stars"></div>
            </div>
            <div className="stealth-glow">
              <div className="stealth-circle"></div>
              <div className="stealth-circle"></div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // --- ROLE REVEAL PHASE ---
  if (state.phase === 'role_reveal') {
    const currentPlayer = state.players[state.revealIndex];
    const isLastPlayer = state.revealIndex === state.players.length - 1;

    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px] mb-2 relative z-10">Pass phone to</p>
        <h2 className="text-4xl font-black text-white uppercase mb-8 drop-shadow-md relative z-10">{currentPlayer.name}</h2>
        
        <div 
          onMouseDown={() => setIsFlipped(true)}
          onMouseUp={() => setIsFlipped(false)}
          onMouseLeave={() => setIsFlipped(false)}
          onTouchStart={() => setIsFlipped(true)}
          onTouchEnd={() => setIsFlipped(false)}
          className="cursor-pointer relative z-10"
        >
          <RoleCard isFlipped={isFlipped} role={currentPlayer.role} />
        </div>

        <button 
          onClick={() => { setIsFlipped(false); state.nextRoleReveal(); }}
          disabled={isFlipped} 
          className={`mt-12 p-5 w-full max-w-sm rounded-xl font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${isFlipped ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0 bg-slate-800/90 backdrop-blur-md text-white border border-slate-700 active:scale-95'}`}
        >
          {isLastPlayer ? 'Give to Moderator' : 'Next Player'}
        </button>
      </div>
    );
  }

  // --- NEW: NIGHT TRANSITION SCREEN ---
  if (state.phase === 'night_transition') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-5xl font-black text-blue-400 uppercase mb-4 tracking-widest drop-shadow-[0_0_20px_rgba(96,165,250,0.5)]">
            EVERYONE CLOSE YOUR EYES
          </h2>
          <p className="text-slate-300 font-bold tracking-widest uppercase text-sm mt-4">
            The night is falling over the town...
          </p>
          <button 
            onClick={state.startNightRoles}
            className="mt-16 p-5 w-full max-w-sm bg-slate-800/90 backdrop-blur-md rounded-xl font-black tracking-widest uppercase active:scale-95 border border-slate-700"
          >
            Moderator: Begin Night
          </button>
        </div>
      </div>
    );
  }

  // --- NIGHT: MAFIA ---
  if (state.phase === 'night_mafia') {
    const disableCondition = (p) => p.role === 'Mafia';
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-red-500 font-black text-2xl uppercase mt-14 relative z-10 drop-shadow-md">Night Phase</h2>
        <p className="text-slate-300 mt-2 text-sm relative z-10">Moderator: Ask the Mafia to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8 relative z-10 drop-shadow-md">Who does the Mafia kill?</h3>
        {renderPlayerList((id) => state.submitNightAction('Mafia', id), true, disableCondition)}
      </div>
    );
  }

  // --- NIGHT: DOCTOR ---
  if (state.phase === 'night_doctor') {
    const disableCondition = (p) => p.id === state.doctorLastSaved || (p.role === 'Doctor' && state.doctorHasSelfSaved);
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-blue-400 font-black text-2xl uppercase mt-14 relative z-10 drop-shadow-md">Night Phase</h2>
        <p className="text-slate-300 mt-2 text-sm relative z-10">Moderator: Ask the Doctor to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8 relative z-10 drop-shadow-md">Who does the Doctor save?</h3>
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
        <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center justify-center overflow-hidden">
          {renderBackground()}
          {renderBackButton()}
          <p className="text-slate-300 uppercase font-bold tracking-widest text-[10px] mb-4 relative z-10">
            {isDeadRole ? "Moderator: Pretend to give an answer!" : "Moderator: Nod or shake your head."}
          </p>
          <h1 className={`text-6xl font-black uppercase relative z-10 ${isDeadRole ? 'text-slate-500' : isMafia ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)]'}`}>
            {isDeadRole ? 'ROLE DEAD' : state.investigationResult}
          </h1>
          <button 
            onClick={state.advanceFromDetective}
            className="mt-12 p-5 w-full max-w-sm bg-slate-800/90 backdrop-blur-md rounded-xl font-black tracking-widest uppercase active:scale-95 relative z-10 border border-slate-700"
          >
            Continue
          </button>
        </div>
      );
    }
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-yellow-400 font-black text-2xl uppercase mt-14 relative z-10 drop-shadow-md">Night Phase</h2>
        <p className="text-slate-300 mt-2 text-sm relative z-10">Moderator: Ask the Detective to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8 relative z-10 drop-shadow-md">Who is investigated?</h3>
        {renderPlayerList((id) => state.submitNightAction('Detective', id), false)}
      </div>
    );
  }

  // --- NIGHT: SHERIFF ---
  if (state.phase === 'night_sheriff') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-purple-400 font-black text-2xl uppercase mt-14 relative z-10 drop-shadow-md">Night Phase</h2>
        <p className="text-slate-300 mt-2 text-sm relative z-10">Moderator: Ask the Sheriff to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8 relative z-10 drop-shadow-md">Who does the Sheriff execute?</h3>
        {renderPlayerList((id) => state.submitNightAction('Sheriff', id), true)}
      </div>
    );
  }

  // --- NEW: DAY TRANSITION SCREEN ---
  if (state.phase === 'day_transition') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-5xl font-black text-yellow-300 uppercase mb-4 tracking-widest drop-shadow-[0_0_20px_rgba(253,224,71,0.5)]">
            EVERYONE OPEN YOUR EYES
          </h2>
          <p className="text-slate-100 font-bold tracking-widest uppercase text-sm mt-4 drop-shadow-md">
            The sun rises. Let's see what happened...
          </p>
          <button 
            onClick={state.startDayRecap}
            className="mt-16 p-5 w-full max-w-sm bg-white text-slate-900 rounded-xl font-black tracking-widest uppercase active:scale-95 shadow-xl border border-slate-200"
          >
            View Recap
          </button>
        </div>
      </div>
    );
  }

  // --- DAY: RECAP ---
  if (state.phase === 'day_recap' || state.phase === 'day_recap_post_vote') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center justify-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-3xl font-black uppercase mb-8 text-yellow-300 tracking-widest drop-shadow-md mt-14 relative z-10">The Town Awakens</h2>
        <div className="w-full max-w-sm space-y-4 relative z-10">
          {state.dayRecap.map((msg, i) => (
            <div key={i} className="p-6 bg-slate-900/60 backdrop-blur-md rounded-xl text-lg font-bold border border-slate-700 shadow-xl">
              {msg}
            </div>
          ))}
        </div>
        <button 
          onClick={state.phase === 'day_recap' ? state.startVoting : state.advanceToNight}
          className="mt-12 p-5 w-full max-w-sm bg-white text-slate-900 rounded-xl font-black tracking-widest uppercase active:scale-95 transition-transform shadow-xl relative z-10"
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
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-slate-200 font-bold uppercase tracking-widest text-[10px] mt-14 mb-2 relative z-10 drop-shadow-md">Town Voting</h2>
        <h3 className="text-4xl font-black text-white my-2 uppercase relative z-10 drop-shadow-md">{currentVoter.name}</h3>
        <p className="text-sm font-bold text-red-500 tracking-widest uppercase relative z-10 drop-shadow-md">Who do you exile?</p>
        
        <div className="w-full max-w-sm mt-8 space-y-2 max-h-[50vh] overflow-y-auto pr-2 relative z-10">
          {alivePlayers.filter(p => p.id !== currentVoter.id).map(p => (
            <button 
              key={p.id} 
              onClick={() => state.submitVote(p.id)}
              className="w-full p-4 bg-slate-900/70 backdrop-blur-md text-white border border-slate-700 rounded-xl font-bold uppercase active:scale-95 transition-transform"
            >
              Vote {p.name}
            </button>
          ))}
          <button 
            onClick={() => state.submitVote(null)}
            className="w-full p-4 bg-transparent border border-slate-600 backdrop-blur-sm text-slate-200 rounded-xl font-bold uppercase mt-4 active:scale-95"
          >
            Pass / No Vote
          </button>
        </div>
        <p className="mt-8 text-slate-300 font-bold text-[10px] uppercase tracking-widest relative z-10">
          Vote {state.votingState.currentVoterIndex + 1} of {alivePlayers.length}
        </p>
      </div>
    );
  }

  // --- GAME OVER ---
  if (state.phase === 'gameover') {
    const isMafiaWin = state.winner === 'Mafia';
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <h1 className={`text-6xl font-black uppercase mb-4 mt-14 relative z-10 ${isMafiaWin ? 'text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]' : 'text-blue-400 drop-shadow-[0_0_30px_rgba(96,165,250,0.6)]'}`}>
          {state.winner} WIN!
        </h1>
        
        <div className="w-full max-w-sm mt-8 space-y-2 text-left bg-slate-900/70 backdrop-blur-md p-6 rounded-2xl border border-slate-700 relative z-10">
          <p className="text-slate-300 uppercase text-[10px] tracking-widest font-bold mb-4">Final Roles:</p>
          {state.players.map(p => (
            <div key={p.id} className="flex justify-between items-center py-2 border-b border-slate-700/50 last:border-0">
              <span className={`font-bold uppercase text-sm tracking-wider ${p.isAlive ? 'text-white' : 'text-slate-500 line-through'}`}>{p.name}</span>
              <span className={`font-bold text-xs tracking-widest uppercase ${p.role === 'Mafia' ? 'text-red-400' : p.role === 'Doctor' ? 'text-green-400' : p.role === 'Detective' ? 'text-blue-400' : p.role === 'Sheriff' ? 'text-purple-400' : 'text-slate-300'}`}>{p.role}</span>
            </div>
          ))}
        </div>

        {/* EXACT STEALTHWORM START MATCH BUTTON FOR PLAY AGAIN */}
        <div className="w-full flex justify-center mt-12 mb-6 relative z-10">
          <button 
            onClick={() => {
              setTimeout(() => { state.playAgain(); }, 250);
            }}
            className="stealth-btn"
          >
            <strong className="stealth-strong">PLAY AGAIN</strong>
            <div className="stealth-container-stars">
              <div className="stealth-stars"></div>
            </div>
            <div className="stealth-glow">
              <div className="stealth-circle"></div>
              <div className="stealth-circle"></div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return null;
}