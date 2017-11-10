import { Router } from 'express';
import wrap from '../../wrap';
import { authenticate } from './auth-controller';
import { BadCredentialsError, BadRequestError } from '../errors';

const followerRouter = Router();

followerRouter.post(
  '/',
  authenticate,
  wrap(async (req, res) => {
    const { room, user } = req;
    if (user.isGuest) {
      throw BadCredentialsError('Guests are not able to follow rooms.');
    } else if (await room.hasFollower(user.id)) {
      throw BadRequestError('Already following this room.');
    }
    await room.addFollower(user.id);
    res.status(201).json(room);
  })
);

followerRouter.delete(
  '/',
  authenticate,
  wrap(async (req, res) => {
    const { room, user } = req;
    if (await room.hasFollower(user.id)) {
      await room.removeFollower(user.id);
      res.status(204).end();
    } else {
      throw BadRequestError('Not following this room.');
    }
  })
);

export default followerRouter;
