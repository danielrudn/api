import RedisService from './redis-service';
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

  async addTrack(room, track) {
    await RedisService.rpush(`rooms:${room.id}:queue`, track);
  }

  async removeTrack(room, user, index) {
    const key = `rooms:${room.id}:queue`;
    const track = await RedisService.lindex(key, index);
    if (track === null) {
      throw BadRequestError('Track index out of range.');
    }
    if (track.dj.id === user.id) {
      await RedisService.lset(key, index, 'DELETE');
      await RedisService.lrem(key, 'DELETE');
    } else {
      throw ForbiddenError('You did not add this song to the queue.');
    }
  }
}

export default new QueueService();
