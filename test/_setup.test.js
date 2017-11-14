import mocha from 'mocha';
import RedisService from '../src/v1/services/redis-service';
import sequelizeFixtures from 'sequelize-fixtures';
import models from '../src/models';
import { init } from './fixtures/seed';

describe('Test Setup', function() {
  it('should set up & seed database', function(done) {
    if (process.env.NODE_ENV === 'test') {
      models.sequelize
        .drop({ cascade: true })
        .then(() => RedisService.flushall())
        .then(() => models.sequelize.sync())
        .then(() => sequelizeFixtures.loadFile('test/fixtures/*.json', models))
        .then(() => init())
        .then(() => done());
    } else {
      throw Error(
        'Not running tests with NODE_ENV=test, other tests not guaranteed to pass.'
      );
    }
  });
});
