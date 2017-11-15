import models from '../../models';
import { NotFoundError, BadRequestError } from '../errors';

class PlaylistService {
  async createPlaylist(name, visibility, user) {
    if (
      await models.Playlist.findOne({ where: { name, creatorId: user.id } })
    ) {
      throw BadRequestError('You already have a playlist with that name.');
    }
    return await models.Playlist.create({
      name,
      visibility,
      creatorId: user.id
    });
  }

  async findUserPlaylists(user, page = 1, limit = 1, showPrivate = false) {
    let where = { creatorId: user.id };
    if (showPrivate === false) {
      where.visibility = 'public';
    }
    return await models.Playlist.findAndCountAll({
      where,
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
              '(select count(*) from "playlist_tracks" where "PlaylistId" = "Playlist"."id")'
            ),
            'trackCount'
          ]
        ],
        exclude: ['creatorId']
      },
      limit,
      offset: (page - 1) * limit
    });
  }

  async findById(id) {
    const playlist = await models.Playlist.findById(id, {
      include: [
        {
          model: models.User,
          as: 'creator',
          attributes: ['id', 'username']
        },
        {
          model: models.Track,
          as: 'tracks',
          attributes: [
            'id',
            'title',
            'poster',
            'duration',
            'url',
            'artworkUrl',
            'provider'
          ]
        }
      ],
      attributes: {
        include: [
          [
            models.sequelize.literal(
              '(select count(*) from "playlist_tracks" where "PlaylistId" = "Playlist"."id")'
            ),
            'trackCount'
          ]
        ],
        exclude: ['creatorId']
      }
    });
    if (playlist === null) {
      throw NotFoundError('Playlist with given id not found.');
    }
    return playlist;
  }
}

export default new PlaylistService();
