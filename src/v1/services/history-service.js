import RedisService from './redis-service';
import EventService from './event-service';
import events from '../events/events';

class HistoryService {
  async getHistoryLength(room) {
    return await RedisService.llen(`rooms:${room.id}:history`);
  }

  async getHistory(room) {
    try {
      return await RedisService.lrange(`rooms:${room.id}:history`);
    } catch (err) {
      return [];
    }
  }

  async addTrack(room, track) {
    await RedisService.lpush(`rooms:${room.id}:history`, track);
    EventService.emit(events.ROOM_HISTORY_UPDATE, {
      room,
      history: await this.getHistory(room)
    });
  }
}

export default new HistoryService();
