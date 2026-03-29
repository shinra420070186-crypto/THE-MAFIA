import React, { useState, useEffect } from 'react';
import { useGameStore } from './store';

// ==============================================
// 1. NIGHT SKY BACKGROUND
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
// 2. MORNING SKY BACKGROUND
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
// 3. ACTIVE GAME SKY (TWILIGHT)
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
  const [isDayMode, setIsDayMode] = useState(false); // Controls background in Lobby

  const alivePlayers = state.players.filter(p => p.isAlive);

  const renderBackButton = () => {
    if (state.phase === 'lobby') return null;
    return (
      <button 
        onClick={() => {
          if (window.confirm("Abort current game and go back to Lobby?")) {
            state.resetToLobby();
          }
        }}
        className="absolute top-4 left-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 active:scale-90 z-50 p-3 bg-[#0a0a0a] rounded-lg border border-slate-800 shadow-xl"
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
        {/* Dynamic Sky Background */}
        {isDayMode ? <MorningSky /> : <MidnightSky />}
        <ImagePreloader />
        
        {/* DAY/NIGHT TOGGLE SWITCH */}
        <div className="fixed top-6 right-6 z-40 shadow-xl rounded-full">
          <label className="theme-switch" htmlFor="theme-switch-toggle">
            <input type="checkbox" id="theme-switch-toggle" className="theme-switch__checkbox" checked={!isDayMode} onChange={() => setIsDayMode(!isDayMode)} />
            <div className="theme-switch__container">
              <div className="theme-switch__clouds"></div>
              <div className="theme-switch__stars-container">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 55" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.055 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z" fill="currentColor"></path>
                </svg>
              </div>
              <div className="theme-switch__circle-container">
                <div className="theme-switch__sun-moon-container">
                  <div className="theme-switch__moon">
                    <div className="theme-switch__spot"></div>
                    <div className="theme-switch__spot"></div>
                    <div className="theme-switch__spot"></div>
                  </div>
                </div>
              </div>
            </div>
          </label>
        </div>

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
              setTimeout(() => { state.startGame(); }, 250); // Small delay for the button press animation
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
        <TwilightSky />
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

  // --- NIGHT: MAFIA ---
  if (state.phase === 'night_mafia') {
    const disableCondition = (p) => p.role === 'Mafia';
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden">
        <TwilightSky />
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
        <TwilightSky />
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
          <TwilightSky />
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
        <TwilightSky />
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
        <TwilightSky />
        {renderBackButton()}
        <h2 className="text-purple-400 font-black text-2xl uppercase mt-14 relative z-10 drop-shadow-md">Night Phase</h2>
        <p className="text-slate-300 mt-2 text-sm relative z-10">Moderator: Ask the Sheriff to wake up and point.</p>
        <h3 className="text-3xl font-black mt-8 relative z-10 drop-shadow-md">Who does the Sheriff execute?</h3>
        {renderPlayerList((id) => state.submitNightAction('Sheriff', id), true)}
      </div>
    );
  }

  // --- DAY: RECAP ---
  if (state.phase === 'day_recap' || state.phase === 'day_recap_post_vote') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center justify-center overflow-hidden">
        <MorningSky />
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
        <MorningSky />
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
        <MidnightSky />
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