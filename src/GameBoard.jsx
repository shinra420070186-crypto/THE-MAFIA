import React, { useState } from 'react';
import { Skull, Heart, Search, Shield, Target, UserCheck, UserX } from 'lucide-react';
import { playSound } from './sfx';

const GameBoard = ({ players, phase, onAction, nightActions, roles }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [currentNightStep, setCurrentNightStep] = useState('mafia'); // mafia, doctor, detective, sheriff
  const [investigationResult, setInvestigationResult] = useState(null);

  // Skip phases if those roles aren't in the game
  React.useEffect(() => {
    if (phase === 'night') {
      if (currentNightStep === 'doctor' && roles.doctor === 0) {
        setCurrentNightStep('detective');
      }
      if (currentNightStep === 'detective' && roles.detective === 0) {
        setCurrentNightStep('sheriff');
      }
      if (currentNightStep === 'sheriff' && roles.sheriff === 0) {
        // Night is over
      }
    }
  }, [currentNightStep, roles, phase]);

  const handleAction = () => {
    if (!selectedPlayer) return;
    
    if (phase === 'night') {
      if (currentNightStep === 'mafia') {
        onAction(selectedPlayer, 'killed');
        setCurrentNightStep('doctor');
      } else if (currentNightStep === 'doctor') {
        onAction(selectedPlayer, 'saved');
        setCurrentNightStep('detective');
      } else if (currentNightStep === 'detective') {
        onAction(selectedPlayer, 'investigated');
        const target = players.find(p => p.id === selectedPlayer);
        // Detective finds out true alignment
        setInvestigationResult(`${target.name} is ${target.role === 'mafia' ? 'Guilty (Mafia)' : 'Innocent (Town)'}`);
        // Pause to show result before moving on
        setTimeout(() => {
          setInvestigationResult(null);
          setCurrentNightStep('sheriff');
          setSelectedPlayer(null);
        }, 3000);
        return; // Don't clear selection immediately
      } else if (currentNightStep === 'sheriff') {
        onAction(selectedPlayer, 'checked');
        const target = players.find(p => p.id === selectedPlayer);
        // Sheriff finds out if suspicious (Mafia are suspicious, maybe some others depending on house rules, here just mafia)
        setInvestigationResult(`${target.name} appears ${target.role === 'mafia' ? 'Suspicious' : 'Not Suspicious'}`);
        setTimeout(() => {
          setInvestigationResult(null);
          // End of night is handled in App.js when sheriff action completes
        }, 3000);
        return;
      }
    } else if (phase === 'day') {
      onAction(selectedPlayer, 'executed');
    }
    
    setSelectedPlayer(null);
  };

  const getActionPrompt = () => {
    if (phase === 'day') return "SELECT PLAYER TO EXECUTE";
    if (phase === 'night') {
      switch (currentNightStep) {
        case 'mafia': return "MAFIA: SELECT TARGET TO KILL";
        case 'doctor': return "DOCTOR: SELECT TARGET TO SAVE";
        case 'detective': return "DETECTIVE: SELECT TARGET TO INVESTIGATE";
        case 'sheriff': return "SHERIFF: SELECT TARGET TO CHECK";
        default: return "WAITING...";
      }
    }
    return "";
  };

  const getActionButtonColor = () => {
    if (phase === 'day') return "bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]";
    if (phase === 'night') {
      switch (currentNightStep) {
        case 'mafia': return "bg-red-800 hover:bg-red-700 shadow-[0_0_15px_rgba(153,27,27,0.5)]";
        case 'doctor': return "bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)]";
        case 'detective': return "bg-yellow-600 hover:bg-yellow-500 shadow-[0_0_15px_rgba(202,138,4,0.5)]";
        case 'sheriff': return "bg-amber-600 hover:bg-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.5)]";
        default: return "bg-gray-600";
      }
    }
    return "bg-gray-600";
  };

  const getActionIcon = () => {
    if (phase === 'day') return <Skull size={20} className="mr-2" />;
    if (phase === 'night') {
      switch (currentNightStep) {
        case 'mafia': return <Target size={20} className="mr-2" />;
        case 'doctor': return <Heart size={20} className="mr-2" />;
        case 'detective': return <Search size={20} className="mr-2" />;
        case 'sheriff': return <Shield size={20} className="mr-2" />;
        default: return null;
      }
    }
    return null;
  };

  const getCardImage = (player) => {
    // If the game is over, or if the player is dead, show their actual role card
    if (phase === 'gameOver' || player.isDead) {
      switch (player.role) {
        case 'mafia': return '/mafia-card.jpg';
        case 'doctor': return '/doctor-card.jpg';
        case 'detective': return '/detective-card.jpg';
        case 'sheriff': return '/sheriff-card.jpg';
        default: return '/civilian-card.jpg';
      }
    }
    // Otherwise, show default civilian card as a generic back/front
    return '/civilian-card.jpg';
  };

  const onPlayerSelect = (id) => {
    const player = players.find(p => p.id === id);
    if (!player.isDead && phase !== 'gameOver') {
      playSound('click');
      setSelectedPlayer(id === selectedPlayer ? null : id);
    }
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      
      {investigationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-gray-900 border-2 border-yellow-500 p-8 rounded-2xl shadow-[0_0_30px_rgba(234,179,8,0.4)] text-center max-w-md w-full mx-4 animate-scale-in">
             <Search size={48} className="text-yellow-500 mx-auto mb-4" />
             <h3 className="text-2xl font-bold text-white mb-2">Investigation Result</h3>
             <p className="text-xl text-yellow-400">{investigationResult}</p>
          </div>
        </div>
      )}

      {phase !== 'gameOver' && !investigationResult && (
        <div className="mb-8 w-full max-w-md flex flex-col gap-3">
           <div className={`text-center py-2 px-4 rounded-lg font-bold text-sm tracking-widest ${
              phase === 'day' ? 'bg-red-900/30 text-red-400 border border-red-900/50' : 
              currentNightStep === 'mafia' ? 'bg-red-900/30 text-red-500 border border-red-900/50' :
              currentNightStep === 'doctor' ? 'bg-blue-900/30 text-blue-400 border border-blue-900/50' :
              currentNightStep === 'detective' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900/50' :
              'bg-amber-900/30 text-amber-400 border border-amber-900/50'
           }`}>
             {getActionPrompt()}
           </div>
           
           <button 
             onClick={handleAction}
             disabled={!selectedPlayer}
             className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center transition-all duration-300
               ${!selectedPlayer ? 'opacity-50 cursor-not-allowed bg-gray-700' : getActionButtonColor()}
             `}
           >
             {getActionIcon()}
             CONFIRM ACTION
           </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full max-w-5xl">
        {players.map((player) => {
          const isSelected = selectedPlayer === player.id;
          
          return (
            <div key={player.id} className="relative group perspective-1000">
              <div
                onClick={() => onPlayerSelect(player.id)}
                className={`
                  relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 group
                  ${player.isDead ? 'opacity-60 grayscale' : 'hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(220,38,38,0.3)]'}
                  ${isSelected ? 'border-2 border-red-500 scale-[1.02] shadow-[0_0_30px_rgba(220,38,38,0.5)]' : 'border border-white/[0.08]'}
                  bg-white/[0.02] backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]
                  aspect-[3/4] flex flex-col items-center justify-center
                `}
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
                  <img 
                    src={getCardImage(player)} 
                    alt={player.role || 'player'} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1509281373149-e957c6296406?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'; // Fallback dark abstract image
                    }}
                  />
                </div>
                
                {/* Dark gradient overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-0"></div>

                {/* Dead Overlay */}
                {player.isDead && (
                  <div className="absolute inset-0 bg-red-900/40 flex items-center justify-center z-10 backdrop-blur-[2px]">
                    <Skull size={48} className="text-red-500 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
                  </div>
                )}

                {/* Status Badges (Top) */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                   {phase === 'gameOver' && !player.isDead && (
                      <div className="bg-green-500/80 backdrop-blur-sm p-1 rounded-full text-white shadow-lg">
                        <UserCheck size={16} />
                      </div>
                   )}
                   {player.isDead && (
                      <div className="bg-red-600/80 backdrop-blur-sm p-1 rounded-full text-white shadow-lg">
                        <UserX size={16} />
                      </div>
                   )}
                </div>

                {/* Reveal Role on Game Over */}
                {phase === 'gameOver' && (
                  <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-md border border-white/20 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-gray-300">
                    {player.role}
                  </div>
                )}

                {/* Premium Glassmorphic Bottom Name Tile */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/40 backdrop-blur-xl border-t border-white/[0.08] group-hover:bg-black/50 transition-colors duration-500 z-10">
                  <p className="text-gray-100 font-bold text-center truncate tracking-wide group-hover:text-white transition-colors">{player.name}</p>
                </div>
                
                {/* Selection Highlight Ring */}
                {isSelected && (
                  <div className="absolute inset-0 border-4 border-red-500 rounded-2xl z-20 pointer-events-none animate-pulse-slow"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameBoard;