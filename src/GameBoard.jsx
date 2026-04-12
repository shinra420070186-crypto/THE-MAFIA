import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from './store';
import Galaxy from './Galaxy';
import './spooky.css';

const TRANSITION_MS = 5000;
const tapSafeStyle = { WebkitTapHighlightColor: 'rgba(0,0,0,0)', WebkitTouchCallout: 'none', userSelect: 'none', outline: 'none' };

const AnimatedItem = ({ children, delay = 0, index }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { setInView(entry.isIntersecting); }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);
  return (
    <div ref={ref} data-index={index} style={{ width: '100%', transition: `transform 0.1s ease-out ${delay}s, opacity 0.1s ease-out ${delay}s`, transform: inView ? 'scale(1)' : 'scale(0.8)', opacity: inView ? 1 : 0 }}>
      {children}
    </div>
  );
};

const MemoizedGalaxy = React.memo(() => (
  <Galaxy mouseRepulsion={true} mouseInteraction={true} density={1} glowIntensity={0.3} saturation={0} hueShift={140} twinkleIntensity={0.3} rotationSpeed={0.1} repulsionStrength={2} autoCenterRepulsion={0} starSpeed={0.5} speed={1} />
));

// ─── FULL SCREEN SPOOKY HOUSE BACKGROUND (MEMOIZED FOR ZERO LAG) ───
const FullScreenSpooky = React.memo(({ phase }) => {
  const isNight = phase.startsWith('night') || phase === 'night_transition';
  const [angles, setAngles] = useState({ sun: isNight ? 180 : 0, moon: isNight ? 0 : -180 });
  const prevIsNight = useRef(isNight);
  const [activeZone, setActiveZone] = useState(null);

  useEffect(() => {
    if (isNight !== prevIsNight.current) {
      setAngles(prev => ({ sun: prev.sun + 180, moon: prev.moon + 180 }));
      prevIsNight.current = isNight;
    }
  }, [isNight]);

  const handleTrigger = (zone, e) => {
    if (e) e.stopPropagation();
    setActiveZone(prev => prev === zone ? null : zone);
  };

  const themeClass = isNight ? 'theme-night' : 'theme-day';

  return (
    <div className={`spooky-container ${themeClass}`} onClick={() => setActiveZone(null)}>
      <div className="sky">
        <div className="celestial-pivot moon-pivot" style={{ transform: `rotate(${angles.moon}deg)` }}><div className="moon"></div></div>
        <div className="celestial-pivot sun-pivot" style={{ transform: `rotate(${angles.sun}deg)` }}><div className="sun"></div></div>
        <div className="clouds">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>
      <div className="content">
        <div className="ground-fill"></div>
        <div className="level-0">
          <div className={`door ${activeZone === 'door' ? 'active' : ''}`} onClick={(e) => handleTrigger('door', e)}>
            <div className="nosferatu"></div>
            <div className="logs"><span></span><span></span><span></span></div>
          </div>
          <div className="shining"></div>
        </div>
        <div className="level-1">
          <div className={`window ${activeZone === 'window1' ? 'active' : ''}`} onClick={(e) => handleTrigger('window1', e)}>
            <div className="frankenstein"></div>
          </div>
          <div className="shining"></div>
        </div>
        <div className="level-2">
          <div className={`window ${activeZone === 'window2' ? 'active' : ''}`} onClick={(e) => handleTrigger('window2', e)}>
            <div className="witch"></div>
          </div>
          <div className="shining"></div>
        </div>	
        <div className={`balcony ${activeZone === 'balcony' ? 'active' : ''}`} onClick={(e) => handleTrigger('balcony', e)}></div>
        <div className="bat-cat">
          <div className="body"></div><div className="leg"></div><div className="leg"></div><div className="head"></div><div className="ears"></div><div className="tail"></div>
          <div className="wings">
            <div className="wing"><div className="finger"></div><div className="finger"></div><div className="finger"></div><div className="finger"></div><div className="membrane"></div><div className="membrane"></div><div className="membrane"></div></div>
            <div className="wing"><div className="finger"></div><div className="finger"></div><div className="finger"></div><div className="finger"></div><div className="membrane"></div><div className="membrane"></div><div className="membrane"></div></div>
          </div>
        </div>
        <div className="roof-0">
          <div className={`window ${activeZone === 'roof0' ? 'active' : ''}`} onClick={(e) => handleTrigger('roof0', e)}>
            <div className="phantom"></div><div className="phantom"></div>
          </div>
          <div className="shining"></div>
        </div>
        <div className="roof-1"></div>
        <div className="roof-2">
          <div className={`chimney ${activeZone === 'chimney2' ? 'active' : ''}`} onClick={(e) => handleTrigger('chimney2', e)}></div>
          <div className="smoke"><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
        </div>
        <div className={`flying-bat ${activeZone === 'bat' ? 'active' : ''}`} onClick={(e) => handleTrigger('bat', e)}></div>
        <div className="fence">
          <span></span><span></span>
          <div className="bat"><div className="head"><div className="eyes"></div><div className="mouth"></div></div><div className="wings"></div><div className="legs"><div className="leg"></div><div className="leg"></div></div></div>
          <div className="chimney"></div>
        </div>
        <div className="fence">
          <span></span><span></span>
          <div className={`tomb ${activeZone === 'tomb' ? 'active' : ''}`} onClick={(e) => handleTrigger('tomb', e)}>RIP</div>
          <div className="zombie-hand"></div><div className="stones"></div>
        </div>
        <div className={`skeleton-floating ${activeZone === 'skeleton' ? 'active' : ''}`} onClick={(e) => handleTrigger('skeleton', e)}></div>
        <div className="skeleton">
          <div className="head"><div className="cranium"></div><div className="nose"></div><div className="mouth"></div></div><div className="neck"></div>
          <div className="torso"><div className="pelvis"></div><div className="column"></div><div className="rib"></div><div className="rib"></div><div className="clavicle"></div></div>
          <div className="arms">
            <div className="arm"><div className="bone"></div><div className="bone"></div><div className="hand"><div className="bone"></div><div className="bone"></div><div className="bone"></div><div className="bone"></div><div className="bone"></div><div className="bone"></div></div></div>
            <div className="arm"><div className="bone"></div><div className="bone"></div><div className="hand"><div className="bone"></div><div className="bone"></div><div className="bone"></div><div className="bone"></div><div className="bone"></div><div className="bone"></div></div></div>
          </div>
          <div className="legs">
            <div className="leg"><div className="bone"></div><div className="bone"></div><div className="bone ball"></div><div className="foot"><div className="bone"></div><div className="bone"></div><div className="bone"></div></div></div>
            <div className="leg"><div className="bone"></div><div className="bone"></div><div className="bone ball"></div><div className="foot"><div className="bone"></div><div className="bone"></div><div className="bone"></div></div></div>
          </div>
        </div>
        <div className="electricity">
          <div className="pole"></div><div className="bar"><span></span></div><div className="bar"><span></span></div>
          <div className={`cable ${activeZone === 'cable1' ? 'active' : ''}`} onClick={(e) => handleTrigger('cable1', e)}><span></span><span></span><span></span></div>
          <div className={`cable ${activeZone === 'cable2' ? 'active' : ''}`} onClick={(e) => handleTrigger('cable2', e)}></div>
          <div className="box"><div className="sparks"><span></span><span></span><span></span><span></span><span></span></div></div>
        </div>
        <div className={`pumpkin ${activeZone === 'pumpkin' ? 'active' : ''}`} onClick={(e) => handleTrigger('pumpkin', e)}>
          <span></span><span></span><span></span><span></span><span></span>
          <div className="eyes"></div><div className="nose"></div><div className="mouth"><div className="teeth"></div></div>
        </div>
      </div>
    </div>
  );
});

