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
    user.inGame = true;
    roles.splice(i, 1);
  });
}

export function increaseTurn(playerTurn, turn, users) {
  const turns = { playerTurn, turn };
  if (playerTurn + 1 < users.length) {
    users.forEach((user) => {
      user.playerTurn = playerTurn + 1;
    });
    turns.playerTurn = playerTurn + 1;
    return turns;
  }
  users.forEach((user) => {
    user.playerTurn = 0;
    user.turn += 1;
  });
  turns.playerTurn = 0;
  turns.turn += 1;
  return turns;
}
