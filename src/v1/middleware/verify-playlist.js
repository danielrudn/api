import { NotFoundError, ForbiddenError } from '../errors';

export default (args = { requireCreator: false }) => {
  return (req, res, next) => {
    let isCreator = false;
    if (req.user && req.user.id === req.playlist.creator.id) {
      isCreator = true;
    }
    if (req.playlist.visibility === 'private' && !isCreator) {
      throw NotFoundError('Playlist with given id not found.');
    } else if (args.requireCreator && !isCreator) {
      throw ForbiddenError('Must be the creator of this playlist.');
    }
    next();
  };
};
