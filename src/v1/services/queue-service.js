import RedisService from './redis-service';
import EventService from './event-service';
import events from '../events/events';
import { ForbiddenError, BadRequestError } from '../errors';

class QueueService {
  async getQueueLength(room) {
    return await RedisService.llen(`rooms:${room.id}:queue`);
  }

  async getQueue(room, user) {
    try {
      const queue = await RedisService.lrange(`rooms:${room.id}:queue`);
      return queue.map(track => {
        if (user === undefined || track.dj.id !== user.id) {
          track = track.dj;
        }
        return track;
      });
    } catch (err) {
      return [];
    }
  }

  async replaceQueue(room, newQueue) {
    await RedisService.replaceList(`rooms:${room.id}:queue`, newQueue);
    EventService.emit(events.ROOM_QUEUE_UPDATE, { room, queue: newQueue });
  }

  async addTrack(room, track) {
    await RedisService.rpush(`rooms:${room.id}:queue`, track);
    EventService.emit(events.ROOM_QUEUE_UPDATE, {
      room,
      queue: await this.getQueue(room)
    });
  }

  async removeTrack(room, user, index) {
    const key = `rooms:${room.id}:queue`;
    const track = await RedisService.lindex(key, index);
    if (track === null) {
      throw BadRequestError('Track index out of range.');
    }
    if (track.dj.id === user.id) {
      await RedisService.deleteFromList(key, index);
      EventService.emit(events.ROOM_QUEUE_UPDATE, {
        room,
        queue: await this.getQueue(room)
      });
    } else {
      throw ForbiddenError('You did not add this song to the queue.');
    }
  }
}

export default new QueueService();
