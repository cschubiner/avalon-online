var globals = {};

globals.roleIsEvil = (role) => {
  return ['MORGANA', 'ASSASSIN', 'MINION'].includes(role.toUpperCase());
};

globals.roleIsGood = (role) => {
  return !globals.roleIsEvil(role);
};

globals.roleListForPlayerCount = (playerCount) => {
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

  return roleNames;
};

export default globals;
