/* eslint-disable no-param-reassign */

export function giveRole(users) {
  const roles = [];
  for (let i = 0; i < users.length - 1; i += 1) {
    roles.push('Agent');
  }
  roles.push('Traitor');

  users.forEach((user) => {
    const i = Math.floor(Math.random() * roles.length);
    user.role = `${roles[i]}`;
    roles.splice(i, 1);
  });
}

export function increaseTurn(playerTurn, users) {
  if (playerTurn + 1 < users.length) {
    users.forEach((user) => {
      user.playerTurn = playerTurn + 1;
    });
    return playerTurn + 1;
  }
  users.forEach((user) => {
    user.playerTurn = 0;
  });
  return 0;
}
