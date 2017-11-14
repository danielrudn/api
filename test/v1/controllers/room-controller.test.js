import mocha from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../src/index.js';
import seed from '../../fixtures/seed';

chai.use(chaiHttp);
const expect = chai.expect;

describe('RoomController', function() {
  describe('GET /rooms', function() {
    it('should get a paginated list of public rooms', async function() {
      const res = await chai.request(server).get('/v1/rooms');
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('pagination');
      expect(res.body.pagination).to.have.property('total');
      expect(res.body.pagination).to.have.property('nextPageUrl');
      expect(res.body).to.have.property('rooms');
      expect(res.body.rooms.length).to.eql(5);
      res.body.rooms.forEach(room => {
        expect(room).to.have.property('id');
        expect(room.id).to.not.eql('private');
        expect(room).to.have.property('accessType');
        expect(room.accessType).to.eql('public');
        expect(room).to.have.property('playType');
        expect(room).to.have.property('currentTrack');
        expect(room).to.have.property('numUsers');
        expect(room).to.have.property('followers');
        expect(room).to.have.property('creator');
        expect(room).to.have.property('queueLength');
        expect(room.creator).to.have.property('id');
        expect(room.creator).to.have.property('username');
        expect(room.creator).to.not.have.property('password');
        expect(room.creator).to.not.have.property('email');
      });
    });
    it('should get all rooms with a valid limit', async function() {
      const res = await chai.request(server).get('/v1/rooms?limit=50');
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('pagination');
      expect(res.body.pagination).to.have.property('total');
      expect(res.body.pagination).to.not.have.property('nextPageUrl');
      expect(res.body).to.have.property('rooms');
      expect(res.body.rooms.length).to.eql(res.body.pagination.total);
    });
    it('should get an empty result for page number being very high', async function() {
      const res = await chai.request(server).get('/v1/rooms?page=1000');
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('pagination');
      expect(res.body.pagination).to.have.property('total');
      expect(res.body.pagination).to.not.have.property('nextPageUrl');
      expect(res.body).to.have.property('rooms');
      expect(res.body.rooms).to.be.empty;
    });
    it('should get an error for negative/invalid page number', async function() {
      try {
        const res = await chai.request(server).get('/v1/rooms?page=0');
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql('Page number must be positive.');
      }
    });
    it('should get an error for pagination limit being too low', async function() {
      try {
        const res = await chai.request(server).get('/v1/rooms?limit=1');
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Limit must be greater than or equal to 5.'
        );
      }
    });
    it('should get an error for pagination limit being too high', async function() {
      try {
        const res = await chai.request(server).get('/v1/rooms?limit=51');
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Limit must be less than or equal to 50.'
        );
      }
    });
  });

  describe('GET /rooms/:id', function() {
    it('should get a public room', async function() {
      const res = await chai.request(server).get('/v1/rooms/123456');
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('id');
      expect(res.body.id).to.eql('123456');
      expect(res.body).to.have.property('accessType');
      expect(res.body.accessType).to.eql('public');
      expect(res.body).to.have.property('playType');
      expect(res.body).to.have.property('currentTrack');
      expect(res.body).to.have.property('users');
      expect(res.body.users).to.be.empty;
      expect(res.body).to.have.property('followers');
      expect(res.body.followers).to.eql(0);
      expect(res.body).to.have.property('creator');
    });
    it('should get a private room', async function() {
      const res = await chai.request(server).get('/v1/rooms/private');
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('id');
      expect(res.body.id).to.eql('private');
      expect(res.body).to.have.property('accessType');
      expect(res.body.accessType).to.eql('private');
      expect(res.body).to.have.property('playType');
      expect(res.body).to.have.property('currentTrack');
      expect(res.body.currentTrack).to.not.be.null;
      expect(res.body).to.have.property('users');
      expect(res.body.users).to.be.empty;
      expect(res.body).to.have.property('followers');
      expect(res.body.followers).to.eql(0);
      expect(res.body).to.have.property('creator');
      expect(res.body).to.have.property('queue');
      expect(res.body.queue.length).to.eql(1);
      expect(res.body.queue[0]).to.eql({ id: 'room_creator_2' });
    });
    it('should fail to get a non-existent room', async function() {
      try {
        const res = await chai.request(server).get('/v1/rooms/nothing-here');
        throw res;
      } catch (err) {
        expect(err.status).to.eql(404);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql('Room with given id not found.');
      }
    });
  });

  describe('POST /rooms', function() {
    it('should successfully create a room', async function() {
      const res = await chai
        .request(server)
        .post('/v1/rooms')
        .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
        .send({
          name: 'My Test Room',
          accessType: 'public',
          playType: 'private'
        });
      expect(res.status).to.eql(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('name');
      expect(res.body).to.have.property('accessType');
      expect(res.body).to.have.property('playType');
      expect(res.body).to.have.property('currentTrack');
      expect(res.body).to.have.property('city');
      expect(res.body).to.not.have.property('creatorId');
      expect(res.body).to.have.property('creator');
    });
    it('should fail to create room due to invalid token', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/rooms')
          .set('Authorization', 'Bearer invalid')
          .send({
            name: 'My Test Room',
            accessType: 'public',
            playType: 'private'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Missing Authorization header in the form: "Authorization: Bearer <jwt>"'
        );
      }
    });
    it('should fail to create room due to short name', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/rooms')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
          .send({
            name: '',
            accessType: 'public',
            playType: 'private'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Room name must be between 3 and 48 characters.'
        );
      }
    });
    it('should fail to create room due to long name', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/rooms')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
          .send({
            name: 'thisisareallyreallyreallyreallyreallyreallylongname',
            accessType: 'public',
            playType: 'private'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Room name must be between 3 and 48 characters.'
        );
      }
    });
    it('should fail to create room due invalid playType', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/rooms')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
          .send({
            name: 'Valid',
            accessType: 'no',
            playType: 'private'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Play type must be one of: ["public", "private"].'
        );
      }
    });
    it('should fail to create room due invalid accessType', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/rooms')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
          .send({
            name: 'Valid',
            accessType: 'public',
            playType: 'no'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Access type must be one of: ["public", "private"].'
        );
      }
    });
  });
});
