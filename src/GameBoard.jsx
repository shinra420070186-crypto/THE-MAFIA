import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from './store';
import Galaxy from './Galaxy';

// ─── CONSTANTS ───────────────────────────────────────
const TRANSITION_MS = 5000;
const TAU = Math.PI * 2;

// ─── FULL SCREEN SPOOKY HOUSE BACKGROUND ─────────────
const FullScreenSpooky = ({ phase }) => {
  const isNight = phase.startsWith('night') || phase === 'night_transition';
  
  // Track continuous orbit to ensure Left-To-Right continuous sweeping
  const [angles, setAngles] = useState({ sun: isNight ? 180 : 0, moon: isNight ? 0 : -180 });
  const prevIsNight = useRef(isNight);

  useEffect(() => {
    if (isNight !== prevIsNight.current) {
      setAngles(prev => ({
        sun: prev.sun + 180,
        moon: prev.moon + 180
      }));
      prevIsNight.current = isNight;
    }
  }, [isNight]);

  const themeClass = isNight ? 'theme-night' : 'theme-day';

  return (
    <div className={`full-spooky-bg ${themeClass}`} style={{
      '--sun-angle': angles.sun,
      '--moon-angle': angles.moon
    }}>
      <style>{`
        .full-spooky-bg {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
          transition: background-color 5s ease-in-out;
          background-color: var(--sky-color);
          overflow: hidden;
          
          /* Responsive Arc & Scale Settings */
          --celestial-scale: 1;
          --arc-radius: 85vh;
        }

        @media (max-width: 768px) {
          .full-spooky-bg {
            --celestial-scale: 0.6;
            --arc-radius: 75vh;
          }
        }

        /* ─── DAY/NIGHT PURE SILHOUETTE TOGGLES ─── */
        .full-spooky-bg.theme-night {
          --sky-color: #212f3c;
          --window-color: #ffd166; /* Glowing windows */
          --rain-opacity: 1;
        }

        .full-spooky-bg.theme-day {
          --sky-color: #5b92e5; /* Blue sky */
          --window-color: #111;    /* Dark unlit windows */
          --rain-opacity: 0;
        }

        /* ─── CINEMATIC ORBIT PIVOT SYSTEM ─── */
        .celestial-pivot {
          position: absolute;
          top: 100vh; /* Invisible pivot point at the exact bottom center */
          left: 50%;
          width: 0;
          height: 0;
          z-index: 1;
        }

        .sun-pivot {
          transition: transform 5s ease-in-out;
          transform: rotate(calc(var(--sun-angle) * 1deg));
        }

        .moon-pivot {
          transition: transform 5s ease-in-out;
          transform: rotate(calc(var(--moon-angle) * 1deg));
        }

        .celestial-body {
          position: absolute;
          left: -100px; /* Center perfectly on pivot (half of 200px) */
          top: calc(-1 * var(--arc-radius)); /* Pushes the body up to the sky */
          width: 200px;
          height: 200px;
          border-radius: 50%;
        }

        /* Moon Design */
        .moon {
          background-color: #95a5a6;
          box-shadow: inset 7px -7px 0 rgba(0, 0, 0, 0.09);
          transition: transform 5s ease-in-out;
          /* Counter-rotate so the craters always stay upright */
          transform: scale(var(--celestial-scale)) rotate(calc(var(--moon-angle) * -1deg));
        }
        .moon:before, .moon:after {
          content: "";
          position: absolute;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.09);
          box-shadow: inset -5px 5px 0 rgba(0, 0, 0, 0.09);
        }
        .moon:before { width: 30px; height: 30px; top: 50px; left: 45px; }
        .moon:after { width: 40px; height: 40px; top: 100px; left: 30px; }

        /* Sun Design */
        .sun {
          background-color: #FFD700;
          box-shadow: inset 7px -7px 0 rgba(200, 100, 0, 0.2), 0 0 50px rgba(255, 215, 0, 0.6);
          transition: transform 5s ease-in-out;
          /* Counter-rotate so the spots always stay upright */
          transform: scale(var(--celestial-scale)) rotate(calc(var(--sun-angle) * -1deg));
        }
        .sun:before, .sun:after {
          content: "";
          position: absolute;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.25);
          box-shadow: inset -5px 5px 0 rgba(255, 255, 255, 0.1);
        }
        .sun:before { width: 30px; height: 30px; top: 50px; left: 45px; }
        .sun:after { width: 40px; height: 40px; top: 100px; left: 30px; }

        /* ─── FULL SCREEN GROUND & HOUSE (PURE BLACK SILHOUETTE) ─── */
        .ground {
          position: absolute;
          bottom: 0;
          left: -10vw;
          width: 120vw;
          height: 25vh;
          background-color: #000;
          z-index: 9;
          border-radius: 50% 50% 0 0 / 30px 30px 0 0;
        }

        .house-wrapper {
          position: absolute;
          bottom: 22vh;
          left: 50%;
          transform: translateX(-50%) scale(1.6);
          z-index: 10;
        }
        @media (max-width: 768px) {
          .house-wrapper { transform: translateX(-50%) scale(1.2); bottom: 23vh; }
        }

        /* House Architecture - Strict Silhouette */
        .house {
          position: relative; width: 120px; height: 150px;
          background-color: black; transform: rotate(5deg);
        }
        .house:before {
          content: ""; position: absolute; width: 0; height: 0;
          border-bottom: 30px solid black; border-right: 50px solid transparent;
          left: 115px; top: 70px; transform: rotate(5deg);
        }
        .house:after {
          content: ""; position: absolute; width: 5px; height: 65px;
          background-color: black; left: 145px; top: 95px;
        }

        .porch {
          position: absolute; width: 30px; height: 100px;
          background-color: black; left: -20px; top: 55px; transform: rotate(-10deg);
        }
        .porch:before {
          content: ""; position: absolute; width: 0; height: 0;
          border-bottom: 20px solid black; border-left: 40px solid transparent;
          left: -35px; top: 45px;
        }
        .porch:after {
          content: ""; position: absolute; width: 0; height: 0;
          border-left: 20px solid transparent; border-right: 20px solid transparent; border-bottom: 30px solid black;
          left: -5px; top: -25px;
        }

        .first-floor {
          position: absolute; transform: rotate(-10deg);
          background-color: black; width: 5px; height: 45px; left: -37px; top: 125px;
        }
        .first-floor:before {
          content: ""; position: absolute; background-color: #000;
          width: 85px; height: 90px; top: -150px; left: 50px;
        }
        .first-floor:after {
          content: ""; position: absolute;
          border-left: 52px solid transparent; border-right: 52px solid transparent; border-bottom: 50px solid black;
          top: -199px; left: 40px;
        }

        .second-floor {
          position: absolute; background-color: black; width: 35px; height: 100px;
          transform: rotate(3deg); top: -70px; left: 70px;
        }
        .second-floor:before {
          content: ""; position: absolute; background-color: black;
          width: 20px; height: 100px; left: 33px; top: 40px; transform: rotate(-3deg);
        }
        .second-floor:after {
          content: ""; position: absolute; width: 0; height: 0;
          border-left: 25px solid transparent; border-right: 25px solid transparent; border-bottom: 30px solid black;
          top: 12px; left: 15px;
        }

        .roof {
          position: absolute; width: 0; height: 0;
          border-left: 25px solid transparent; border-right: 25px solid transparent; border-bottom: 30px solid black;
          left: 65px; top: -95px;
        }
        .roof:before {
          content: ""; position: absolute; width: 6px; height: 20px;
          background-color: black; top: 5px; left: 10px; box-shadow: 20px 35px black;
        }
        .roof:after {
          content: ""; position: absolute; width: 6px; height: 20px;
          background-color: black; transform: rotate(-10deg); left: -110px; top: 35px; box-shadow: -27px 97px black;
        }

        .door {
          position: absolute; background-color: var(--window-color);
          transition: background-color 5s ease-in-out;
          width: 30px; height: 50px; transform: rotate(-5deg); border-radius: 30px 30px 0 0;
          box-shadow: inset -10px 5px rgba(0, 0, 0, 0.5); top: 90px; left: 40px;
        }
        .door:before {
          content: ""; position: absolute; background-color: var(--window-color);
          transition: background-color 5s ease-in-out;
          border-radius: 30px 30px 0 0; box-shadow: inset -5px 2px rgba(0, 0, 0, 0.5);
          width: 20px; height: 30px; left: -40px; transform: rotate(-3deg);
        }
        .door:after {
          content: ""; position: absolute; background-color: var(--window-color);
          transition: background-color 5s ease-in-out;
          box-shadow: inset -5px 2px rgba(0, 0, 0, 0.5); border-radius: 30px 30px 0 0;
          width: 20px; height: 30px; left: 45px; transform: rotate(3deg);
        }

        .small-windows {
          position: absolute; background-color: var(--window-color);
          transition: background-color 5s ease-in-out, box-shadow 5s ease-in-out;
          border-radius: 30px 30px 0 0; width: 13px; height: 25px; left: 100px; top: -20px;
          box-shadow: -19px -40px var(--window-color), inset -4px 2px rgba(0, 0, 0, 0.5);
        }
        .small-windows:before {
          content: ""; position: absolute; background-color: var(--window-color);
          transition: background-color 5s ease-in-out, box-shadow 5s ease-in-out;
          border-radius: 30px 30px 0 0; width: 13px; height: 25px; transform: rotate(-7deg);
          left: -60px; top: 50px; box-shadow: -60px 20px var(--window-color);
        }

        .big-window {
          position: absolute; background-color: var(--window-color);
          transition: background-color 5s ease-in-out;
          border-radius: 30px 30px 0 0; transform: rotate(-7deg); width: 30px; height: 40px; top: -35px; left: 10px;
        }
        .big-window:before, .big-window:after {
          content: ""; position: absolute; background-color: black;
        }
        .big-window:before { height: 40px; width: 2px; left: 15px; box-shadow: 13px 55px black, -47px 80px black, -32px 120px black; }
        .big-window:after { height: 2px; width: 40px; top: 22px; box-shadow: 10px 58px black, -45px 78px black, -30px 120px black; }

        .frames {
          position: absolute; width: 2px; height: 40px; background-color: black;
          top: -65px; left: 86.5px; box-shadow: 19px 40px black, 7px 150px black;
        }
        .frames:before {
          content: ""; position: absolute; height: 2px; width: 30px; background-color: black;
          top: 17px; left: -10px; box-shadow: 10px 40px black, 5px 150px black;
        }

        /* ─── FULL SCREEN RAIN SYSTEM ─── */
        .rain-container {
          position: absolute;
          inset: 0;
          z-index: 5;
          opacity: var(--rain-opacity);
          transition: opacity 5s ease-in-out;
          overflow: hidden;
        }

        .dropOne, .dropTwo, .dropThree, .dropFour, .dropFive, 
        .dropSix, .dropSeven, .dropEight, .dropNine, .dropTen {
          position: absolute; background-color: rgba(211, 211, 211, 0.3); height: 10px; width: 1px; top: 0;
          box-shadow: 0 -270px rgba(211, 211, 211, 0.3), -50px -50px rgba(211, 211, 211, 0.3), -50px -150px rgba(211, 211, 211, 0.3), 50px -395px rgba(211, 211, 211, 0.3), 50px -200px rgba(211, 211, 211, 0.3), 50px -100px rgba(211, 211, 211, 0.3), 100px -400px rgba(211, 211, 211, 0.3), 100px -320px rgba(211, 211, 211, 0.3), 100px -150px rgba(211, 211, 211, 0.3), 150px -200px rgba(211, 211, 211, 0.3), 200px -100px rgba(211, 211, 211, 0.3), 200px -370px rgba(211, 211, 211, 0.3), 250px -330px rgba(211, 211, 211, 0.3), 250px -220px rgba(211, 211, 211, 0.3), 300px -70px rgba(211, 211, 211, 0.3), 300px -140px rgba(211, 211, 211, 0.3), 300px -300px rgba(211, 211, 211, 0.3);
        }
        .dropOne { left: 10%; animation: rainAnim 1.5s linear infinite; }
        .dropTwo { left: 20%; animation: rainAnim 1.2s linear infinite; }
        .dropThree { left: 30%; animation: rainAnim 1.7s linear infinite; }
        .dropFour { left: 40%; animation: rainAnim 1.4s linear infinite; }
        .dropFive { left: 50%; animation: rainAnim 1.3s linear infinite; }
        .dropSix { left: 60%; animation: rainAnim 1.6s linear infinite; }
        .dropSeven { left: 70%; animation: rainAnim 1.1s linear infinite; }
        .dropEight { left: 80%; animation: rainAnim 1.8s linear infinite; }
        .dropNine { left: 90%; animation: rainAnim 1.4s linear infinite; }
        .dropTen { left: 95%; animation: rainAnim 1.5s linear infinite; }

        @keyframes rainAnim { 0% { transform: translateY(-200px); } 100% { transform: translateY(120vh); } }
      `}</style>
      
      {/* Sun on its orbital pivot */}
      <div className="celestial-pivot sun-pivot">
        <div className="celestial-body sun"></div>
      </div>

      {/* Moon on its orbital pivot */}
      <div className="celestial-pivot moon-pivot">
        <div className="celestial-body moon"></div>
      </div>

      <div className="house-wrapper">
        <div className="house">
          <div className="porch"></div>
          <div className="first-floor"></div>
          <div className="second-floor"></div>
          <div className="roof"></div>
          <div className="door"></div>
          <div className="small-windows"></div>
          <div className="big-window"></div>
          <div className="frames"></div>
        </div>
      </div>

      <div className="ground"></div>

      <div className="rain-container">
        <div className="dropOne"></div>
        <div className="dropTwo"></div>
        <div className="dropThree"></div>
        <div className="dropFour"></div>
        <div className="dropFive"></div>
        <div className="dropSix"></div>
        <div className="dropSeven"></div>
        <div className="dropEight"></div>
        <div className="dropNine"></div>
        <div className="dropTen"></div>
      </div>
    </div>
  );
};

