import mocha from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../src/index.js';
import seed from '../../../fixtures/seed';

chai.use(chaiHttp);
const expect = chai.expect;

describe('RoomFollowersController', function() {
  describe('POST /rooms/:id/followers', function() {
    it('should successfully follow a room', async function() {
      const res = await chai
        .request(server)
        .post('/v1/rooms/follow-test/followers')
        .set('Authorization', `Bearer ${seed.accessToken}`);
      expect(res.status).to.eql(201);
      expect(res.body).to.have.property('id');
      expect(res.body.id).to.eql('follow-test');
    });
    it('should fail when already following a room', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/rooms/follow-test/followers')
          .set('Authorization', `Bearer ${seed.userTokens['follow_creator']}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql('Already following this room.');
      }
    });
    it('should not allow a guest to follow a room', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/rooms/follow-test/followers')
          .set('Authorization', `Bearer ${seed.guestAccessToken}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Guests are not able to follow rooms.'
        );
      }
    });
    it('should fail when sent invalid/missing access token', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/rooms/follow-test/followers');
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Missing Authorization header in the form: "Authorization: Bearer <jwt>"'
        );
      }
    });
    it('should fail when trying to follow non-existent room', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/rooms/nothing-here/followers')
          .set('Authorization', `Bearer ${seed.accessToken}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(404);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql('Room with given id not found.');
      }
    });
  });

  describe('DELETE /rooms/:id/followers', function() {
    it('should successfully unfollow a room', async function() {
      const res = await chai
        .request(server)
        .del('/v1/rooms/unfollow-test/followers')
        .set('Authorization', `Bearer ${seed.userTokens['unfollow_creator']}`);
      expect(res.status).to.eql(204);
      expect(res.body).to.be.empty;
    });
    it('should fail when user does not follow the room', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/rooms/unfollow-test/followers')
          .set('Authorization', `Bearer ${seed.guestAccessToken}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql('Not following this room.');
      }
    });
    it('should fail when sent invalid/missing access token', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/rooms/unfollow-test/followers');
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Missing Authorization header in the form: "Authorization: Bearer <jwt>"'
        );
      }
    });
    it('should fail when trying to unfollow non-existent room', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/rooms/nothing-here/followers')
          .set('Authorization', `Bearer ${seed.accessToken}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(404);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql('Room with given id not found.');
      }
    });
  });
});
