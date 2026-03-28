import { create } from 'zustand';

export const useGameStore = create((set, get) => ({
  phase: 'lobby', 
  players: [],
  settings: { revealRoles: true },
  
  revealIndex: 0, // Tracks whose turn it is to see their card
  
  nightActions: { mafia: null, doctor: null, sheriff: null },
  investigationResult: null, 
  dayRecap: [], 
  
  votingState: { currentVoterIndex: 0, votes: {} }, 
  winner: null, 

  addPlayer: (name) => set((state) => ({
    players: [...state.players, { id: Math.random().toString(36).substr(2, 9), name, role: 'Civilian', isAlive: true }]
  })),

  removePlayer: (id) => set((state) => ({
    players: state.players.filter(p => p.id !== id)
  })),

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
      phase: 'role_reveal', // Go to Reveal Phase first!
      revealIndex: 0,
      nightActions: { mafia: null, doctor: null, sheriff: null },
      dayRecap: [],
      winner: null
    });
  },

  nextRoleReveal: () => {
    const { revealIndex, players } = get();
    if (revealIndex + 1 < players.length) {
      // Next player's turn to look
      set({ revealIndex: revealIndex + 1 });
    } else {
      // Everyone has looked. Hand phone to Moderator.
      set({ phase: 'night_mafia' });
    }
  },

  submitNightAction: (role, targetId) => {
    const state = get();
    const alivePlayers = state.players.filter(p => p.isAlive);
    const hasSheriff = alivePlayers.some(p => p.role === 'Sheriff');

    if (role === 'Mafia') {
      set({ nightActions: { ...state.nightActions, mafia: targetId }, phase: 'night_doctor' });
    } 
    else if (role === 'Doctor') {
      set({ nightActions: { ...state.nightActions, doctor: targetId }, phase: 'night_detective' });
    } 
    else if (role === 'Detective') {
      const target = state.players.find(p => p.id === targetId);
      const isMafia = target.role === 'Mafia';
      set({ investigationResult: isMafia ? 'MAFIA' : 'CIVILIAN' });
    }
    else if (role === 'Sheriff') {
      set({ nightActions: { ...state.nightActions, sheriff: targetId } });
      get().processNight(); 
    }
  },

  advanceFromDetective: () => {
    const state = get();
    const alivePlayers = state.players.filter(p => p.isAlive);
    const hasSheriff = alivePlayers.some(p => p.role === 'Sheriff');
    
    set({ investigationResult: null });
    if (hasSheriff) {
      set({ phase: 'night_sheriff' });
    } else {
      get().processNight();
    }
  },

  processNight: () => {
    const { players, nightActions } = get();
    let nextPlayers = [...players];
    let recap = [];

    if (nightActions.mafia && nightActions.mafia !== nightActions.doctor) {
      const victim = nextPlayers.find(p => p.id === nightActions.mafia);
      if (victim) {
        victim.isAlive = false;
        recap.push(`${victim.name} was killed in the night.`);
      }
    }

    if (nightActions.sheriff) {
      const target = nextPlayers.find(p => p.id === nightActions.sheriff);
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

    set({ players: nextPlayers, dayRecap: recap, phase: 'day_recap', nightActions: { mafia: null, doctor: null, sheriff: null } });
    get().checkWinCondition();
  },

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

  advanceToNight: () => set({ phase: 'night_mafia' }),

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

  playAgain: () => set({ phase: 'lobby', players: [], winner: null })
}));
