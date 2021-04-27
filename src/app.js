import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import {
  userJoin, userLeave, getRoomUsers, getRoomHost, getCurrentUser,
} from './users.js';
import { giveRole, increaseTurn } from './game.js';

dotenv.config();

const { PORT: port = 4000, CLIENT_URL: clientUrl } = process.env;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ msg: 'I am the server for the game Hidden Traitor' });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST'],
  },
});

// Connection
io.on('connection', (socket) => {
  console.info('New client connected');

  // runs when a client joins
  socket.on('join', ({ name, room }) => {
    const user = userJoin(socket.id, name, room);

    socket.join(user.room);

    // broadcast (to all clients) when a client connects
    socket.broadcast.to(user.room).emit('message', `${user.name} joined the game.`);

    // send user and room info
    io.to(user.room).emit('room-info', { room: user.room, users: getRoomUsers(user.room), host: getRoomHost(user.room) });
  });

  // runs when a client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit('message', `${user.name} left the game.`);
      // send user and room info
      io.to(user.room).emit('room-info', { room: user.room, users: getRoomUsers(user.room), host: getRoomHost(user.room) });
    }
  });

  // start game
  socket.on('start-game', (player) => {
    const users = getRoomUsers(player.room);
    giveRole(users);
    io.to(player.room).emit('starting-game', {
      room: player.room, users, host: getRoomHost(player.room), playerTurn: 0, turn: 1,
    });
  });

  // spy action
  socket.on('action-spy', (player) => {
    io.to(player.id).emit('message-spy');
  });

  // spy on player action
  socket.on('action-spy-on-player', (data) => {
    const player = getCurrentUser(data.id);
    // updata turn and info
    const users = getRoomUsers(player.room).filter((user) => user.inGame);
    const turns = increaseTurn(player.playerTurn, player.turn, users);
    const { playerTurn, turn } = turns;
    io.to(player.room).emit('action-response', {
      player,
      room: player.room,
      users,
      host: getRoomHost(player.room),
      playerTurn,
      turn,
    });

    io.to(player.room).emit('message', `${player.name} played spy action.`);
    io.to(player.id).emit('message', `${data.user.name} is ${data.user.role}.`);
    io.to(data.id).emit('message-spy-on-player', data.user);
  });

  // switch action
  socket.on('action-switch', (player) => {
    io.to(player.room).emit('message', `${player.name} played switch action.`);
  });

  // confirm action
  socket.on('action-confirm', (player) => {
    // updata turn and info
    const users = getRoomUsers(player.room).filter((user) => user.inGame);
    const turns = increaseTurn(player.playerTurn, player.turn, users);
    const { playerTurn, turn } = turns;
    io.to(player.room).emit('action-response', {
      player,
      room: player.room,
      users,
      host: getRoomHost(player.room),
      playerTurn,
      turn,
    });

    io.to(player.room).emit('message', `${player.name} played confirm action.`);
    io.to(player.id).emit('message', `You are ${player.role}.`);
    io.to(player.id).emit('message-confirm', `You are ${player.role}.`);
  });
});

server.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