// ─── IMAGE PRELOADER & CARD COMPONENTS ───────────────
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

// ─── MAIN GAMEBOARD COMPONENT ────────────────────────
export default function GameBoard() {
  const state = useGameStore();
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardViewed, setCardViewed] = useState(false);
  const [voteSelected, setVoteSelected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const alivePlayers = state.players.filter(p => p.isAlive);
  const availableRecentNames = state.recentNames.filter(n => !state.players.some(p => p.name === n));
  
  const selectedMafiaCount = state.settings?.mafiaCount || 'auto';
  const selectedSheriffMode = state.settings?.sheriffMode || 'auto';

  const requestedMafiaCount = selectedMafiaCount === 'auto'
    ? (state.players.length >= 8 ? 2 : 1)
    : Number(selectedMafiaCount) || 1;
  const resolvedMafiaCount = Math.max(1, Math.min(requestedMafiaCount, Math.max(1, state.players.length - 2 || 1)));
  const sheriffWanted = selectedSheriffMode === 'always'
    || (selectedSheriffMode === 'auto' && state.players.length >= 8);
  const hasSheriff = sheriffWanted && (2 + resolvedMafiaCount < state.players.length);
  const baseRoles = 2 + resolvedMafiaCount + (hasSheriff ? 1 : 0);
  const civilians = Math.max(state.players.length - baseRoles, 0);

  useEffect(() => {
    let timer;
    if (state.phase === 'night_transition') {
      timer = setTimeout(() => {
        state.startNightRoles();
      }, TRANSITION_MS);
    } else if (state.phase === 'day_transition') {
      timer = setTimeout(() => {
        state.startDayRecap();
      }, TRANSITION_MS);
    }
    return () => clearTimeout(timer);
  }, [state.phase]);

  useEffect(() => {
    setCardViewed(false);
    setVoteSelected(false);
  }, [state.phase]);

  const renderBackground = () => {
    if (state.phase === 'splash') return null; 
    
    // Lobby & Role Reveal uses Galaxy
    if (state.phase === 'lobby' || state.phase === 'role_reveal') {
      return (
        <div className="fixed inset-0 w-full h-full z-0 pointer-events-auto">
          <Galaxy 
            mouseRepulsion={true}
            mouseInteraction={true}
            density={1}
            glowIntensity={0.3}
            saturation={0}
            hueShift={140}
            twinkleIntensity={0.3}
            rotationSpeed={0.1}
            repulsionStrength={2}
            autoCenterRepulsion={0}
            starSpeed={0.5}
            speed={1}
          />
        </div>
      );
    }
    
    // Day and Night uses the updated Full Screen House Engine
    return <FullScreenSpooky phase={state.phase} />;
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
        className="absolute top-4 left-4 text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 active:scale-90 z-50 p-3 bg-[#0a0a0a]/80 backdrop-blur-md rounded-lg border border-slate-800 shadow-xl pointer-events-auto"
      >
        <span>◀</span> LOBBY
      </button>
    );
  };

  const renderPlayerList = (onSelect, includeSkip = false, disableCondition = () => false) => (
    <div className="w-full max-w-sm space-y-2 mt-6 max-h-[50vh] overflow-y-auto pr-2 relative z-10 pointer-events-auto">
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
            className="splash-batman-btn"
          >
            <span>PLAY GAME</span>
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === 'lobby') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 overflow-hidden pointer-events-none">
        {renderBackground()}

        <button
          onClick={() => setShowSettings((prev) => !prev)}
          aria-label="Toggle settings"
          className="absolute top-4 left-4 z-50 w-12 h-12 rounded-xl border border-cyan-300/40 bg-[#02060a]/80 backdrop-blur-md flex items-center justify-center active:scale-95 transition-all hover:border-cyan-200/70 hover:bg-[#07111a]/85 pointer-events-auto"
        >
          <svg
            className={`w-6 h-6 text-cyan-100 ${showSettings ? 'animate-spin' : ''}`}
            style={{ animationDuration: '0.8s' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3.2" />
            <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1.9 1.9 0 0 1-2.7 2.7l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1.9 1.9 0 0 1-2.7-2.7l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1.9 1.9 0 0 1 2.7 2.7l-.1.1a1 1 0 0 0-.2 1.1v0a1 1 0 0 0 .9.6h.2a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6Z" />
          </svg>
        </button>
        
        <h1 className="text-5xl md:text-6xl font-black uppercase mb-10 tracking-[0.2em] mt-14 relative z-10 shine-text text-center pointer-events-none">
          THE MAFIA
        </h1>

        {showSettings && (
          <div className="w-full max-w-sm mb-8 p-4 rounded-2xl border border-cyan-300/30 bg-[#02060a]/85 backdrop-blur-lg relative z-10 shadow-xl pointer-events-auto">
            <p className="text-cyan-200 text-[11px] font-black uppercase tracking-[0.2em] mb-4">Game Settings</p>

            <div className="mb-4">
              <p className="text-slate-300 text-[10px] uppercase tracking-widest mb-2">Mafia Count</p>
              <div className="grid grid-cols-3 gap-2">
                {['auto', 1, 2].map((mode) => (
                  <button
                    key={String(mode)}
                    onClick={() => state.setMafiaCount(mode)}
                    className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${selectedMafiaCount === mode ? 'bg-rose-400/20 text-rose-200 border-rose-300/60' : 'bg-slate-900/70 text-slate-300 border-slate-700/70 hover:border-slate-500'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-1">
              <p className="text-slate-300 text-[10px] uppercase tracking-widest mb-2">Sheriff Role</p>
              <div className="grid grid-cols-3 gap-2">
                {['auto', 'always', 'off'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => state.setSheriffMode(mode)}
                    className={`px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${selectedSheriffMode === mode ? 'bg-violet-400/20 text-violet-200 border-violet-300/60' : 'bg-slate-900/70 text-slate-300 border-slate-700/70 hover:border-slate-500'}`}
                  >
                    {mode}
                  </button>
                ))}
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

        {availableRecentNames.length > 0 && (
          <div className="w-full mb-6 relative z-10 pointer-events-auto">
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

        <div className="w-full space-y-2 mb-10 max-h-[300px] overflow-y-auto px-2 relative z-10 pointer-events-auto">
          {state.players.map((p) => (
            <div key={p.id} className="flex justify-between items-center py-4 px-6 bg-[#010201]/80 backdrop-blur-md border border-[#40c9ff]/30 rounded-2xl shadow-sm transition-all">
              <span className="font-bold tracking-widest text-white">{p.name}</span>
              <button onClick={() => state.removePlayer(p.id)} className="text-rose-500 font-bold active:scale-90 flex items-center justify-center w-6 h-6">✕</button>
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm flex items-center justify-between bg-[#010201]/80 backdrop-blur-md border border-[#40c9ff]/30 p-4 rounded-xl mb-10 relative z-10 pointer-events-auto">
          <span className="font-bold text-[10px] tracking-widest uppercase text-slate-400">Reveal Roles on Death?</span>
          <button 
            onClick={state.toggleRevealRoles} 
            className={`px-4 py-2 rounded text-[10px] uppercase font-black tracking-widest transition-colors ${state.settings?.revealRoles ? 'bg-green-500/20 text-green-500 border border-green-500/50' : 'bg-[#222] text-slate-500 border border-slate-700'}`}
          >
            {state.settings?.revealRoles ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="w-full flex justify-center relative z-10 mb-6 pointer-events-auto">
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

  if (state.phase === 'role_reveal') {
    const currentPlayer = state.players[state.revealIndex];
    const isLastPlayer = state.revealIndex === state.players.length - 1;

    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px] mb-2 relative z-10 pointer-events-none">Pass phone to</p>
        <h2 className="text-4xl font-black text-white uppercase mb-8 drop-shadow-md relative z-10 pointer-events-none">{currentPlayer.name}</h2>
        
        <div 
          onMouseDown={() => setIsFlipped(true)}
          onMouseUp={() => { setIsFlipped(false); setCardViewed(true); }}
          onMouseLeave={() => setIsFlipped(false)}
          onTouchStart={() => setIsFlipped(true)}
          onTouchEnd={() => { setIsFlipped(false); setCardViewed(true); }}
          className="cursor-pointer relative z-10 pointer-events-auto"
        >
          <RoleCard isFlipped={isFlipped} role={currentPlayer.role} />
        </div>

        {!cardViewed && (
          <p className="mt-12 text-slate-400 font-bold text-sm relative z-10 animate-pulse pointer-events-none">👆 Tap the card to view your role</p>
        )}

        <button 
          onClick={() => { setIsFlipped(false); setCardViewed(false); state.nextRoleReveal(); }}
          disabled={!cardViewed} 
          className={`mt-12 p-5 w-full max-w-sm rounded-xl font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${!cardViewed ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0 bg-[#0a0a0a]/90 backdrop-blur-md text-white border border-slate-800 active:scale-95 pointer-events-auto'}`}
        >
          {isLastPlayer ? 'Give to Moderator' : 'Next Player'}
        </button>
      </div>
    );
  }

  if (state.phase === 'night_transition') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-black/30 rounded-full blur-3xl animate-pulse"></div>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] relative z-20 animate-in fade-in duration-1000">
            EVERYONE
          </h2>
          <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-[0.3em] drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] relative z-20 mt-4 animate-in fade-in duration-1000 delay-500">
            CLOSE YOUR EYES
          </h2>
          <p className="text-slate-300 mt-8 text-lg tracking-widest font-bold relative z-20 animate-pulse">Get ready for the night...</p>
        </div>
      </div>
    );
  }

  if (state.phase === 'night_mafia') {
    const disableCondition = (p) => p.role === 'Mafia';
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-3xl md:text-4xl font-black text-red-500 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(220,38,38,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
        <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">🌙 Moderator: Ask the Mafia to wake up and point.</p>
        <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(220,38,38,0.4)] tracking-[0.1em] pointer-events-none">Who does the Mafia kill?</h3>
        {renderPlayerList((id) => state.submitNightAction('Mafia', id), true, disableCondition)}
      </div>
    );
  }

  if (state.phase === 'night_doctor') {
    const disableCondition = (p) => p.id === state.doctorLastSaved || (p.role === 'Doctor' && state.doctorHasSelfSaved);
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-3xl md:text-4xl font-black text-green-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(34,197,94,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
        <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">🌙 Moderator: Ask the Doctor to wake up and point.</p>
        <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] tracking-[0.1em] pointer-events-none">Who does the Doctor save?</h3>
        {renderPlayerList((id) => state.submitNightAction('Doctor', id), true, disableCondition)}
      </div>
    );
  }

  if (state.phase === 'night_detective') {
    if (state.investigationResult) {
      const isDeadRole = state.investigationResult === 'DEAD_ROLE';
      const isMafia = state.investigationResult === 'MAFIA';
      return (
        <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center justify-center overflow-hidden pointer-events-none">
          {renderBackground()}
          {renderBackButton()}
          <p className="text-slate-300 uppercase font-bold tracking-widest text-[11px] mb-6 relative z-10 pointer-events-none">
            {isDeadRole ? "🔍 Moderator: Pretend to give an answer!" : "🔍 Moderator: Nod or shake your head."}
          </p>
          <h1 className={`text-6xl md:text-7xl font-black uppercase relative z-10 pointer-events-none ${isDeadRole ? 'text-slate-500 drop-shadow-[0_0_20px_rgba(107,114,128,0.5)]' : isMafia ? 'text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.7)]' : 'text-green-400 drop-shadow-[0_0_30px_rgba(34,197,94,0.7)]'}`}>
            {isDeadRole ? 'ROLE DEAD' : state.investigationResult}
          </h1>
          <button 
            onClick={state.advanceFromDetective}
            className="mt-12 p-5 w-full max-w-sm bg-[#0a0a0a]/90 backdrop-blur-md rounded-xl font-black tracking-widest uppercase active:scale-95 relative z-10 border border-slate-700 hover:border-slate-500 transition-colors shadow-lg pointer-events-auto"
          >
            Continue →
          </button>
        </div>
      );
    }
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-3xl md:text-4xl font-black text-blue-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(96,165,250,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
        <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">🔍 Moderator: Ask the Detective to wake up and point.</p>
        <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)] tracking-[0.1em] pointer-events-none">Who is investigated?</h3>
        {renderPlayerList((id) => state.submitNightAction('Detective', id), false)}
      </div>
    );
  }

  if (state.phase === 'night_sheriff') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-3xl md:text-4xl font-black text-purple-400 uppercase mt-14 relative z-10 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)] tracking-[0.15em] pointer-events-none">Night Phase</h2>
        <p className="text-slate-300 mt-3 text-sm relative z-10 font-semibold pointer-events-none">⚔️ Moderator: Ask the Sheriff to wake up and point.</p>
        <h3 className="text-4xl font-black mt-12 relative z-10 drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] tracking-[0.1em] pointer-events-none">Who does the Sheriff execute?</h3>
        {renderPlayerList((id) => state.submitNightAction('Sheriff', id), true)}
      </div>
    );
  }

  if (state.phase === 'day_transition') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-amber-50 uppercase tracking-[0.3em] drop-shadow-[0_0_40px_rgba(255,210,0,0.8)] relative z-20 animate-in fade-in duration-1000">
            EVERYONE
          </h2>
          <h2 className="text-5xl md:text-6xl font-black text-amber-50 uppercase tracking-[0.3em] drop-shadow-[0_0_40px_rgba(255,210,0,0.8)] relative z-20 mt-4 animate-in fade-in duration-1000 delay-500">
            OPEN YOUR EYES
          </h2>
          <p className="text-yellow-100 mt-8 text-lg tracking-widest font-bold relative z-20 animate-pulse">The sun is rising...</p>
        </div>
      </div>
    );
  }

  if (state.phase === 'day_recap' || state.phase === 'day_recap_post_vote') {
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center justify-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-4xl md:text-5xl font-black uppercase mb-12 text-white tracking-[0.2em] drop-shadow-[0_0_20px_rgba(255,255,255,0.6)] mt-14 relative z-10 animate-in fade-in duration-1000 pointer-events-none">The Town Awakens</h2>
        <div className="w-full max-w-2xl space-y-4 relative z-10 pointer-events-none">
          {state.dayRecap.map((msg, i) => (
            <div 
              key={i} 
              className="p-6 bg-slate-900/50 backdrop-blur-md rounded-xl text-lg font-bold border-l-4 border-amber-400 shadow-xl animate-in fade-in duration-1000 transition-colors pointer-events-auto hover:bg-slate-900/70"
              style={{ animationDelay: `${i * 200}ms` }}
            >
              <span className="text-amber-300">▸ </span>{msg}
            </div>
          ))}
        </div>
        <button 
          onClick={state.phase === 'day_recap' ? state.startVoting : state.advanceToNight}
          className="mt-12 p-5 w-full max-w-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 rounded-xl font-black tracking-widest uppercase active:scale-95 transition-transform shadow-xl relative z-10 hover:shadow-[0_0_30px_rgba(255,193,7,0.5)] pointer-events-auto"
        >
          {state.phase === 'day_recap' ? '→ Begin Voting' : '→ Go To Sleep (Next Night)'}
        </button>
      </div>
    );
  }

  if (state.phase === 'day_voting') {
    const currentVoter = alivePlayers[state.votingState.currentVoterIndex];
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <h2 className="text-slate-300 font-bold uppercase tracking-widest text-[12px] mt-14 mb-3 relative z-10 drop-shadow-md pointer-events-none">⚖️ Town Voting Phase</h2>
        <h3 className="text-5xl md:text-6xl font-black text-amber-300 my-4 uppercase relative z-10 drop-shadow-[0_0_20px_rgba(255,193,7,0.5)] pointer-events-none">{currentVoter.name}</h3>
        <p className="text-lg font-bold text-red-400 tracking-widest uppercase relative z-10 drop-shadow-md pointer-events-none">Who do you exile?</p>
        
        <div className="w-full max-w-sm mt-10 space-y-3 max-h-[50vh] overflow-y-auto pr-2 relative z-10 pointer-events-auto">
          {alivePlayers.filter(p => p.id !== currentVoter.id).map(p => (
            <button 
              key={p.id} 
              onClick={() => { setVoteSelected(true); state.submitVote(p.id); }}
              className="w-full p-4 bg-slate-900/70 backdrop-blur-md text-white border-2 border-slate-700/70 rounded-lg font-bold uppercase active:scale-95 transition-all hover:border-slate-500 hover:bg-slate-900"
            >
              → Vote {p.name}
            </button>
          ))}
          <button 
            onClick={() => state.submitVote(null)}
            disabled={!voteSelected}
            className={`w-full p-4 border-2 rounded-lg font-bold uppercase mt-6 active:scale-95 transition-all ${
              !voteSelected 
                ? 'opacity-40 pointer-events-none border-slate-700/30 bg-transparent text-slate-500' 
                : 'bg-transparent border-slate-600/50 backdrop-blur-sm text-slate-300 hover:border-slate-400 hover:text-slate-200'
            }`}
          >
            ⊘ Pass / No Vote
          </button>
        </div>
        {!voteSelected && (
          <p className="mt-8 text-slate-400 font-bold text-sm relative z-10 animate-pulse pointer-events-none">👉 Select a vote first, then you can pass</p>
        )}
        <p className="mt-10 text-slate-400 font-bold text-[11px] uppercase tracking-wider relative z-10 bg-slate-900/40 px-4 py-2 rounded-full backdrop-blur-md border border-slate-700/50 pointer-events-none">
          Vote {state.votingState.currentVoterIndex + 1} of {alivePlayers.length}
        </p>
      </div>
    );
  }

  if (state.phase === 'gameover') {
    const isMafiaWin = state.winner === 'Mafia';
    return (
      <div className="relative min-h-screen text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden pointer-events-none">
        {renderBackground()}
        {renderBackButton()}
        <div className="relative z-10 flex flex-col items-center pointer-events-none">
          <h1 className={`text-6xl md:text-7xl font-black uppercase mb-2 mt-14 ${isMafiaWin ? 'text-red-600 drop-shadow-[0_0_40px_rgba(220,38,38,0.8)]' : 'text-blue-400 drop-shadow-[0_0_40px_rgba(96,165,250,0.8)]'}`}>
            {state.winner} WIN!
          </h1>
          <p className={`text-sm tracking-[0.2em] font-bold ${isMafiaWin ? 'text-red-400' : 'text-blue-300'}`}>
            {isMafiaWin ? '🔴 THE MAFIA HAS TAKEN OVER THE TOWN' : '✓ THE TOWN HAS ELIMINATED THE THREAT'}
          </p>
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
          <button 
            onClick={() => {
              setTimeout(() => { state.playAgain(); }, 1500); 
            }}
            className="splash-batman-btn"
          >
            <span>PLAY AGAIN</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}