import { URL } from 'url';
import fetchTrack from './providers/providers';
import RoomService from './room-service';
import RedisService from './redis-service';
import TimerService from './timer-service';
import HistoryService from './history-service';
import EventService from './event-service';
import events from '../events/events';
import models from '../../models';

class TrackService {
  async fetchTrack(link) {
    const track = await fetchTrack(new URL(link));
    return await models.Track.createOrUpdate(track);
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
    EventService.emit(events.ROOM_CURRENT_TRACK, { room, track });
  }

  async onTrackFinish(roomId) {
    const room = await RoomService.findById(roomId);
    HistoryService.addTrack(room, room.currentTrack);
    const nextTrack = await RedisService.lpop(`rooms:${roomId}:queue`);
    await this.playTrack(room, nextTrack);
  }
}

export default new TrackService();
