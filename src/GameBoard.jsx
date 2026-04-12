import React, { useState, useEffect } from 'react';
import { Users, Shield, Skull, Heart, Search, X, Play, Eye, EyeOff, Settings, Info, UserX, UserCheck } from 'lucide-react';
import GameBoard from './GameBoard.jsx';
import { getSoundSettings, playSound, toggleMute as toggleGlobalMute } from './sfx.js';

function App() {
  const [players, setPlayers] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [gamePhase, setGamePhase] = useState('setup'); // setup, assignRoles, showRoles, night, day
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [rolesVisibility, setRolesVisibility] = useState(false);
  const [isMuted, setIsMuted] = useState(getSoundSettings().isMuted);
  
  // Game state
  const [roles, setRoles] = useState({
    mafia: 1,
    doctor: 0,
    detective: 0,
    sheriff: 0,
    civilian: 0
  });
  
  const [nightActions, setNightActions] = useState({
    killed: null,
    saved: null,
    investigated: null
  });

  const [narratorMessage, setNarratorMessage] = useState('');

  // Handle sound toggle
  const handleToggleMute = () => {
    toggleGlobalMute();
    setIsMuted(getSoundSettings().isMuted);
    playSound('click');
  };

  // Add player
  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 15) {
      playSound('click');
      setPlayers([...players, { 
        id: Date.now().toString(), 
        name: newPlayerName.trim(), 
        role: null, 
        isDead: false 
      }]);
      setNewPlayerName('');
    }
  };

  // Remove player
  const removePlayer = (id) => {
    playSound('click');
    setPlayers(players.filter(p => p.id !== id));
  };

  // Adjust role count
  const adjustRole = (role, delta) => {
    playSound('click');
    const newCount = roles[role] + delta;
    if (newCount >= 0) {
      setRoles({ ...roles, [role]: newCount });
    }
  };

  // Calculate total assigned roles
  const totalAssignedRoles = Object.values(roles).reduce((a, b) => a + b, 0);

  // Auto-calculate civilians
  useEffect(() => {
    const nonCivilianRoles = roles.mafia + roles.doctor + roles.detective + roles.sheriff;
    const civilians = Math.max(0, players.length - nonCivilianRoles);
    if (roles.civilian !== civilians) {
      setRoles(prev => ({ ...prev, civilian: civilians }));
    }
  }, [players.length, roles.mafia, roles.doctor, roles.detective, roles.sheriff]);

  // Start game and assign roles
  const startGame = () => {
    if (players.length < 3) {
      alert("Need at least 3 players to start!");
      return;
    }
    
    if (totalAssignedRoles !== players.length) {
      alert(`Role count mismatch! You have ${players.length} players but assigned ${totalAssignedRoles} roles.`);
      return;
    }

    playSound('gameStart');

    // Create role array based on counts
    let roleArray = [];
    Object.entries(roles).forEach(([role, count]) => {
      for (let i = 0; i < count; i++) {
        roleArray.push(role);
      }
    });

    // Shuffle roles
    for (let i = roleArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roleArray[i], roleArray[j]] = [roleArray[j], roleArray[i]];
    }

    // Assign roles to players
    const playersWithRoles = players.map((player, index) => ({
      ...player,
      role: roleArray[index]
    }));

    setPlayers(playersWithRoles);
    setGamePhase('showRoles');
    setCurrentPlayerIndex(0);
    setRolesVisibility(false);
  };

  // Next player in role reveal
  const nextPlayer = () => {
    playSound('click');
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setRolesVisibility(false);
    } else {
      startNightPhase();
    }
  };

  const startNightPhase = () => {
    playSound('nightPhase');
    setGamePhase('night');
    setNightActions({ killed: null, saved: null, investigated: null });
    setNarratorMessage("The town goes to sleep. Mafia, open your eyes and choose your victim.");
  };

  const handleNightAction = (targetId, actionType) => {
    playSound('click');
    setNightActions(prev => ({ ...prev, [actionType]: targetId }));
    
    // Determine next step based on action
    if (actionType === 'killed') {
      if (roles.doctor > 0 && players.some(p => p.role === 'doctor' && !p.isDead)) {
        setNarratorMessage("Mafia has chosen. Doctor, open your eyes and choose who to save.");
      } else if (roles.detective > 0 && players.some(p => p.role === 'detective' && !p.isDead)) {
        setNarratorMessage("Doctor is absent. Detective, open your eyes and choose who to investigate.");
      } else if (roles.sheriff > 0 && players.some(p => p.role === 'sheriff' && !p.isDead)) {
        setNarratorMessage("Detective is absent. Sheriff, open your eyes and choose who to check.");
      } else {
        processNightEnd({...nightActions, killed: targetId});
      }
    } else if (actionType === 'saved') {
      if (roles.detective > 0 && players.some(p => p.role === 'detective' && !p.isDead)) {
        setNarratorMessage("Doctor has chosen. Detective, open your eyes and choose who to investigate.");
      } else if (roles.sheriff > 0 && players.some(p => p.role === 'sheriff' && !p.isDead)) {
        setNarratorMessage("Detective is absent. Sheriff, open your eyes and choose who to check.");
      } else {
        processNightEnd({...nightActions, saved: targetId});
      }
    } else if (actionType === 'investigated') {
      if (roles.sheriff > 0 && players.some(p => p.role === 'sheriff' && !p.isDead)) {
        setNarratorMessage("Detective has chosen. Sheriff, open your eyes and choose who to check.");
      } else {
        processNightEnd({...nightActions, investigated: targetId});
      }
    } else if (actionType === 'checked') {
      processNightEnd({...nightActions, checked: targetId});
    }
  };

  const processNightEnd = (actions) => {
    playSound('dayPhase');
    setGamePhase('day');
    
    let resultMessage = "The sun comes up. ";
    
    if (actions.killed) {
      if (actions.killed === actions.saved) {
        resultMessage += "Someone was attacked last night, but the Doctor saved them! No one died.";
      } else {
        const deadPlayer = players.find(p => p.id === actions.killed);
        resultMessage += `Tragedy struck! ${deadPlayer.name} was killed last night.`;
        
        // Update dead status
        setPlayers(players.map(p => 
          p.id === actions.killed ? { ...p, isDead: true } : p
        ));
      }
    } else {
      resultMessage += "It was a peaceful night. No one died.";
    }
    
    setNarratorMessage(resultMessage);
  };

  const handleDayExecution = (targetId) => {
    playSound('gunshot');
    const deadPlayer = players.find(p => p.id === targetId);
    setPlayers(players.map(p => 
      p.id === targetId ? { ...p, isDead: true } : p
    ));
    setNarratorMessage(`The town has voted. ${deadPlayer.name} has been executed.`);
    
    // Check win conditions
    setTimeout(checkWinCondition, 2000);
  };

  const checkWinCondition = () => {
    const alivePlayers = players.filter(p => !p.isDead);
    const aliveMafia = alivePlayers.filter(p => p.role === 'mafia').length;
    const aliveTown = alivePlayers.length - aliveMafia;

    if (aliveMafia === 0) {
      playSound('win');
      setGamePhase('gameOver');
      setNarratorMessage("TOWN WINS! All Mafia members have been eliminated.");
    } else if (aliveMafia >= aliveTown) {
      playSound('lose');
      setGamePhase('gameOver');
      setNarratorMessage("MAFIA WINS! They have taken control of the town.");
    } else {
      startNightPhase();
    }
  };

  const resetGame = () => {
    playSound('click');
    setGamePhase('setup');
    setPlayers(players.map(p => ({ ...p, role: null, isDead: false })));
  };

  // Render setup phase
  const renderSetup = () => (
    <div className="max-w-md w-full bg-black/60 backdrop-blur-md p-8 rounded-2xl border border-red-900/30 shadow-2xl relative z-10">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-900 tracking-wider font-spooky drop-shadow-lg mb-2">THE MAFIA</h1>
        <p className="text-gray-400 font-medium">A Game of Deception</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center mb-4">
          <Users className="mr-2 text-red-500" size={20} />
          Players ({players.length})
        </h2>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            placeholder="Enter player name"
            className="flex-1 bg-black/50 border border-red-900/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
          />
          <button 
            onClick={addPlayer}
            disabled={!newPlayerName.trim() || players.length >= 15}
            className="bg-red-700 hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-500 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-[0_0_10px_rgba(220,38,38,0.3)] hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]"
          >
            Add
          </button>
        </div>

        {players.length > 0 && (
          <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            <ul className="space-y-3 mb-6">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-0.5 transition-all duration-300"
                >
                  <span className="text-gray-100 font-medium tracking-wide">{player.name}</span>
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/20 transition-all duration-300"
                  >
                    <X size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {players.length >= 3 && (
        <div className="mb-6 animate-fade-in">
          <h2 className="text-xl font-bold text-white flex items-center mb-4 border-t border-red-900/30 pt-4">
            <Settings className="mr-2 text-red-500" size={20} />
            Roles Setup
          </h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex flex-col items-center p-3 bg-black/40 rounded-xl border border-red-900/50 shadow-inner">
              <div className="flex items-center text-red-500 font-bold mb-2">
                <Skull size={16} className="mr-1" /> Mafia
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => adjustRole('mafia', -1)} disabled={roles.mafia <= 1} className="w-8 h-8 rounded-full bg-red-900/50 hover:bg-red-800 flex items-center justify-center text-white disabled:opacity-50">-</button>
                <span className="text-xl font-bold text-white w-4 text-center">{roles.mafia}</span>
                <button onClick={() => adjustRole('mafia', 1)} className="w-8 h-8 rounded-full bg-red-900/50 hover:bg-red-800 flex items-center justify-center text-white">+</button>
              </div>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-black/40 rounded-xl border border-blue-900/50 shadow-inner">
              <div className="flex items-center text-blue-400 font-bold mb-2">
                <Heart size={16} className="mr-1" /> Doctor
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => adjustRole('doctor', -1)} disabled={roles.doctor <= 0} className="w-8 h-8 rounded-full bg-blue-900/50 hover:bg-blue-800 flex items-center justify-center text-white disabled:opacity-50">-</button>
                <span className="text-xl font-bold text-white w-4 text-center">{roles.doctor}</span>
                <button onClick={() => adjustRole('doctor', 1)} className="w-8 h-8 rounded-full bg-blue-900/50 hover:bg-blue-800 flex items-center justify-center text-white">+</button>
              </div>
            </div>
            
            <div className="flex flex-col items-center p-3 bg-black/40 rounded-xl border border-yellow-900/50 shadow-inner">
              <div className="flex items-center text-yellow-500 font-bold mb-2">
                <Search size={16} className="mr-1" /> Detective
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => adjustRole('detective', -1)} disabled={roles.detective <= 0} className="w-8 h-8 rounded-full bg-yellow-900/50 hover:bg-yellow-800 flex items-center justify-center text-white disabled:opacity-50">-</button>
                <span className="text-xl font-bold text-white w-4 text-center">{roles.detective}</span>
                <button onClick={() => adjustRole('detective', 1)} className="w-8 h-8 rounded-full bg-yellow-900/50 hover:bg-yellow-800 flex items-center justify-center text-white">+</button>
              </div>
            </div>

            <div className="flex flex-col items-center p-3 bg-black/40 rounded-xl border border-amber-900/50 shadow-inner">
              <div className="flex items-center text-amber-500 font-bold mb-2">
                <Shield size={16} className="mr-1" /> Sheriff
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => adjustRole('sheriff', -1)} disabled={roles.sheriff <= 0} className="w-8 h-8 rounded-full bg-amber-900/50 hover:bg-amber-800 flex items-center justify-center text-white disabled:opacity-50">-</button>
                <span className="text-xl font-bold text-white w-4 text-center">{roles.sheriff}</span>
                <button onClick={() => adjustRole('sheriff', 1)} className="w-8 h-8 rounded-full bg-amber-900/50 hover:bg-amber-800 flex items-center justify-center text-white">+</button>
              </div>
            </div>
          </div>
          
          <div className="bg-black/50 p-3 rounded-lg flex justify-between items-center border border-gray-800">
            <span className="text-gray-300">Civilians (Auto)</span>
            <span className="text-xl font-bold text-gray-400">{roles.civilian}</span>
          </div>
        </div>
      )}

      <button
        onClick={startGame}
        disabled={players.length < 3 || totalAssignedRoles !== players.length}
        className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 disabled:from-gray-800 disabled:to-gray-900 text-white py-4 rounded-xl font-bold text-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_25px_rgba(220,38,38,0.6)] disabled:shadow-none flex items-center justify-center group"
      >
        <Play className="mr-2 group-hover:scale-110 transition-transform" /> START GAME
      </button>
    </div>
  );

  // Render role reveal phase
  const renderRoleReveal = () => (
    <div className="max-w-md w-full bg-black/70 backdrop-blur-lg p-10 rounded-2xl border border-red-900/40 shadow-2xl text-center relative z-10 animate-scale-in">
      {!rolesVisibility ? (
        <>
          <div className="text-center mb-8">
            <p className="text-xl text-gray-400 mb-2">Pass the device to</p>
            <h2 className="text-4xl font-bold text-red-600 mb-2">{players[currentPlayerIndex].name}</h2>
            <p className="text-sm text-gray-500">Everyone else look away!</p>
          </div>
          <button
            onClick={() => {
              playSound('reveal');
              setRolesVisibility(true);
            }}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-6 rounded-xl font-bold text-xl transition-all border border-gray-600 flex flex-col items-center justify-center gap-3 shadow-lg"
          >
            <Eye size={32} className="text-red-500" />
            TAP TO REVEAL ROLE
          </button>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-white mb-6">Your Role Is</h2>
          <div className="mb-8 p-8 rounded-2xl bg-black/50 border border-gray-700 shadow-inner relative overflow-hidden">
            {/* Role-specific styling and icon */}
            <div className={`absolute inset-0 opacity-20 ${
              players[currentPlayerIndex].role === 'mafia' ? 'bg-red-600' :
              players[currentPlayerIndex].role === 'doctor' ? 'bg-blue-500' :
              players[currentPlayerIndex].role === 'detective' ? 'bg-yellow-500' :
              players[currentPlayerIndex].role === 'sheriff' ? 'bg-amber-500' : 'bg-gray-500'
            }`}></div>
            
            <div className="relative z-10 flex flex-col items-center">
              {players[currentPlayerIndex].role === 'mafia' && <Skull size={64} className="text-red-500 mb-4 animate-pulse-slow" />}
              {players[currentPlayerIndex].role === 'doctor' && <Heart size={64} className="text-blue-400 mb-4 animate-pulse-slow" />}
              {players[currentPlayerIndex].role === 'detective' && <Search size={64} className="text-yellow-500 mb-4 animate-pulse-slow" />}
              {players[currentPlayerIndex].role === 'sheriff' && <Shield size={64} className="text-amber-500 mb-4 animate-pulse-slow" />}
              {players[currentPlayerIndex].role === 'civilian' && <Users size={64} className="text-gray-400 mb-4" />}
              
              <h3 className={`text-4xl font-extrabold uppercase tracking-widest ${
                players[currentPlayerIndex].role === 'mafia' ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
                players[currentPlayerIndex].role === 'doctor' ? 'text-blue-400' :
                players[currentPlayerIndex].role === 'detective' ? 'text-yellow-500' :
                players[currentPlayerIndex].role === 'sheriff' ? 'text-amber-500' : 'text-gray-300'
              }`}>
                {players[currentPlayerIndex].role}
              </h3>
            </div>
          </div>
          
          <p className="text-gray-400 mb-8 px-4 h-16 flex items-center justify-center">
            {players[currentPlayerIndex].role === 'mafia' && "Eliminate the townspeople during the night. Don't get caught."}
            {players[currentPlayerIndex].role === 'doctor' && "Save one person each night from being killed."}
            {players[currentPlayerIndex].role === 'detective' && "Investigate one person each night to learn their true alignment."}
            {players[currentPlayerIndex].role === 'sheriff' && "Check one person each night to see if they are suspicious."}
            {players[currentPlayerIndex].role === 'civilian' && "Find the Mafia and vote them out during the day."}
          </p>
          
          <button
            onClick={nextPlayer}
            className="w-full bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          >
            <EyeOff size={20} />
            HIDE & NEXT
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans overflow-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black z-0"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay z-0 pointer-events-none"></div>
      
      {/* Sound Toggle Button */}
      <button 
        onClick={handleToggleMute}
        className="absolute top-4 right-4 z-50 bg-black/50 backdrop-blur-md border border-white/10 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        title={isMuted ? "Unmute Sound" : "Mute Sound"}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
        )}
      </button>

      {gamePhase === 'setup' && renderSetup()}
      {gamePhase === 'showRoles' && renderRoleReveal()}
      
      {(gamePhase === 'night' || gamePhase === 'day' || gamePhase === 'gameOver') && (
        <div className="w-full max-w-6xl h-full flex flex-col items-center relative z-10 animate-fade-in py-8">
          
          <div className="w-full flex justify-between items-center mb-6 bg-black/40 backdrop-blur-md p-4 rounded-xl border border-red-900/30">
            <h1 className="text-3xl font-spooky text-red-600 tracking-wider">THE MAFIA</h1>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${gamePhase === 'night' ? 'bg-blue-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`}></div>
                <span className="font-bold text-gray-300 uppercase tracking-widest">{gamePhase} PHASE</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-8 bg-black/60 backdrop-blur-md p-6 rounded-xl border border-gray-800 w-full max-w-3xl shadow-xl">
            <Info className="inline-block text-gray-400 mb-2" size={24} />
            <p className="text-xl md:text-2xl text-gray-200 font-medium leading-relaxed">{narratorMessage}</p>
          </div>
          
          <div className="w-full flex-grow flex justify-center items-center">
            <GameBoard 
              players={players} 
              phase={gamePhase} 
              onAction={gamePhase === 'night' ? handleNightAction : handleDayExecution} 
              nightActions={nightActions}
              roles={roles}
            />
          </div>

          {gamePhase === 'gameOver' && (
            <button
              onClick={resetGame}
              className="mt-10 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white px-10 py-4 rounded-xl font-bold text-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-3 animate-bounce-slow"
            >
              <Settings size={24} />
              PLAY AGAIN
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;