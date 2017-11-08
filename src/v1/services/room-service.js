import models from '../../models';
import { RoomNotFoundError } from '../errors';

class RoomService {
  __generateId() {
    return new Buffer(Math.random().toString(36), 'binary')
      .toString('base64')
      .substring(3, 9);
  }

  async createRoom(creator, name, accessType, playType) {
    return await models.Room.create({
      id: this.__generateId(),
      name,
      accessType,
      playType,
      city: creator.city,
      creatorId: creator.id
    });
  }

  async findAll(page = 1, limit = 1) {
    try {
      return await models.Room.findAndCountAll({
        where: { accessType: 'public' },
        include: [
          {
            model: models.User,
            as: 'creator',
            attributes: ['id', 'username']
          }
        ],
        attributes: {
          include: [
            [
              models.sequelize.literal(
                '(select count(*) from "room_users" where "RoomId" = "Room"."id")'
              ),
              'numUsers'
            ],
            [
              models.sequelize.literal(
                '(select count(*) from "room_followers" where "RoomId" = "Room"."id")'
              ),
              'followers'
            ]
          ],
          exclude: ['creatorId']
        },
        order: [
          [models.sequelize.col('numUsers'), 'DESC'],
          [models.sequelize.col('followers'), 'DESC'],
          ['createdAt', 'DESC']
        ],
        limit,
        offset: (page - 1) * limit
      });
    } catch (err) {
      return { count: 0, rows: [] };
    }
  }

  async findById(id) {
    try {
      const room = await models.Room.findById(id, {
        include: [
          {
            model: models.User,
            as: 'creator',
            attributes: ['id', 'username']
          },
          {
            model: models.User,
            as: 'users',
            attributes: ['id', 'username']
          }
        ],
        attributes: {
          include: [
            [
              models.sequelize.literal(
                '(select count(*) from "room_followers" where "RoomId" = "Room"."id")'
              ),
              'followers'
            ]
          ],
          exclude: ['creatorId']
        }
      });
      if (room === null) {
        throw RoomNotFoundError();
      }
      return room;
    } catch (err) {
      throw RoomNotFoundError();
    }
  }
}

export default new RoomService();
