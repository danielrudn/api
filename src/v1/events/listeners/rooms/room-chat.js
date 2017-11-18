import SocketService from '../../../services/socket-service';

export default function(emitter, events) {
  emitter.on(events.ROOM_USER_JOINED, ({ room, user }) => {
    SocketService.emitToRoom(room, events.ROOM_CHAT_MESSAGE, {
      sender: 'SERVER',
      text: `${user.username} has joined.`
    });
  });

  emitter.on(events.ROOM_USER_LEFT, ({ room, user }) => {
    SocketService.emitToRoom(room, events.ROOM_CHAT_MESSAGE, {
      sender: 'SERVER',
      text: `${user.username} has left.`
    });
  });

  emitter.on(events.ROOM_CHAT_MESSAGE, ({ room, user, text }) =>
    SocketService.emitToRoom(room, events.ROOM_CHAT_MESSAGE, {
      sender: user.username,
      text
    })
  );
}
