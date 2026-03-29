import { create } from 'zustand';

const loadPlayers = () => {
  try {
    const saved = localStorage.getItem('mafia_roster');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Could not load players", e);
  }
  return [];
};

const savePlayers = (players) => {
  const cleanPlayers = players.map(p => ({ id: p.id, name: p.name, role: 'Civilian', isAlive: true }));
  localStorage.setItem('mafia_roster', JSON.stringify(cleanPlayers));
};

export const useGameStore = create((set, get) => ({
  phase: 'splash', // Starts on the Batman Splash Screen
  players: loadPlayers(), 
  settings: { revealRoles: true },
  revealIndex: 0, 
  nightActions: { mafia: null, doctor: null, sheriff: null },
  investigationResult: null, 
  dayRecap: [], 
  doctorLastSaved: null,
  doctorHasSelfSaved: false,
  votingState: { currentVoterIndex: 0, votes: {} }, 
  winner: null, 

  enterLobby: () => set({ phase: 'lobby' }),

  addPlayer: (name) => set((state) => {
    const newPlayers = [...state.players, { id: Math.random().toString(36).substr(2, 9), name, role: 'Civilian', isAlive: true }];
    savePlayers(newPlayers);
    return { players: newPlayers };
  }),

  removePlayer: (id) => set((state) => {
    const newPlayers = state.players.filter(p => p.id !== id);
    savePlayers(newPlayers);
    return { players: newPlayers };
  }),

  toggleRevealRoles: () => set((state) => ({
    settings: { ...state.settings, revealRoles: !state.settings.revealRoles }
  })),

  startGame: () => {
    const { players } = get();
    if (players.length < 4) return;

    let deck = [...players];
    const count = deck.length;

    const mafiaCount = count >= 8 ? 2 : 1;
    const roles = Array(mafiaCount).fill('Mafia');
    roles.push('Doctor', 'Detective');
    if (count >= 8) roles.push('Sheriff');
    while (roles.length < count) roles.push('Civilian');

    for (let i = roles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [roles[i], roles[j]] = [roles[j], roles[i]];
    }

    const assignedPlayers = deck.map((p, i) => ({ ...p, role: roles[i], isAlive: true }));

    set({
      players: assignedPlayers,
      phase: 'role_reveal',
      revealIndex: 0,
      nightActions: { mafia: null, doctor: null, sheriff: null },
      dayRecap: [],
      winner: null,
      doctorLastSaved: null,
      doctorHasSelfSaved: false,
    });
  },

  nextRoleReveal: () => {
    const { revealIndex, players } = get();
    if (revealIndex + 1 < players.length) {
      set({ revealIndex: revealIndex + 1 });
    } else {
      set({ phase: 'night_transition' }); 
    }
  },

  startNightRoles: () => set({ phase: 'night_mafia' }),

  submitNightAction: (role, targetId) => {
    const state = get();

    if (role === 'Mafia') {
      set({ nightActions: { ...state.nightActions, mafia: targetId }, phase: 'night_doctor' });
    } 
    else if (role === 'Doctor') {
      let selfSaved = state.doctorHasSelfSaved;
      const doctorPlayer = state.players.find(p => p.role === 'Doctor');
      if (doctorPlayer && targetId === doctorPlayer.id) selfSaved = true;

      set({ 
        nightActions: { ...state.nightActions, doctor: targetId }, 
        doctorLastSaved: targetId,
        doctorHasSelfSaved: selfSaved,
        phase: 'night_detective' 
      });
    } 
    else if (role === 'Detective') {
      const detectivePlayer = state.players.find(p => p.role === 'Detective');
      if (detectivePlayer && detectivePlayer.isAlive) {
        if (targetId) {
          const target = state.players.find(p => p.id === targetId);
          set({ investigationResult: target.role === 'Mafia' ? 'MAFIA' : 'CIVILIAN' });
        } else {
          set({ investigationResult: 'SKIPPED' });
        }
      } else {
        set({ investigationResult: 'DEAD_ROLE' });
      }
    }
    else if (role === 'Sheriff') {
      set({ nightActions: { ...state.nightActions, sheriff: targetId } });
      get().processNight(); 
    }
  },

  advanceFromDetective: () => {
    const state = get();
    const gameHasSheriff = state.players.some(p => p.role === 'Sheriff');
    
    set({ investigationResult: null });
    if (gameHasSheriff) {
      set({ phase: 'night_sheriff' });
    } else {
      get().processNight();
    }
  },

  processNight: () => {
    const state = get();
    let nextPlayers = [...state.players];
    let recap = [];

    const isMafiaAlive = nextPlayers.some(p => p.role === 'Mafia' && p.isAlive);
    const isDoctorAlive = nextPlayers.some(p => p.role === 'Doctor' && p.isAlive);
    const isSheriffAlive = nextPlayers.some(p => p.role === 'Sheriff' && p.isAlive);

    const finalMafiaTarget = isMafiaAlive ? state.nightActions.mafia : null;
    const finalDoctorTarget = isDoctorAlive ? state.nightActions.doctor : null;
    const finalSheriffTarget = isSheriffAlive ? state.nightActions.sheriff : null;

    if (finalMafiaTarget && finalMafiaTarget !== finalDoctorTarget) {
      const victim = nextPlayers.find(p => p.id === finalMafiaTarget);
      if (victim) {
        victim.isAlive = false;
        recap.push(`${victim.name} was killed in the night.`);
      }
    }

    if (finalSheriffTarget) {
      const target = nextPlayers.find(p => p.id === finalSheriffTarget);
      const sheriff = nextPlayers.find(p => p.role === 'Sheriff');
      if (target && sheriff) {
        target.isAlive = false;
        recap.push(`The Sheriff executed ${target.name}.`);
        if (target.role !== 'Mafia') {
          sheriff.isAlive = false;
          recap.push(`The Sheriff shot an innocent and died from guilt.`);
        }
      }
    }

    if (recap.length === 0) recap.push("The night was quiet. Nobody died.");

    set({ players: nextPlayers, dayRecap: recap, phase: 'day_transition', nightActions: { mafia: null, doctor: null, sheriff: null } });
    get().checkWinCondition();
  },

  startDayRecap: () => set({ phase: 'day_recap' }),

  startVoting: () => set({ phase: 'day_voting', votingState: { currentVoterIndex: 0, votes: {} } }),

  submitVote: (targetId) => {
    const { players, votingState } = get();
    const alivePlayers = players.filter(p => p.isAlive);
    const currentVoter = alivePlayers[votingState.currentVoterIndex];

    const newVotes = { ...votingState.votes, [currentVoter.id]: targetId };

    if (votingState.currentVoterIndex + 1 < alivePlayers.length) {
      set({ votingState: { currentVoterIndex: votingState.currentVoterIndex + 1, votes: newVotes } });
    } else {
      get().processVoting(newVotes);
    }
  },

  processVoting: (votes) => {
    const { players, settings } = get();
    let nextPlayers = [...players];
    let recap = [];

    const voteCounts = {};
    Object.values(votes).forEach(targetId => {
      if (targetId) voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    });

    let maxVotes = 0;
    let kickedId = null;
    let tie = false;

    Object.keys(voteCounts).forEach(id => {
      if (voteCounts[id] > maxVotes) {
        maxVotes = voteCounts[id];
        kickedId = id;
        tie = false;
      } else if (voteCounts[id] === maxVotes) {
        tie = true;
      }
    });

    if (tie || !kickedId) {
      recap.push("The vote was a tie. Nobody was exiled today.");
    } else {
      const victim = nextPlayers.find(p => p.id === kickedId);
      victim.isAlive = false;
      let msg = `The town voted out ${victim.name}.`;
      if (settings.revealRoles) msg += ` They were ${victim.role === 'Mafia' ? 'the MAFIA' : 'an INNOCENT'}.`;
      recap.push(msg);
    }

    set({ players: nextPlayers, dayRecap: recap, phase: 'day_recap' });
    
    const isGameOver = get().checkWinCondition();
    if (!isGameOver) {
      set({ phase: 'day_recap_post_vote' }); 
    }
  },

  advanceToNight: () => set({ phase: 'night_transition' }),

  checkWinCondition: () => {
    const { players } = get();
    const alive = players.filter(p => p.isAlive);
    const mafiaAlive = alive.filter(p => p.role === 'Mafia').length;
    const innocentAlive = alive.length - mafiaAlive;

    if (mafiaAlive === 0) {
      set({ phase: 'gameover', winner: 'Civilians' });
      return true;
    } else if (mafiaAlive >= innocentAlive) {
      set({ phase: 'gameover', winner: 'Mafia' });
      return true;
    }
    return false;
  },

  playAgain: () => set((state) => {
    const resetPlayers = state.players.map(p => ({ ...p, role: 'Civilian', isAlive: true }));
    return { phase: 'lobby', players: resetPlayers, winner: null };
  }),

  resetToLobby: () => set((state) => {
    const resetPlayers = state.players.map(p => ({ ...p, role: 'Civilian', isAlive: true }));
    return { 
      phase: 'lobby', // Returns to Lobby, not Splash, to save time
      players: resetPlayers, 
      winner: null,
      nightActions: { mafia: null, doctor: null, sheriff: null },
      investigationResult: null,
      dayRecap: [],
      doctorLastSaved: null,
      doctorHasSelfSaved: false,
    };
  })
}));