// ─── IMAGE PRELOADER & CARD COMPONENTS ───────────────
const roleImages = { 'Mafia': '/mafia-card.jpg', 'Doctor': '/doctor-card.jpg', 'Detective': '/detective-card.jpg', 'Sheriff': '/sheriff-card.jpg', 'Civilian': '/civilian-card.jpg' };
const glowColors = { 'Mafia': '#ff003c', 'Doctor': '#00ff75', 'Detective': '#00d2ff', 'Sheriff': '#f2994a', 'Civilian': '#8e44ad' };

const ImagePreloader = () => (
  <div className="hidden">{Object.values(roleImages).map((src, index) => <img key={index} src={src} alt="preload" fetchpriority="high" />)}</div>
);

const RoleCard = ({ isFlipped, role }) => {
  return (
    <div className="my-6 relative w-[240px] h-[360px] [perspective:1000px] select-none touch-none" style={tapSafeStyle}>
      <div className="relative w-full h-full transition-transform duration-[600ms] [transform-style:preserve-3d]" style={{ transform: isFlipped ? 'rotateY(180deg) translateZ(0)' : 'rotateY(0deg) translateZ(0)' }}>
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-[2rem] bg-[#0a0a0a] border border-slate-800 flex flex-col items-center justify-center p-4 shadow-xl">
           <p className="text-slate-500 font-black tracking-widest uppercase text-center text-xl">Secret Role</p>
           <p className="text-[10px] text-slate-600 mt-4 tracking-widest uppercase font-bold animate-pulse">Tap & Hold to Reveal</p>
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden] rounded-[2rem] bg-black" style={{ transform: 'rotateY(180deg)', backgroundImage: `url(${roleImages[role] || roleImages.Civilian})`, backgroundPosition: 'center', backgroundSize: '105%', backgroundRepeat: 'no-repeat', boxShadow: isFlipped ? `0px 0px 50px 10px ${glowColors[role] || glowColors.Civilian}40` : 'none' }}></div>
      </div>
    </div>
  );
};

