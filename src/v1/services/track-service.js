import { URL } from 'url';
import fetchTrack from './providers/providers';
import RoomService from './room-service';
import RedisService from './redis-service';
import TimerService from './timer-service';
import models from '../../models';

class TrackService {
  async fetchTrack(link) {
    return await fetchTrack(new URL(link));
  }

  async playTrack(room, track) {
    if (track !== null) {
      track.likes = 0;
      track.skips = 0;
      track.timestamp = Date.now();
      TimerService.createTrackTimer(room, track.duration);
    }
    room.currentTrack = track;
    await room.save();
  }

  async onTrackFinish(roomId) {
    const room = await RoomService.findById(roomId);
    const nextTrack = await RedisService.lpop(`rooms:${roomId}:queue`);
    await this.playTrack(room, nextTrack);
  }
}

export default new TrackService();
