import mocha from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../src/index.js';
import seed from '../../fixtures/seed';

chai.use(chaiHttp);
const expect = chai.expect;

describe('RoomQueueController', function() {
  describe('POST /rooms/:id/queue', function() {
    it('should successfully play a youtube track in a room with no current track', async function() {
      const res = await chai
        .request(server)
        .post('/v1/rooms/queue-test/queue')
        .set('Authorization', `Bearer ${seed.userTokens['queue_creator']}`)
        .send({ url: 'https://www.youtube.com/watch?v=B7bqAsxee4I' });
      expect(res.status).to.eql(201);
      expect(res.body).to.eql([]);
      const roomRes = await chai.request(server).get('/v1/rooms/queue-test');
      expect(roomRes.status).to.eql(200);
      expect(roomRes.body.currentTrack).to.not.be.null;
      expect(roomRes.body.currentTrack.url).to.eql(
        'https://www.youtube.com/watch?v=B7bqAsxee4I'
      );
    });
    it('should successfully play a soundcloud track in a room with no current track', async function() {
      const res = await chai
        .request(server)
        .post('/v1/rooms/queue-test-sc/queue')
        .set('Authorization', `Bearer ${seed.userTokens['queue_creator_sc']}`)
        .send({
          url:
            'https://soundcloud.com/droplexofficial/droplex-bangara-original-mix-out'
        });
      expect(res.status).to.eql(201);
      expect(res.body).to.eql([]);
      const roomRes = await chai.request(server).get('/v1/rooms/queue-test-sc');
      expect(roomRes.status).to.eql(200);
      expect(roomRes.body.currentTrack).to.not.be.null;
      expect(roomRes.body.currentTrack.url).to.eql(
        'https://soundcloud.com/droplexofficial/droplex-bangara-original-mix-out'
      );
    });
    it('should successfully add a youtube track to queue when room already has a current track', async function() {
      const res = await chai
        .request(server)
        .post('/v1/rooms/queue-test-2/queue')
        .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
        .send({ url: 'https://www.youtube.com/watch?v=B7bqAsxee4I' });
      expect(res.status).to.eql(201);
      expect(res.body).to.not.eql([]);
      expect(res.body.length).to.eql(1);
      expect(res.body[0].url).to.eql(
        'https://www.youtube.com/watch?v=B7bqAsxee4I'
      );
    });
    it('should successfully add a soundcloud track to queue when room already has a current track', async function() {
      const res = await chai
        .request(server)
        .post('/v1/rooms/queue-test-2-sc/queue')
        .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
        .send({
          url:
            'https://soundcloud.com/droplexofficial/droplex-bangara-original-mix-out'
        });
      expect(res.status).to.eql(201);
      expect(res.body).to.not.eql([]);
      expect(res.body.length).to.eql(1);
      expect(res.body[0].url).to.eql(
        'https://soundcloud.com/droplexofficial/droplex-bangara-original-mix-out'
      );
    });
    it('should successfully append a track to queue when room already has a current track and existing queue', async function() {
      const res = await chai
        .request(server)
        .post('/v1/rooms/has-queue-test/queue')
        .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
        .send({
          url: 'https://www.youtube.com/watch?v=B7bqAsxee4I'
        });
      expect(res.status).to.eql(201);
      expect(res.body).to.not.eql([]);
      expect(res.body.length).to.eql(2);
      expect(res.body[1].url).to.eql(
        'https://www.youtube.com/watch?v=B7bqAsxee4I'
      );
    });
    it('should successfully remove current track after its duration passes', function(
      done
    ) {
      chai
        .request(server)
        .post('/v1/rooms/track-duration-test/queue')
        .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
        .send({
          url: 'https://www.youtube.com/watch?v=B7bqAsxee4I'
        })
        .then(res => {
          setTimeout(() => {
            chai
              .request(server)
              .get('/v1/rooms/track-duration-test')
              .then(res2 => {
                expect(res2.status).to.eql(200);
                expect(res2.body).to.have.property('currentTrack');
                expect(res2.body.currentTrack).to.be.null;
                done();
              });
          }, 5000);
        });
    });
    it('should fail to add track for non-existent room', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/rooms/nothing-here/queue')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
          .send({ url: 'https://www.youtube.com/watch?v=B7bqAsxee4I' });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(404);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql('Room with given id not found.');
      }
    });
    it('should fail to play a track with invalid access token', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/rooms/queue-test/queue')
          .set('Authorization', 'Bearer access')
          .send({ url: 'https://www.youtube.com/watch?v=B7bqAsxee4I' });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Missing Authorization header in the form: "Authorization: Bearer <jwt>"'
        );
      }
    });
    it('should fail to play a track from an invalid provider', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/rooms/queue-test/queue')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
          .send({ url: 'https://google.ca' });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql('Provider is not supported.');
      }
    });
  });

  describe('DELETE /rooms/:id/queue/:index', function() {
    it('should successfully remove a track from the queue', async function() {
      const res = await chai
        .request(server)
        .del('/v1/rooms/delete-test1/queue/0')
        .set('Authorization', `Bearer ${seed.userTokens['delete_test1']}`);
      expect(res.status).to.eql(204);
      expect(res.body).to.be.empty;
      const res2 = await chai.request(server).get('/v1/rooms/delete-test1');
      expect(res2.status).to.eql(200);
      expect(res2.body).to.have.property('queue');
      expect(res2.body.queue).to.be.empty;
    });
    it('should successfully remove a track from the middle of a queue', async function() {
      const res = await chai
        .request(server)
        .del('/v1/rooms/delete-test2/queue/1')
        .set('Authorization', `Bearer ${seed.userTokens['delete_test2']}`);
      expect(res.status).to.eql(204);
      expect(res.body).to.be.empty;
      const res2 = await chai.request(server).get('/v1/rooms/delete-test2');
      expect(res2.status).to.eql(200);
      expect(res2.body).to.have.property('queue');
      expect(res2.body.queue).to.not.be.empty;
      expect(res2.body.queue.length).to.eql(2);
    });
    it('should fail to remove when index is out of range', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/rooms/delete-test1/queue/1')
          .set('Authorization', `Bearer ${seed.userTokens['delete_test1']}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql('Track index out of range.');
      }
    });
    it('should fail to remove track from queue owned by different user', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/rooms/delete-test2/queue/0')
          .set('Authorization', `Bearer ${seed.userTokens['delete_test2']}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(403);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'You did not add this song to the queue.'
        );
      }
    });
    it('should fail to remove track for non-existent room', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/rooms/nothing-here/queue/0')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(404);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql('Room with given id not found.');
      }
    });
    it('should fail to remove track with invalid access token', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/rooms/queue-test/queue/0')
          .set('Authorization', 'Bearer access');
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Missing Authorization header in the form: "Authorization: Bearer <jwt>"'
        );
      }
    });
  });
});
