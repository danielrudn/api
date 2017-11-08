import { Router } from 'express';
import { BadRequestError } from '../errors';
import wrap from '../../wrap';
import { authenticate } from './auth-controller';
import verifyPagination from '../utils/verify-pagination';
import RoomService from '../services/room-service';

const roomRouter = Router();

roomRouter.use(
  '/:id*',
  wrap(async (req, res, next) => {
    req.room = await RoomService.findById(req.params.id);
    next();
  })
);

roomRouter.get(
  '/',
  verifyPagination(),
  wrap(async (req, res) => {
    const { page, limit, nextPageUrl } = req.query;
    const result = await RoomService.findAll(page, limit);
    const hasNext = page & (limit < result.count);
    res.json({
      pagination: {
        total: result.count,
        nextPageUrl: hasNext ? nextPageUrl : undefined
      },
      rooms: result.rows
    });
  })
);

roomRouter.get(
  '/:id',
  wrap(async (req, res) => {
    res.json(req.room);
  })
);

roomRouter.post(
  '/',
  authenticate,
  wrap(async (req, res) => {
    const { name, playType, accessType } = req.body;
    const room = await RoomService.createRoom(
      req.user,
      name,
      playType,
      accessType
    );
    res.status(201).json(await RoomService.findById(room.id));
  })
);

export default roomRouter;
