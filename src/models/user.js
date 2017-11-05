import bcrypt from 'bcrypt';

export default function(sequelize, DataTypes) {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: { msg: 'User with given email already exists.' },
        validate: {
          isEmail: {
            args: true,
            msg: 'The email provided is invalid.'
          }
        }
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: { msg: 'User with given username already exists.' },
        validate: {
          len: {
            args: [3, 16],
            msg: 'Username must be between 3 and 16 characters.'
          },
          not: {
            args: [['.*[^A-Za-z0-9-_].*', '^[Ss][Ee][Rr][Vv][Ee][Rr]']],
            msg: 'Username contains invalid characters.'
          },
          is: {
            args: ['^[A-Za-z]+([-_]?[A-Za-z[0-9]+)*$'],
            msg:
              'Username must start with a letter and end with an alphanumeric character.'
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: {
            args: [8, 128],
            msg: 'Password must be between 8 and 128 characters.'
          }
        }
      },
      city: {
        type: DataTypes.STRING,
        defaultValue: 'Toronto'
      },
      activated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      isGuest: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {
      tableName: 'users',
      hooks: {
        beforeCreate: async user => {
          if (user.password) {
            const salt = await bcrypt.genSalt(12);
            const hashed = await bcrypt.hash(user.password, salt);
            user.password = hashed;
          }
        },
        beforeUpdate: async user => {
          if (user.password && user.changed('password')) {
            const salt = await bcrypt.genSalt(12);
            const hashed = await bcrypt.hash(user.password, salt);
            user.password = hashed;
          }
        }
      }
    }
  );

  User.prototype.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
  };

  return User;
}
