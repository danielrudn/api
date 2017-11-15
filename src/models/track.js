export default function(sequelize, DataTypes) {
  const Track = sequelize.define(
    'Track',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      poster: {
        type: DataTypes.STRING,
        allowNull: false
      },
      artworkUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUrl: {
            args: true,
            msg: 'Artwork url is not a valid url.'
          }
        }
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isUrl: {
            args: true,
            msg: 'Track url is not a valid url.'
          }
        }
      },
      provider: {
        type: DataTypes.STRING,
        validate: {
          isIn: {
            args: [['YouTube', 'SoundCloud']],
            msg: 'Track provider must be one of: ["YouTube", "SoundCloud"].'
          }
        }
      }
    },
    {
      tableName: 'tracks',
      timestamps: false
    }
  );

  Track.associate = models => {
    Track.belongsToMany(models.Playlist, {
      through: 'playlist_tracks',
      as: 'tracks'
    });
  };

  Track.createOrUpdate = async args => {
    let track = await Track.find({ where: { url: args.url } });
    if (track === null) {
      track = await Track.create(args);
    } else {
      await track.update(args);
    }
    return track;
  };

  return Track;
}
