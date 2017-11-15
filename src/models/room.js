export default function(sequelize, DataTypes) {
  const Room = sequelize.define(
    'Room',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: {
            args: [3, 48],
            msg: 'Room name must be between 3 and 48 characters.'
          }
        }
      },
      playType: {
        type: DataTypes.STRING,
        defaultValue: 'public',
        validate: {
          isIn: {
            args: [['public', 'private']],
            msg: 'Play type must be one of: ["public", "private"].'
          }
        }
      },
      accessType: {
        type: DataTypes.STRING,
        defaultValue: 'public',
        validate: {
          isIn: {
            args: [['public', 'private']],
            msg: 'Access type must be one of: ["public", "private"].'
          }
        }
      },
      city: {
        type: DataTypes.STRING,
        defaultValue: 'Toronto'
      },
      currentTrack: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      tableName: 'rooms'
    }
  );

  Room.associate = models => {
    Room.belongsTo(models.User, {
      as: 'creator',
      allowNull: false
    });
    Room.belongsToMany(models.User, {
      through: 'room_users',
      as: 'users',
      timestamps: false
    });
    Room.belongsToMany(models.User, {
      through: 'room_followers',
      as: 'followers',
      timestamps: false
    });
  };

  return Room;
}
