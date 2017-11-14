import { Router } from 'express';
import TrackService from '../services/track-service';
import QueueService from '../services/queue-service';
import { authenticate } from './auth-controller';
import wrap from '../../wrap';

const queueRouter = Router();

queueRouter.post(
  '/',
  authenticate,
  wrap(async (req, res) => {
    const { url } = req.body;
    const track = await TrackService.fetchTrack(url);
    track.dj = { id: req.user.id, username: req.user.username };
    if (req.room.currentTrack === null) {
      await TrackService.playTrack(req.room, track);
    } else {
      await QueueService.addTrack(req.room, track);
    }
    res.status(201).json(await QueueService.getQueue(req.room, req.user));
  })
);

queueRouter.delete(
  '/:index',
  authenticate,
  wrap(async (req, res) => {
    const { index } = req.params;
    await QueueService.removeTrack(req.room, req.user, index);
    res.status(204).send();
  })
);

export default queueRouter;