// ─── MAIN GAMEBOARD COMPONENT ────────────────────────
export default function GameBoard() {
  const state = useGameStore();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardViewed, setCardViewed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [pendingSelection, setPendingSelection] = useState(null);

  const alivePlayers = state.players.filter(p => p.isAlive);
  const availableRecentNames = state.recentNames.filter(n => !state.players.some(p => p.name === n));
  
  const selectedMafiaCount = state.settings?.mafiaCount || 'auto';
  const selectedSheriffMode = state.settings?.sheriffMode || 'auto';
  const requestedMafiaCount = selectedMafiaCount === 'auto' ? (state.players.length >= 8 ? 2 : 1) : Number(selectedMafiaCount) || 1;
  const resolvedMafiaCount = Math.max(1, Math.min(requestedMafiaCount, Math.max(1, state.players.length - 2 || 1)));
  const sheriffWanted = selectedSheriffMode === 'always' || (selectedSheriffMode === 'auto' && state.players.length >= 8);
  const hasSheriff = sheriffWanted && (2 + resolvedMafiaCount < state.players.length);
  const baseRoles = 2 + resolvedMafiaCount + (hasSheriff ? 1 : 0);
  const civilians = Math.max(state.players.length - baseRoles, 0);

  useEffect(() => {
    let timer;
    if (state.phase === 'night_transition') { timer = setTimeout(() => { state.startNightRoles(); }, TRANSITION_MS); } 
    else if (state.phase === 'day_transition') { timer = setTimeout(() => { state.startDayRecap(); }, TRANSITION_MS); }
    return () => clearTimeout(timer);
  }, [state.phase]);

  useEffect(() => { 
    setCardViewed(false); 
    setPendingSelection(null);
  }, [state.phase, state.votingState?.currentVoterIndex]);

  const isGalaxyPhase = state.phase === 'lobby' || state.phase === 'role_reveal';
  const isSpookyPhase = state.phase !== 'splash' && state.phase !== 'lobby' && state.phase !== 'role_reveal';

  const renderBackButton = () => {
    if (state.phase === 'lobby' || state.phase === 'splash') return null;
    return (
      <button 
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => { if (window.confirm("Abort current game and go back to Lobby?")) { state.resetToLobby(); } }}
        className="absolute top-4 left-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 active:scale-90 z-50 p-3 bg-[#0a0a0a]/80 backdrop-blur-md rounded-lg border border-slate-800 shadow-xl pointer-events-auto"
        style={tapSafeStyle}
      ><span>◀</span> LOBBY</button>
    );
  };

  // ─── PLAYER LIST: ACRYLIC (NO-BLUR) 120FPS VERSION ───
  const renderPlayerList = (onSelect, includeSkip = false, hideCondition = () => false) => {
    const visiblePlayers = alivePlayers.filter(p => !hideCondition(p));

    const handleConfirm = () => {
      if (pendingSelection !== null) {
        onSelect(pendingSelection === 'skip' ? null : pendingSelection);
        setPendingSelection(null);
      }
    };

    return (
      <div className="w-full max-w-sm relative z-10 pointer-events-auto mt-2 mb-6" style={tapSafeStyle}>
        {/* Scroll list with NO MASK to prevent GPU crashes */}
        <div className="w-full space-y-4 max-h-[320px] overflow-y-auto px-4 pb-4 pt-4 hide-scrollbar">
          {visiblePlayers.map((p, index) => {
            const isSelected = pendingSelection === p.id;
            return (
              <AnimatedItem key={p.id} index={index} delay={0.05}>
                <button 
                  onPointerDown={(e) => e.stopPropagation()} 
                  onClick={() => setPendingSelection(p.id)} 
                  className={`acrylic-tile ${isSelected ? 'selected' : ''}`}
                  style={tapSafeStyle}
                >
                  {p.name}
                </button>
              </AnimatedItem>
            );
          })}
          {includeSkip && (
            <AnimatedItem index={visiblePlayers.length} delay={0.05}>
              <button 
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={() => setPendingSelection('skip')} 
                className={`acrylic-tile ${pendingSelection === 'skip' ? 'selected' : ''} !mt-2`}
                style={tapSafeStyle}
              >
                Skip / Nobody
              </button>
            </AnimatedItem>
          )}
        </div>

        {/* PURE CONFIRM BUTTON: Absolutely NO extra styling or borders around it */}
        {pendingSelection && (
          <div className="mt-8 flex flex-col mx-4 animate-in fade-in slide-in-from-bottom-4 will-change-transform">
            <button 
              onClick={handleConfirm} 
              className="w-full p-4 bg-white text-black rounded-xl font-black uppercase tracking-widest shadow-[0_8px_30px_rgba(255,255,255,0.3)] active:scale-95 transition-transform duration-100 will-change-transform"
            >
              CONFIRM & NEXT
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        html, body, #root { width: 100vw; height: 100vh; height: 100dvh; overflow: hidden; position: fixed; overscroll-behavior: none; background-color: #050505 !important; user-select: none; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent !important; -webkit-touch-callout: none !important; }
        * { -webkit-tap-highlight-color: transparent !important; outline: none !important; }
        input { user-select: auto; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* THE ACRYLIC HACK: Looks exactly like glass, but uses ZERO blur math */
        .acrylic-tile {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          text-transform: uppercase;
          font-weight: 900;
          color: #e2e8f0;
          
          /* Fake Glass Texture */
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-top-color: rgba(255, 255, 255, 0.3);
          border-left-color: rgba(255, 255, 255, 0.2);
          
          /* Static Shadows - no misalignments */
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.15);
          
          /* Hardware Acceleration & 100ms Speed */
          transform: translateZ(0);
          will-change: transform;
          transition: transform 0.1s ease-out, background 0.1s ease-out, border-color 0.1s ease-out, box-shadow 0.1s ease-out;
        }

        .acrylic-tile.selected {
          transform: scale(1.05) translateY(-2px) translateZ(0) !important;
          
          /* Brighter, thicker fake glass when selected */
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.08) 100%);
          border-color: rgba(255, 255, 255, 0.4);
          border-top-color: rgba(255, 255, 255, 0.6);
          border-left-color: rgba(255, 255, 255, 0.5);
          
          color: #ffffff;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5), inset 0 1px 3px rgba(255, 255, 255, 0.4);
        }

        .acrylic-tile:active {
          transform: scale(0.96) translateZ(0) !important;
          background: rgba(255, 255, 255, 0.15);
        }
        
        .will-change-opacity { will-change: opacity; }
      `}</style>
      
      <div className="fixed inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 ease-in-out will-change-opacity" style={{ backgroundColor: '#e5e5e5', opacity: state.phase === 'splash' ? 1 : 0, zIndex: state.phase === 'splash' ? 0 : -100, visibility: state.phase === 'splash' ? 'visible' : 'hidden' }} />
      <div className="fixed inset-0 w-full h-full pointer-events-auto transition-opacity duration-700 ease-in-out will-change-opacity" style={{ opacity: isGalaxyPhase ? 1 : 0, zIndex: isGalaxyPhase ? 0 : -50, visibility: isGalaxyPhase ? 'visible' : 'hidden' }}>
        <MemoizedGalaxy />
      </div>
      
      <div className="fixed inset-0 w-full h-full transition-opacity duration-700 ease-in-out will-change-opacity" style={{ opacity: isSpookyPhase ? 1 : 0, zIndex: isSpookyPhase ? 0 : -50, visibility: isSpookyPhase ? 'visible' : 'hidden' }}>
        <FullScreenSpooky phase={state.phase} />
      </div>

      {state.phase === 'splash' && (
        <div className="relative h-[100dvh] w-full flex flex-col items-center justify-center p-6 overflow-hidden z-10 transition-opacity duration-1000 pointer-events-none" style={tapSafeStyle}>
          <ImagePreloader />
          <button onPointerDown={(e) => e.stopPropagation()} onClick={() => { setTimeout(() => { state.enterLobby(); }, 800); }} className="splash-batman-btn pointer-events-auto" style={tapSafeStyle}><span>PLAY GAME</span></button>
        </div>
      )}

      {state.phase === 'lobby' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 overflow-hidden pointer-events-none z-10" style={tapSafeStyle}>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setShowSettings((prev) => !prev)} className="absolute top-4 left-4 z-50 w-12 h-12 rounded-xl border border-cyan-300/40 bg-[#02060a]/80 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all hover:border-cyan-200/70 hover:bg-[#07111a]/85 pointer-events-auto" style={tapSafeStyle}>
            <svg className={`w-6 h-6 text-cyan-100 ${showSettings ? 'animate-spin' : ''}`} style={{ animationDuration: '0.8s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.9 1.9 0 0 1-2.7 2.7l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.9 1.9 0 0 1-2.7-2.7l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.9 1.9 0 0 1 2.7 2.7l-.1.1a1 1 0 0 0 1.1.2h0a1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9h0a1 1 0 0 0 1.1-.2l.1-.1a1.9 1.9 0 0 1 2.7 2.7l-.1.1a1 1 0 0 0-.2 1.1v0a1 1 0 0 0 .9.6h.2a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6Z" /></svg>
          </button>
          
          <h1 className="text-5xl md:text-6xl font-black uppercase mb-10 tracking-[0.2em] mt-14 relative z-10 shine-text text-center pointer-events-none">THE MAFIA</h1>

          {showSettings && (
            <div className="w-full max-w-sm mb-8 p-4 rounded-2xl border border-cyan-300/30 bg-[#02060a]/85 backdrop-blur-lg relative z-10 shadow-xl pointer-events-auto">
              <p className="text-cyan-200 text-[11px] font-black uppercase tracking-[0.2em] mb-4">Game Settings</p>
              <div className="mb-4">
                <p className="text-slate-300 text-[10px] uppercase tracking-widest mb-2">Mafia Count</p>
                <div className="grid grid-cols-3 gap-2">
                  {['auto', 1, 2].map((mode) => <button key={String(mode)} onPointerDown={(e) => e.stopPropagation()} onClick={() => state.setMafiaCount(mode)} className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${selectedMafiaCount === mode ? 'bg-rose-400/20 text-rose-200 border-rose-300/60' : 'bg-slate-900/70 text-slate-300 border-slate-700/70 hover:border-slate-500'}`} style={tapSafeStyle}>{mode}</button>)}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-slate-300 text-[10px] uppercase tracking-widest mb-2">Sheriff Role</p>
                <div className="grid grid-cols-3 gap-2">
                  {['auto', 'always', 'off'].map((mode) => <button key={mode} onPointerDown={(e) => e.stopPropagation()} onClick={() => state.setSheriffMode(mode)} className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${selectedSheriffMode === mode ? 'bg-violet-400/20 text-violet-200 border-violet-300/60' : 'bg-slate-900/70 text-slate-300 border-slate-700/70 hover:border-slate-500'}`} style={tapSafeStyle}>{mode}</button>)}
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between bg-[#010201]/50 border border-slate-700/50 p-3 rounded-xl">
                  <span className="font-bold text-[10px] tracking-widest uppercase text-slate-400">Reveal Roles on Death?</span>
                  <button onPointerDown={(e) => e.stopPropagation()} onClick={state.toggleRevealRoles} className={`px-3 py-1 rounded text-[10px] uppercase font-black tracking-widest transition-colors ${state.settings?.revealRoles ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-[#222] text-slate-500 border border-slate-700'}`} style={tapSafeStyle}>{state.settings?.revealRoles ? 'ON' : 'OFF'}</button>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-xl bg-slate-900/70 border border-slate-700/70">
                <p className="text-[10px] text-slate-300 uppercase tracking-widest font-bold mb-2">Current Match Setup</p>
                <div className="text-xs text-slate-200 space-y-1">
                  <p>Mafia: <span className="text-rose-300 font-bold">{resolvedMafiaCount}</span></p>
                  <p>Doctor: <span className="text-emerald-300 font-bold">1</span></p>
                  <p>Detective: <span className="text-sky-300 font-bold">1</span></p>
                  <p>Sheriff: <span className="text-violet-300 font-bold">{hasSheriff ? 1 : 0}</span></p>
                  <p>Civilians: <span className="text-slate-100 font-bold">{civilians}</span></p>
                </div>
              </div>
            </div>
          )}
          
          <div className="w-full mb-10 flex justify-center relative z-10 pointer-events-auto">
            <div className="poda-wrapper">
              <div className="poda-glow"></div><div className="poda-darkBorderBg"></div><div className="poda-darkBorderBg"></div><div className="poda-darkBorderBg"></div><div className="poda-white"></div><div className="poda-border"></div>
              <div className="poda-main">
                <input placeholder="Add Player..." type="text" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && newPlayerName.trim()) { state.addPlayer(newPlayerName.trim()); setNewPlayerName(''); } }} className="poda-input" />
                <div className="poda-input-mask"></div><div className="poda-pink-mask"></div><div className="poda-filterBorder"></div>
                <div className="poda-filter-icon" onPointerDown={(e) => e.stopPropagation()} onClick={() => { if(newPlayerName.trim()) { state.addPlayer(newPlayerName.trim()); setNewPlayerName(''); } }} style={tapSafeStyle}>
                  <svg preserveAspectRatio="none" height="27" width="27" viewBox="4.8 4.56 14.832 15.408" fill="none"><path d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z" stroke="#d6d6e6" strokeWidth="1" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {availableRecentNames.length > 0 && (
            <div className="w-full mb-6 relative z-10 pointer-events-auto" style={tapSafeStyle}>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-3 pl-2 text-center drop-shadow-md">Recent Players</p>
              <div className="flex flex-wrap justify-center gap-2">
                {availableRecentNames.slice(0, 6).map(name => (
                  <button key={name} onPointerDown={(e) => e.stopPropagation()} onClick={() => state.addPlayer(name)} className="px-4 py-2 bg-[#222] text-[#e81cff] border border-[#e81cff]/30 rounded-full text-xs font-bold tracking-wider active:scale-95 transition-all shadow-md" style={tapSafeStyle}>+ {name}</button>
                ))}
              </div>
            </div>
          )}

          <div className="w-full max-w-sm relative z-10 pointer-events-auto mb-10" style={tapSafeStyle}>
            <div className="w-full space-y-2 max-h-[135px] overflow-y-auto px-2 pb-2 pt-2 hide-scrollbar" style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)' }}>
              {state.players.map((p, index) => (
                <AnimatedItem key={p.id} index={index} delay={0.05}>
                  <div className="flex justify-between items-center py-4 px-6 bg-[#010201]/80 backdrop-blur-md border border-[#40c9ff]/30 rounded-2xl shadow-sm transition-all">
                    <span className="font-bold tracking-widest text-white">{p.name}</span>
                    <button onPointerDown={(e) => e.stopPropagation()} onClick={() => state.removePlayer(p.id)} className="text-rose-500 font-bold active:scale-90 flex items-center justify-center w-6 h-6" style={tapSafeStyle}>✕</button>
                  </div>
                </AnimatedItem>
              ))}
            </div>
          </div>

          <div className="w-full flex justify-center relative z-10 mb-6 pointer-events-auto">
            <button disabled={state.players.length < 4} onPointerDown={(e) => e.stopPropagation()} onClick={() => { setTimeout(() => { state.startGame(); }, 250); }} className="stealth-btn" style={tapSafeStyle}>
              <strong className="stealth-strong">BEGIN GAME ({state.players.length})</strong>
              <div className="stealth-container-stars"><div className="stealth-stars"></div></div>
              <div className="stealth-glow"><div className="stealth-circle"></div><div className="stealth-circle"></div></div>
            </button>
          </div>
        </div>
      )}

      {state.phase === 'role_reveal' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px] mb-2 relative z-10 pointer-events-none">Pass phone to</p>
          <h2 className="text-4xl font-black text-white uppercase mb-8 drop-shadow-md relative z-10 pointer-events-none">{state.players[state.revealIndex]?.name}</h2>
          
          <div onPointerDown={(e) => e.stopPropagation()} onMouseDown={() => setIsFlipped(true)} onMouseUp={() => { setIsFlipped(false); setCardViewed(true); }} onMouseLeave={() => setIsFlipped(false)} onTouchStart={() => setIsFlipped(true)} onTouchEnd={() => { setIsFlipped(false); setCardViewed(true); }} className="cursor-pointer relative z-10 pointer-events-auto" style={tapSafeStyle}>
            <RoleCard isFlipped={isFlipped} role={state.players[state.revealIndex]?.role} />
          </div>

          <div className="relative w-full max-w-sm flex justify-center mt-12 z-10 pointer-events-none h-[80px]">
            <p className={`absolute top-0 text-slate-400 font-bold text-sm transition-opacity duration-500 pointer-events-none ${cardViewed ? 'opacity-0' : 'opacity-100 animate-pulse'}`}>👆 Tap the card to view your role</p>
            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => { setIsFlipped(false); setCardViewed(false); state.nextRoleReveal(); }} disabled={!cardViewed} className={`absolute top-0 p-5 w-full rounded-xl font-black uppercase tracking-widest transition-all duration-500 pointer-events-auto ${!cardViewed ? 'opacity-0 translate-y-4 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100 bg-[#0a0a0a]/90 backdrop-blur-md text-white border border-slate-800 hover:border-slate-500 active:scale-95'}`} style={tapSafeStyle}>
              {state.revealIndex === state.players.length - 1 ? 'Give to Moderator' : 'Next Player'}
            </button>
          </div>
        </div>
      )}

      {state.phase === 'night_transition' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-96 h-96 bg-black/30 rounded-full blur-3xl animate-pulse"></div></div>
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] relative z-20 animate-in fade-in duration-1000">EVERYONE</h2>
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] relative z-20 mt-4 animate-in fade-in duration-1000 delay-500">CLOSE YOUR EYES</h2>
            <p className="text-slate-300 mt-8 text-lg tracking-widest font-bold relative z-20 animate-pulse">Get ready for the night...</p>
          </div>
        </div>
      )}

      {state.phase === 'night_mafia' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <h2 className="text-3xl md:text-4xl font-black text-red-500 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(220,38,38,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
          <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">🌙 Moderator: Ask the Mafia to wake up and point.</p>
          <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)] tracking-[0.1em] pointer-events-none">Who does the Mafia kill?</h3>
          {renderPlayerList((id) => state.submitNightAction('Mafia', id), true, (p) => p.role === 'Mafia')}
        </div>
      )}

      {state.phase === 'night_doctor' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <h2 className="text-3xl md:text-4xl font-black text-green-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
          <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">🌙 Moderator: Ask the Doctor to wake up and point.</p>
          <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] tracking-[0.1em] pointer-events-none">Who does the Doctor save?</h3>
          {renderPlayerList((id) => state.submitNightAction('Doctor', id), true, (p) => p.id === state.doctorLastSaved || (p.role === 'Doctor' && state.doctorHasSelfSaved))}
        </div>
      )}

      {state.phase === 'night_detective' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          {state.investigationResult ? (
            <>
              <h2 className="text-3xl md:text-4xl font-black text-blue-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(96,165,250,0.6)] tracking-[0.15em] pointer-events-none">Investigation</h2>
              <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">{state.investigationResult === 'DEAD_ROLE' ? "🔍 Moderator: Pretend to give an answer!" : "🔍 Moderator: Nod or shake your head."}</p>
              <h3 className={`text-5xl md:text-6xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)] tracking-[0.1em] pointer-events-none ${state.investigationResult === 'DEAD_ROLE' ? 'text-slate-500 drop-shadow-[0_0_20px_rgba(107,114,128,0.5)]' : state.investigationResult === 'MAFIA' ? 'text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.7)]' : 'text-green-400 drop-shadow-[0_0_30px_rgba(34,197,94,0.7)]'}`}>
                {state.investigationResult === 'DEAD_ROLE' ? 'ROLE DEAD' : state.investigationResult}
              </h3>
              <div className="relative w-full max-w-sm flex justify-center mt-12 z-10 pointer-events-none">
                <button onPointerDown={(e) => e.stopPropagation()} onClick={state.advanceFromDetective} className="p-5 w-full rounded-xl font-black tracking-widest uppercase active:scale-95 bg-[#0a0a0a]/90 backdrop-blur-md border border-slate-700 hover:border-slate-500 transition-colors shadow-lg pointer-events-auto" style={tapSafeStyle}>Continue →</button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-black text-blue-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(96,165,250,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
              <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">🔍 Moderator: Ask the Detective to wake up and point.</p>
              <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)] tracking-[0.1em] pointer-events-none">Who is investigated?</h3>
              {renderPlayerList((id) => state.submitNightAction('Detective', id), false, (p) => p.role === 'Detective')}
            </>
          )}
        </div>
      )}

      {state.phase === 'night_sheriff' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <h2 className="text-3xl md:text-4xl font-black text-purple-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
          <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">⚔️ Moderator: Ask the Sheriff to wake up and point.</p>
          <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] tracking-[0.1em] pointer-events-none">Who does the Sheriff execute?</h3>
          {renderPlayerList((id) => state.submitNightAction('Sheriff', id), true, (p) => p.role === 'Sheriff')}
        </div>
      )}

      {/* ─── DAY PHASES ─── */}
      {state.phase === 'day_transition' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse"></div></div>
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_40px_rgba(255,210,0,0.8)] relative z-20 animate-in fade-in duration-1000">EVERYONE</h2>
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_40px_rgba(255,210,0,0.8)] relative z-20 mt-4 animate-in fade-in duration-1000 delay-500">OPEN YOUR EYES</h2>
            <p className="text-yellow-100 mt-8 text-lg tracking-widest font-bold relative z-20 animate-pulse">The sun is rising...</p>
          </div>
        </div>
      )}

      {(state.phase === 'day_recap' || state.phase === 'day_recap_post_vote') && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 text-center justify-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <h2 className="text-4xl md:text-5xl font-black uppercase mb-12 text-white tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] mt-14 relative z-10 animate-in fade-in duration-1000 pointer-events-none">The Town Awakens</h2>
          <div className="w-full max-w-2xl space-y-4 relative z-10 pointer-events-none">
            {state.dayRecap.map((msg, i) => (
              <div key={i} className="p-6 bg-slate-900/50 backdrop-blur-md rounded-xl text-lg font-bold border-l-4 border-amber-400 shadow-xl animate-in fade-in duration-1000 transition-colors pointer-events-auto hover:bg-slate-900/70" style={{ animationDelay: `${i * 200}ms` }}><span className="text-amber-300">▸ </span>{msg}</div>
            ))}
          </div>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={state.phase === 'day_recap' ? state.startVoting : state.advanceToNight} className="mt-12 p-5 w-full max-w-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 rounded-xl font-black tracking-widest uppercase active:scale-95 transition-transform shadow-xl relative z-10 hover:shadow-[0_0_30px_rgba(255,193,7,0.5)] pointer-events-auto" style={tapSafeStyle}>{state.phase === 'day_recap' ? '→ Begin Voting' : '→ Go To Sleep (Next Night)'}</button>
        </div>
      )}

      {state.phase === 'day_voting' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <h2 className="text-slate-300 font-bold uppercase tracking-widest text-[12px] mt-14 mb-3 relative z-10 drop-shadow-md pointer-events-none">⚖️ Town Voting Phase</h2>
          <h3 className="text-5xl md:text-6xl font-black text-amber-300 my-4 uppercase relative z-10 drop-shadow-[0_0_20px_rgba(255,193,7,0.5)] pointer-events-none">{alivePlayers[state.votingState.currentVoterIndex]?.name}</h3>
          <p className="text-lg font-bold text-red-400 tracking-widest uppercase relative z-10 drop-shadow-md pointer-events-none">Who do you exile?</p>
          
          <div className="w-full max-w-sm relative z-10 pointer-events-auto mt-6 mb-6" style={tapSafeStyle}>
            {renderPlayerList((id) => state.submitVote(id), true, (p) => p.id === alivePlayers[state.votingState.currentVoterIndex]?.id)}
          </div>
          <p className="mt-10 text-slate-400 font-bold text-[11px] uppercase tracking-wider relative z-10 bg-slate-900/40 px-4 py-2 rounded-full backdrop-blur-md border border-slate-700/50 pointer-events-none">Vote {state.votingState.currentVoterIndex + 1} of {alivePlayers.length}</p>
        </div>
      )}

      {/* ─── GAME OVER PHASE ─── */}
      {state.phase === 'gameover' && (
        <div className="relative h-[100dvh] w-full text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden z-10 pointer-events-none" style={tapSafeStyle}>
          {renderBackButton()}
          <div className="relative z-10 flex flex-col items-center pointer-events-none">
            <h1 className={`text-6xl md:text-7xl font-black uppercase mb-2 mt-14 ${state.winner === 'Mafia' ? 'text-red-600 drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]' : 'text-blue-400 drop-shadow-[0_0_40px_rgba(96,165,250,0.8)]'}`}>{state.winner} WIN!</h1>
            <p className={`text-sm tracking-[0.2em] font-bold ${state.winner === 'Mafia' ? 'text-red-400' : 'text-blue-300'}`}>{state.winner === 'Mafia' ? '🔴 THE MAFIA HAS TAKEN OVER THE TOWN' : '✓ THE TOWN HAS ELIMINATED THE THREAT'}</p>
          </div>
          
          <div className="w-full max-w-2xl mt-12 text-left bg-gradient-to-b from-slate-900/60 to-slate-950/60 backdrop-blur-md p-8 rounded-2xl border border-slate-700/50 relative z-10 shadow-2xl pointer-events-auto">
            <p className="text-slate-300 uppercase text-[11px] tracking-[0.15em] font-bold mb-6 text-center">Final Standings</p>
            <div className="space-y-3">
              {state.players.map((p, idx) => (
                <div key={p.id} className={`flex justify-between items-center py-3 px-4 rounded-lg border transition-all ${p.isAlive ? 'bg-slate-800/50 border-slate-600/50' : 'bg-slate-900/50 border-slate-700/50'}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-bold">{idx + 1}.</span>
                    <span className={`font-bold tracking-wide ${p.isAlive ? 'text-white' : 'text-slate-600 line-through'}`}>{p.name}</span>
                  </div>
                  <span className={`font-black text-xs px-3 py-1 rounded-full tracking-wider ${p.role === 'Mafia' ? 'bg-red-900/40 text-red-400' : p.role === 'Doctor' ? 'bg-green-900/40 text-green-400' : p.role === 'Detective' ? 'bg-blue-900/40 text-blue-400' : p.role === 'Sheriff' ? 'bg-purple-900/40 text-purple-400' : 'bg-slate-800/40 text-slate-400'}`}>{p.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex justify-center mt-14 mb-6 relative z-10 pointer-events-auto">
            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => { setTimeout(() => { state.playAgain(); }, 1500); }} className="splash-batman-btn" style={tapSafeStyle}>
              <span>PLAY AGAIN</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}