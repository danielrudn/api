import SocketService from '../../../services/socket-service';

export default function(emitter, events) {
  emitter.on(events.ROOM_HISTORY_UPDATE, ({ room, history }) =>
    SocketService.emitToRoom(room, events.ROOM_HISTORY_UPDATE, history)
  );
}
