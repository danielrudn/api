import SocketService from '../../../services/socket-service';

export default function(emitter, events) {
  emitter.on(events.ROOM_CURRENT_TRACK, ({ room, track }) =>
    SocketService.emitToRoom(room, events.ROOM_CURRENT_TRACK, track)
  );
}
