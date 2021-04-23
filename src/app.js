import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import {
  userJoin, userLeave, getRoomUsers, getRoomHost,
} from './users.js';
import { giveRole, increaseTurn } from './game.js';

dotenv.config();

const { PORT: port = 4000, CLIENT_URL: clientUrl } = process.env;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send({ response: 'I am the server!' });
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
    const user = userJoin(socket.id, name, room, '', 0);

    socket.join(user.room);

    // new client joins
    socket.emit('message', `${user.name} joined the game.`);

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
    console.info(users);
    io.to(player.room).emit('starting-game', {
      room: player.room, users, host: getRoomHost(player.room), playerTurn: 0,
    });
  });

  // spy action
  socket.on('action-spy', (player) => {
    io.to(player.room).emit('message', `${player.name} played spy action.`);
  });

  // switch action
  socket.on('action-switch', (player) => {
    io.to(player.room).emit('message', `${player.name} played switch action.`);
  });

  // confirm action
  socket.on('action-confirm', (player) => {
    const users = getRoomUsers(player.room);
    const playerTurn = increaseTurn(player.playerTurn, users);

    io.to(player.room).emit('action-confirm-response', {
      player,
      room: player.room,
      users,
      host: getRoomHost(player.room),
      playerTurn,
    });
    io.to(player.room).emit('message', `${player.name} played confirm action.`);
    io.to(player.id).emit('message', `You are ${player.role}.`);
    io.to(player.id).emit('message-confirm', `You are ${player.role}.`);
  });
});

server.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
