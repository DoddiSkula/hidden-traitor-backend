/* eslint-disable no-param-reassign */
import { getCurrentUser } from './users.js';

// randomly assign roles to players
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

// increase game turn and player turn
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

// swap the roles of two players
export function swapRoles(player1ID, player2ID) {
  const player1 = getCurrentUser(player1ID);
  const player2 = getCurrentUser(player2ID);

  const player1Role = player1.newRole ? player1.newRole : player1.role;
  const player2Role = player2.newRole ? player2.newRole : player2.role;

  player1.newRole = player2Role;
  player2.newRole = player1Role;
}

// update the role of a player
export function updateRole(id) {
  const player = getCurrentUser(id);
  const role = player.newRole;
  player.role = role;
  delete player.newRole;
  return player;
}
