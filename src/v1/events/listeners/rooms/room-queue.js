import QueueService from '../../../services/queue-service';
import SocketService from '../../../services/socket-service';

export default function(emitter, events) {
  emitter.on(events.ROOM_USER_LEFT, async ({ room, user }) => {
    const queue = await QueueService.getQueue(room);
    const newQueue = queue.filter(dj => dj.id !== user.id);
    await QueueService.replaceQueue(newQueue);
  });

  emitter.on(events.ROOM_QUEUE_UPDATE, ({ room, queue }) =>
    SocketService.emitToRoom(room, events.ROOM_QUEUE_UPDATE, queue)
  );
}
