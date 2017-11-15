import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import wrap from '../middleware/async-wrap';
import TrackService from '../services/track-service';
import QueueService from '../services/queue-service';
import { ForbiddenError } from '../errors';

const queueRouter = Router();

queueRouter.post(
  '/',
  authenticate,
  wrap(async (req, res) => {
    const { url } = req.body;
    if (
      req.room.playType === 'private' &&
      req.user.id !== req.room.creator.id
    ) {
      throw ForbiddenError(
        'Room play type is set to private. Only the creator can play.'
      );
    }
    const track = (await TrackService.fetchTrack(url)).toJSON();
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
    res.status(204).end();
  })
);

export default queueRouter;
