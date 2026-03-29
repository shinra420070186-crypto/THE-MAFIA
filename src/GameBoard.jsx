import React, { useState, useEffect } from 'react';
import { useGameStore } from './store';

// ==============================================
// 1. EXACT NIGHT SKY BACKGROUND
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
// 2. EXACT MORNING SKY BACKGROUND
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
// 3. EXACT ACTIVE GAME SKY (TWILIGHT)
// ==============================================
const TwilightSky = () => (
  <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, #2B1055 0%, #7597DE 100%)' }}>
    <style>{`
      .twinkle-stars { position: absolute; inset: 0; background-repeat: repeat; pointer-events: none; will-change: opacity; transform: translateZ(0); }
      .tw-1 { background-image: radial-gradient(1px 1px at 15% 15%, #fff, transparent), radial-gradient(1px 1px at 35% 25%, #fff, transparent), radial-gradient(1px 1px at 55% 55%, #fff, transparent), radial-gradient(1px 1px at 75% 35%, #fff, transparent), radial-gradient(1px 1px at 95% 15%, #fff, transparent); background-size: 100px 100px; animation: twilight-twinkle 4s ease-in-out infinite; }
      .tw-2 { background-image: radial-gradient(1.5px 1.5px at 25% 45%, #fff, transparent), radial-gradient(1.5px 1.5px at 65% 85%, #fff, transparent), radial-gradient(1.5px 1.5px at 85% 70%, #fff, transparent); background-size: 150px 150px; animation: twilight-twinkle 6s ease-in-out infinite 2s; }
      .tw-3 { background-image: radial-gradient(2px 2px at 40% 70%, #fff, transparent), radial-gradient(2px 2px at 10% 80%, #fff, transparent), radial-gradient(2px 2px at 80% 40%, #fff, transparent); background-size: 200px 200px; animation: twilight-twinkle 7s ease-in-out infinite 3s; }
      .tw-meteor { position: absolute; width: 1.5px; height: 1.5px; background: #fff; border-radius: 50%; box-shadow: 0 0 5px 1px rgba(255, 255, 255, 0.5); opacity: 0; pointer-events: none; will-change: transform, opacity; transform: translateZ(0); }
      .tw-meteor::after { content: ""; position: absolute; top: 50%; transform: translateY(-50%); width: 40px; height: 1px; background: linear-gradient(90deg, #fff, transparent); }
      .tw-m1 { top: 15%; left: 110%; animation: twilight-shoot 6s linear infinite; }
      .tw-m2 { top: 45%; left: 110%; animation: twilight-shoot 10s linear infinite 3s; }
      .tw-m3 { top: 65%; left: 110%; animation: twilight-shoot 8s linear infinite 1s; }
      .tw-body { position: absolute; top: 15%; right: 15%; width: 45px; height: 45px; border-radius: 50%; background: #FF9A9E; box-shadow: 0 0 50px 15px rgba(255, 154, 158, 0.6); z-index: 10; transform: translateZ(0); }

      @keyframes twilight-twinkle { 0%, 100% { opacity: 1; } 50% { opacity: 0.2; } }
      @keyframes twilight-shoot { 0% { transform: translateX(0) translateY(0) rotate(-35deg); opacity: 0; } 5% { opacity: 1; } 15% { transform: translateX(-1500px) translateY(1000px) rotate(-35deg); opacity: 0; } 100% { transform: translateX(-1500px) translateY(1000px) rotate(-35deg); opacity: 0; } }
    `}</style>
    <div className="twinkle-stars tw-1"></div>
    <div className="twinkle-stars tw-2"></div>
    <div className="twinkle-stars tw-3"></div>
    <div className="tw-meteor tw-m1"></div>
    <div className="tw-meteor tw-m2"></div>
    <div className="tw-meteor tw-m3"></div>
    <div className="tw-body"></div>
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
        
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-[2rem] bg-[#0a0a0a] border border-slate-800 flex flex-col items-center justify-center p-4 shadow-xl">
           <p className="text-slate-500 font-black tracking-widest uppercase text-center text-xl">Secret Role</p>
           <p className="text-[10px] text-slate-600 mt-4 tracking-widest uppercase font-bold animate-pulse">Tap & Hold to Reveal</p>
        </div>
        
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
  const availableRecentNames = state.recentNames.filter(n => !state.players.some(p => p.name === n));

  // --- AUTOMATIC CINEMATIC TIMERS ---
  useEffect(() => {
    let timer;
    if (state.phase === 'night_transition') {
      timer = setTimeout(() => {
        state.startNightRoles();
      }, 4000);
    } else if (state.phase === 'day_transition') {
      timer = setTimeout(() => {
        state.startDayRecap();
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [state.phase]);

  // Background Engine
  const renderBackground = () => {
    if (state.phase === 'splash') return null; 
    if (state.phase === 'role_reveal') return <TwilightSky />;
    if (state.phase === 'day_transition' || state.phase.startsWith('day_')) return <MorningSky />;
    return <MidnightSky />; // Lobby uses MidnightSky again
  };

  const renderBackButton = () => {
    if (state.phase === 'lobby' || state.phase === 'splash') return null;
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
            className={`w-full p-4 rounded-xl font-bold uppercase transition-all ${isDisabled ? 'bg-slate-900/80 text-slate-600 border border-slate-800' : 'bg-[#111] text-white active:scale-95 border border-slate-700'}`}
          >
            {p.name} {isDisabled && <span className="text-[10px] ml-2 tracking-widest text-slate-600">(LOCKED)</span>}
          </button>
        );
      })}
      {includeSkip && (
        <button 
          onClick={() => onSelect(null)}
          className="w-full p-4 bg-transparent border border-slate-700/80 text-slate-400 rounded-xl font-bold uppercase mt-4 active:scale-95"
        >
          Skip / Nobody
        </button>
      )}
    </div>
  );

  // --- NEW SPLASH SCREEN ---
  if (state.phase === 'splash') {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
        <ImagePreloader />
        <div className="relative z-10">
          <button 
            onClick={() => {
              setTimeout(() => {
                state.enterLobby();
              }, 1500); 
            }}
            className="batman-btn"
          >
            <span>PLAY GAME</span>
          </button>
        </div>
      </div>
    );
  }

  // --- LOBBY (MidnightSky + Poda Input + Stealth Button + Briefcase Lists) ---
  if (state.phase === 'lobby') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 overflow-hidden">
        {renderBackground()}
        
        <h1 className="text-4xl font-black uppercase mb-10 tracking-[0.2em] text-red-600 mt-14 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)] relative z-10">THE MAFIA</h1>
        
        {/* EXACT LAKSHAY-ART PODA INPUT */}
        <div className="w-full mb-10 flex justify-center relative z-10">
          <div className="poda-wrapper">
            <div className="poda-glow"></div>
            <div className="poda-darkBorderBg"></div>
            <div className="poda-darkBorderBg"></div>
            <div className="poda-darkBorderBg"></div>
            <div className="poda-white"></div>
            <div className="poda-border"></div>
            <div className="poda-main">
              <input 
                placeholder="Add Player..." 
                type="text" 
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && newPlayerName.trim()) { 
                    state.addPlayer(newPlayerName.trim()); 
                    setNewPlayerName(''); 
                  } 
                }}
                className="poda-input" 
              />
              <div className="poda-input-mask"></div>
              <div className="poda-pink-mask"></div>
              <div className="poda-filterBorder"></div>
              
              <div 
                className="poda-filter-icon" 
                onClick={() => { 
                  if(newPlayerName.trim()) { 
                    state.addPlayer(newPlayerName.trim()); 
                    setNewPlayerName(''); 
                  } 
                }}
              >
                <svg preserveAspectRatio="none" height="27" width="27" viewBox="4.8 4.56 14.832 15.408" fill="none">
                  <path d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z" stroke="#d6d6e6" strokeWidth="1" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              
              <div className="poda-search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" height="24" fill="none">
                  <circle stroke="url(#search)" r="8" cy="11" cx="11"></circle>
                  <line stroke="url(#searchl)" y2="16.65" y1="22" x2="16.65" x1="22"></line>
                  <defs>
                    <linearGradient gradientTransform="rotate(50)" id="search">
                      <stop stopColor="#f8e7f8" offset="0%"></stop>
                      <stop stopColor="#b6a9b7" offset="50%"></stop>
                    </linearGradient>
                    <linearGradient id="searchl">
                      <stop stopColor="#b6a9b7" offset="0%"></stop>
                      <stop stopColor="#837484" offset="50%"></stop>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* EXACT BRIEFCASE BLUFF "RECENT PLAYERS" LIST */}
        {availableRecentNames.length > 0 && (
          <div className="w-full mb-6 relative z-10">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 pl-2 text-center drop-shadow-md">Recent Players</p>
            <div className="flex flex-wrap justify-center gap-2">
              {availableRecentNames.slice(0, 6).map(name => (
                <button 
                  key={name} 
                  onClick={() => state.addPlayer(name)} 
                  className="px-4 py-2 bg-[#222] text-[#e81cff] border border-[#e81cff]/30 rounded-full text-xs font-bold tracking-wider active:scale-95 transition-all shadow-md"
                >
                  + {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* EXACT BRIEFCASE BLUFF "ADDED PLAYERS" LIST */}
        <div className="w-full space-y-2 mb-10 max-h-[300px] overflow-y-auto px-2 relative z-10">
          {state.players.map((p) => (
            <div key={p.id} className="flex justify-between items-center py-4 px-6 bg-[#010201]/80 backdrop-blur-md border border-[#40c9ff]/30 rounded-2xl shadow-sm transition-all">
              <span className="font-bold tracking-widest text-white">{p.name}</span>
              <button onClick={() => state.removePlayer(p.id)} className="text-rose-500 font-bold active:scale-90 flex items-center justify-center w-6 h-6">✕</button>
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm flex items-center justify-between bg-[#010201]/80 backdrop-blur-md border border-[#40c9ff]/30 p-4 rounded-xl mb-10 relative z-10">
          <span className="font-bold text-[10px] tracking-widest uppercase text-slate-400">Reveal Roles on Death?</span>
          <button 
            onClick={state.toggleRevealRoles} 
            className={`px-4 py-2 rounded text-[10px] uppercase font-black tracking-widest transition-colors ${state.settings.revealRoles ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-[#222] text-slate-500 border border-slate-700'}`}
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

  // --- ROLE REVEAL PHASE (Exact TwilightSky) ---
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
          className={`mt-12 p-5 w-full max-w-sm rounded-xl font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${isFlipped ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0 bg-[#0a0a0a]/90 backdrop-blur-md text-white border border-slate-800 active:scale-95'}`}
        >
          {isLastPlayer ? 'Give to Moderator' : 'Next Player'}
        </button>
      </div>
    );
  }

  // --- CINEMATIC: NIGHT TRANSITION ---
  if (state.phase === 'night_transition') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] animate-pulse">
            EVERYONE CLOSE YOUR EYES
          </h2>
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
        <h2 className="text-red-600 font-black text-2xl uppercase mt-14 relative z-10 drop-shadow-md">Night Phase</h2>
        <p className="text-slate-400 mt-2 text-sm relative z-10">Moderator: Ask the Mafia to wake up and point.</p>
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
        <h2 className="text-blue-500 font-black text-2xl uppercase mt-14 relative z-10 drop-shadow-md">Night Phase</h2>
        <p className="text-slate-400 mt-2 text-sm relative z-10">Moderator: Ask the Doctor to wake up and point.</p>
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
          <p className="text-slate-400 uppercase font-bold tracking-widest text-[10px] mb-4 relative z-10">
            {isDeadRole ? "Moderator: Pretend to give an answer!" : "Moderator: Nod or shake your head."}
          </p>
          <h1 className={`text-6xl font-black uppercase relative z-10 ${isDeadRole ? 'text-slate-600' : isMafia ? 'text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]'}`}>
            {isDeadRole ? 'ROLE DEAD' : state.investigationResult}
          </h1>
          <button 
            onClick={state.advanceFromDetective}
            className="mt-12 p-5 w-full max-w-sm bg-[#0a0a0a]/90 backdrop-blur-md rounded-xl font-black tracking-widest uppercase active:scale-95 relative z-10 border border-slate-800"
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
        <h2 className="text-yellow-500 font-black text-2xl uppercase mt-14 relative z-10 drop-shadow-md">Night Phase</h2>
        <p className="text-slate-400 mt-2 text-sm relative z-10">Moderator: Ask the Detective to wake up and point.</p>
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
        <h2 className="text-purple-500 font-black text-2xl uppercase mt-14 relative z-10 drop-shadow-md">Night Phase</h2>
        <p className="text-slate-400 mt-2 text-sm relative z-10">Moderator: Ask the Sheriff to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8 relative z-10 drop-shadow-md">Who does the Sheriff execute?</h3>
        {renderPlayerList((id) => state.submitNightAction('Sheriff', id), true)}
      </div>
    );
  }

  // --- CINEMATIC: DAY TRANSITION ---
  if (state.phase === 'day_transition') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        {renderBackground()}
        {renderBackButton()}
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-pulse">
            EVERYONE OPEN YOUR EYES
          </h2>
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
        <h2 className="text-3xl font-black uppercase mb-8 text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] mt-14 relative z-10">The Town Awakens</h2>
        <div className="w-full max-w-sm space-y-4 relative z-10">
          {state.dayRecap.map((msg, i) => (
            <div key={i} className="p-6 bg-slate-900/40 backdrop-blur-md rounded-xl text-lg font-bold border border-slate-700/50 shadow-xl">
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
        <h2 className="text-slate-100 font-bold uppercase tracking-widest text-[10px] mt-14 mb-2 relative z-10 drop-shadow-md">Town Voting</h2>
        <h3 className="text-4xl font-black text-white my-2 uppercase relative z-10 drop-shadow-md">{currentVoter.name}</h3>
        <p className="text-sm font-bold text-red-500 tracking-widest uppercase relative z-10 drop-shadow-md">Who do you exile?</p>
        
        <div className="w-full max-w-sm mt-8 space-y-2 max-h-[50vh] overflow-y-auto pr-2 relative z-10">
          {alivePlayers.filter(p => p.id !== currentVoter.id).map(p => (
            <button 
              key={p.id} 
              onClick={() => state.submitVote(p.id)}
              className="w-full p-4 bg-slate-900/60 backdrop-blur-md text-white border border-slate-700/50 rounded-xl font-bold uppercase active:scale-95 transition-transform"
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
        <p className="mt-8 text-white font-bold text-[10px] uppercase tracking-widest relative z-10">
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
        <h1 className={`text-6xl font-black uppercase mb-4 mt-14 relative z-10 ${isMafiaWin ? 'text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]' : 'text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]'}`}>
          {state.winner} WIN!
        </h1>
        
        <div className="w-full max-w-sm mt-8 space-y-2 text-left bg-[#0a0a0a]/80 backdrop-blur-md p-6 rounded-2xl border border-slate-800 relative z-10">
          <p className="text-slate-400 uppercase text-[10px] tracking-widest font-bold mb-4">Final Roles:</p>
          {state.players.map(p => (
            <div key={p.id} className="flex justify-between items-center py-2 border-b border-slate-800/50 last:border-0">
              <span className={`font-bold uppercase text-sm tracking-wider ${p.isAlive ? 'text-white' : 'text-slate-600 line-through'}`}>{p.name}</span>
              <span className={`font-bold text-xs tracking-widest uppercase ${p.role === 'Mafia' ? 'text-red-500' : p.role === 'Doctor' ? 'text-green-500' : p.role === 'Detective' ? 'text-blue-500' : p.role === 'Sheriff' ? 'text-purple-500' : 'text-slate-400'}`}>{p.role}</span>
            </div>
          ))}
        </div>

        <div className="w-full flex justify-center mt-12 mb-6 relative z-10">
          <button 
            onClick={() => {
              setTimeout(() => { state.playAgain(); }, 1500); 
            }}
            className="batman-btn"
          >
            <span>PLAY AGAIN</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}