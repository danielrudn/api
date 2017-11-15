import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import wrap from '../middleware/async-wrap';
import verifyPlaylist from '../middleware/verify-playlist';
import { NotFoundError, ForbiddenError, BadRequestError } from '../errors';
import PlaylistService from '../services/playlist-service';
import TrackService from '../services/track-service';

const playlistRouter = Router();

playlistRouter.param('id', (req, res, next, id) => {
  PlaylistService.findById(id)
    .then(playlist => {
      req.playlist = playlist;
      next();
    })
    .catch(err => next(err));
});

playlistRouter.get(
  '/:id',
  optionalAuthenticate,
  verifyPlaylist(),
  (req, res) => {
    res.status(200).json(req.playlist);
  }
);

playlistRouter.post(
  '/',
  authenticate,
  wrap(async (req, res) => {
    const { name, visibility } = req.body;
    if (req.user.isGuest) {
      throw ForbiddenError('Guests are not able to create playlists.');
    }
    const playlist = await PlaylistService.createPlaylist(
      name,
      visibility,
      req.user
    );
    res.status(201).json(await PlaylistService.findById(playlist.id));
  })
);

playlistRouter.post(
  '/:id',
  authenticate,
  verifyPlaylist({ requireCreator: true }),
  wrap(async (req, res) => {
    const { url } = req.body;
    const track = await TrackService.fetchTrack(url);
    await req.playlist.addTrack(track);
    res.status(201).json(req.playlist);
  })
);

playlistRouter.delete(
  '/:id',
  authenticate,
  verifyPlaylist({ requireCreator: true }),
  wrap(async (req, res) => {
    await req.playlist.destroy();
    res.status(204).end();
  })
);

playlistRouter.delete(
  '/:id/:trackId',
  authenticate,
  verifyPlaylist({ requireCreator: true }),
  wrap(async (req, res) => {
    const { trackId } = req.params;
    if (await req.playlist.hasTrack(trackId)) {
      await req.playlist.removeTrack(trackId);
      res.status(204).end();
    } else {
      throw BadRequestError('Track not in playlist.');
    }
  })
);

export default playlistRouter;
