import { DTimer } from 'dtimer';
import Promise from 'bluebird';
const redis = Promise.promisifyAll(require('redis'));
import TrackService from './track-service';

class TimerService {
  constructor() {
    this.timer = new DTimer(
      'rippleTimer',
      redis.createClient({ host: process.env.REDIS_HOST }),
      redis.createClient({ host: process.env.REDIS_HOST })
    );
    this.timer.join();
    this.timer.on('event', event => {
      if (event.id === `room:${event.roomId}:track`) {
        TrackService.onTrackFinish(event.roomId);
      }
    });
  }

  createTrackTimer(room, duration) {
    this.timer.post({ id: `room:${room.id}:track`, roomId: room.id }, duration);
  }

  cancelTrackTimer(room) {
    this.timer.cancel(`room:${room.id}:track`);
  }
}

export default new TimerService();
