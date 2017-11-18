import socketio from 'socket.io';
import redis from 'socket.io-redis';
import http from 'http';
import EventService from './event-service';
import RoomService from './room-service';
import TokenService from './token-service';
import models from '../../models';
import { BadCredentialsError, BadRequestError } from '../errors';
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
    this.io.on('connection', this.onConnect.bind(this));
  }

  onConnect(socket) {
    socket.on('join', async args => {
      try {
        const { roomId, accessToken } = args;
        let user = TokenService.verifyToken(accessToken);
        if (!user) {
          throw BadCredentialsError(
            'Invalid, expired, or missing access token.'
          );
        }
        const room = await RoomService.findById(roomId);
        if (await room.hasUser(user.id)) {
          throw BadRequestError('You are already in this room.');
        } else {
          socket.join(roomId);
          EventService.emit(events.ROOM_USER_JOINED, { room, user });
          socket.on(events.ROOM_CHAT_MESSAGE, text =>
            EventService.emit(events.ROOM_CHAT_MESSAGE, { room, user, text })
          );
          socket.on('disconnect', () => this.onDisconnect(socket, room, user));
        }
      } catch (err) {
        this.io.to(socket.uid).emit('error', {
          statusCode: err.statusCode,
          error: err.message
        });
        socket.disconnect();
      }
    });
  }

  onDisconnect(socket, room, user) {
    socket.leave(room.id);
    socket.removeAllListeners();
    EventService.emit(events.ROOM_USER_LEFT, { room, user });
  }

  emitToRoom(room, event, data) {
    this.io.to(room.id).emit(event, data);
  }
}

export default new SocketService();
