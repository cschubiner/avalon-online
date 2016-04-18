var globals = {};

globals.roleIsEvil = (role) => {
  return ['MORGANA', 'ASSASSIN', 'MINION'].includes(role.toUpperCase());
};

globals.roleIsGood = (role) => {
  return !globals.roleIsEvil(role);
};

export default globals;
