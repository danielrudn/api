import socketio from 'socket.io';
import redis from 'socket.io-redis';
import http from 'http';
import EventService from './event-service';
import RoomService from './room-service';
import TokenService from './token-service';
import models from '../../models';
import { BadCredentialsError } from '../errors';
import events from '../events/events';

class SocketService {
  init(app) {
    const server = http.Server(app);
    this.io = socketio.listen(server);
    this.io.adapter(redis({ host: process.env.REDIS_HOST }));
    if (process.env.NODE_ENV === 'test') {
      server.listen(3000, () => console.log('Listening...'));
    } else {
      models.sequelize.sync().then(() => {
        server.listen(3000, () => console.log('Listening...'));
      });
    }
    this.io.on('connection', this.onConnection.bind(this));
  }

  onConnection(socket) {}

  onDisconnect(socket, room, user) {}

  emitToRoom(room, event, data) {
    this.io.to(room.id).emit(event, data);
  }
}

export default new SocketService();
