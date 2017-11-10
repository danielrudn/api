import mocha from 'mocha';
import sequelizeFixtures from 'sequelize-fixtures';
import models from '../src/models';
import seed, { initTokens } from '../fixtures/seed';

describe('Test Setup', function() {
  it('should set up & seed database', function(done) {
    if (process.env.NODE_ENV === 'test') {
      models.sequelize
        .drop()
        .then(() => models.sequelize.sync())
        .then(() => sequelizeFixtures.loadFile('fixtures/*.json', models))
        .then(() => initTokens())
        .then(() => done());
    } else {
      throw Error(
        'Not running tests with NODE_ENV=test, other tests not guaranteed to pass.'
      );
    }
  });
});
