var globals = {};

globals.roleIsEvil = (role) => {
  return ['MORGANA', 'ASSASSIN', 'MINION'].includes(role.toUpperCase());
};

globals.roleIsGood = (role) => {
  return !globals.roleIsEvil(role);
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
