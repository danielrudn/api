import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
// postgres parseInt hack to turn count(*) into integer rather than string
import pg from 'pg';
pg.defaults.parseInt8 = true;

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    dialect: 'postgres',
    host: process.env.POSTGRES_HOST,
    logging: process.env.NODE_ENV === 'development' ? console.log : undefined
  }
);

const db = {};

fs
  .readdirSync(__dirname)
  .filter(file => file.indexOf('.') !== 0 && file !== 'index.js')
  .forEach(file => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
