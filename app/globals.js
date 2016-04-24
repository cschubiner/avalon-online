var globals = {};

globals.numPlayersOnQuests = [2, 3, 4, 3, 4];

// 0 indexed
globals.numFailsToFail = (questNum, numPlayers) => {
  if (questNum === 3 && numPlayers >= 7)
    return 2;

  return 1;
};

globals.roleIsEvil = (role) => {
  return ['MORGANA', 'ASSASSIN', 'MINION'].includes(role.toUpperCase());
};

globals.roleIsGood = (role) => {
  return !globals.roleIsEvil(role);
};

globals.fbArrLen = (arr) => {
  return arr ? arr.length : 0;
};

globals.fbArr = (arr) => {
  return arr ? arr : [];
};

globals.roleNamesForPlayerCount = (playerCount) => {
  let roleNames = ['Merlin', 'Morgana', 'Percival', 'Assassin', 'Villager'];
  if (playerCount >= 6) {
    roleNames.push('Villager');
  }
  if (playerCount >= 7) {
    roleNames.push('Minion');
  }
  if (playerCount >= 8) {
    roleNames.push('Villager');
  }
  if (playerCount >= 9) {
    roleNames.push('Villager');
  }
  if (playerCount >= 10) {
    roleNames.push('Minion');
  }
  for (let i = 11; i <= playerCount; i++) {
    roleNames.push('Villager');
  }

  return roleNames;
};

export default globals;
