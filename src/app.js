import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const { PORT: port = 4000 } = process.env;

const app = express();

const path = dirname(fileURLToPath(import.meta.url));

app.use(express.static(join(path, '../client/')));

app.get('/', (req, res) => {
  res.send({ response: 'I am the server!' });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.info('New client connected');
  socket.emit('FromAPI', 'Hi');
});

server.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
