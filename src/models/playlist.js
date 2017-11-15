export default function(sequelize, DataTypes) {
  const Playlist = sequelize.define(
    'Playlist',
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [1, 30],
            msg: 'Playlist name must be between 1 and 30 characters.'
          }
        }
      },
      visibility: {
        type: DataTypes.STRING,
        defaultValue: 'public',
        validate: {
          isIn: {
            args: [['public', 'private']],
            msg: 'Playlist visibility must be one of: ["public", "private"].'
          }
        }
      }
    },
    {
      tableName: 'playlists'
    }
  );

  Playlist.associate = models => {
    Playlist.belongsTo(models.User, { as: 'creator', allowNull: false });
    Playlist.belongsToMany(models.Track, {
      through: 'playlist_tracks',
      as: 'tracks'
    });
  };

  return Playlist;
}
