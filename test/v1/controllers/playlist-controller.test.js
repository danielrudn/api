import mocha from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../src/index.js';
import seed from '../../fixtures/seed';

chai.use(chaiHttp);
const expect = chai.expect;

describe('PlaylistController', function() {
  describe('GET /playlists/:id', function() {
    it('should successfully get a public playlist', async function() {
      const res = await chai.request(server).get('/v1/playlists/222');
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('name');
      expect(res.body.name).to.eql('Test Playlist 1');
      expect(res.body).to.have.property('visibility');
      expect(res.body.visibility).to.eql('public');
      expect(res.body).to.have.property('creator');
      expect(res.body.creator.id).to.eql('playlist_creator_1');
      expect(res.body.creator.username).to.eql('pc1');
      expect(res.body).to.have.property('trackCount');
      expect(res.body.trackCount).to.eql(0);
      expect(res.body).to.have.property('tracks');
      expect(res.body.tracks).to.be.empty;
    });
    it('should successfully get a private playlist when creator', async function() {
      const res = await chai
        .request(server)
        .get('/v1/playlists/333')
        .set(
          'Authorization',
          `Bearer ${seed.userTokens['playlist_creator_2']}`
        );
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('name');
      expect(res.body.name).to.eql('Test Playlist 2');
      expect(res.body).to.have.property('visibility');
      expect(res.body.visibility).to.eql('private');
      expect(res.body).to.have.property('creator');
      expect(res.body.creator.id).to.eql('playlist_creator_2');
      expect(res.body.creator.username).to.eql('pc2');
      expect(res.body).to.have.property('trackCount');
      expect(res.body.trackCount).to.eql(1);
      expect(res.body).to.have.property('tracks');
      expect(res.body.tracks.length).to.eql(1);
      expect(res.body.tracks[0].id).to.eql(333);
    });
    it('should fail to get a private playlist when not creator', async function() {
      try {
        const res = await chai.request(server).get('/v1/playlists/333');
        throw res;
      } catch (err) {
        expect(err.status).to.eql(404);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Playlist with given id not found.'
        );
      }
    });
    it('should fail to get a non-existent playlist', async function() {
      try {
        const res = await chai.request(server).get('/v1/playlists/0');
        throw res;
      } catch (err) {
        expect(err.status).to.eql(404);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Playlist with given id not found.'
        );
      }
    });
  });
  describe('POST /playlists', function() {
    it('should successfully create a public playlist', async function() {
      const res = await chai
        .request(server)
        .post('/v1/playlists')
        .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
        .send({ name: 'My Test Playlist', visibility: 'public' });
      expect(res.status).to.eql(201);
      expect(res.body).to.have.property('name');
      expect(res.body.name).to.eql('My Test Playlist');
      expect(res.body).to.have.property('visibility');
      expect(res.body.visibility).to.eql('public');
      expect(res.body).to.have.property('creator');
      expect(res.body.creator.id).to.eql('11111111-111-11111111');
      expect(res.body.creator.username).to.eql('tester');
      expect(res.body).to.have.property('trackCount');
      expect(res.body.trackCount).to.eql(0);
      expect(res.body).to.have.property('tracks');
      expect(res.body.tracks).to.be.empty;
    });
    it('should successfully create a private playlist', async function() {
      const res = await chai
        .request(server)
        .post('/v1/playlists')
        .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
        .send({ name: 'My Private Playlist', visibility: 'private' });
      expect(res.status).to.eql(201);
      expect(res.body).to.have.property('name');
      expect(res.body.name).to.eql('My Private Playlist');
      expect(res.body).to.have.property('visibility');
      expect(res.body.visibility).to.eql('private');
      expect(res.body).to.have.property('creator');
      expect(res.body.creator.id).to.eql('11111111-111-11111111');
      expect(res.body.creator.username).to.eql('tester');
      expect(res.body).to.have.property('trackCount');
      expect(res.body.trackCount).to.eql(0);
      expect(res.body).to.have.property('tracks');
      expect(res.body.tracks).to.be.empty;
    });
    it('should successfully create public playlist when visibility is not provided', async function() {
      const res = await chai
        .request(server)
        .post('/v1/playlists')
        .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
        .send({ name: 'My Valid Playlist' });
      expect(res.status).to.eql(201);
      expect(res.body).to.have.property('name');
      expect(res.body.name).to.eql('My Valid Playlist');
      expect(res.body).to.have.property('visibility');
      expect(res.body.visibility).to.eql('public');
      expect(res.body).to.have.property('creator');
      expect(res.body.creator.id).to.eql('11111111-111-11111111');
      expect(res.body.creator.username).to.eql('tester');
      expect(res.body).to.have.property('trackCount');
      expect(res.body.trackCount).to.eql(0);
      expect(res.body).to.have.property('tracks');
      expect(res.body.tracks).to.be.empty;
    });
    it('should fail to create a playlist when this user already has a playlist with the same name', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/playlists')
          .set(
            'Authorization',
            `Bearer ${seed.userTokens['playlist_creator_2']}`
          )
          .send({ name: 'Test Playlist 2', visibility: 'public' });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'You already have a playlist with that name.'
        );
      }
    });
    it('should fail to create playlist with invalid visibility', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/playlists')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
          .send({ name: 'Valid Playlist Name', visibility: 'invalid' });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Playlist visibility must be one of: ["public", "private"].'
        );
      }
    });
    it('should fail to create playlist with missing/short name', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/playlists')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
          .send({ name: '', visibility: 'public' });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Playlist name must be between 1 and 30 characters.'
        );
      }
    });
    it('should fail to create playlist with long name', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/playlists')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
          .send({
            name: 'This is a very long playlist name',
            visibility: 'public'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Playlist name must be between 1 and 30 characters.'
        );
      }
    });
    it('should fail to create a playlist as a guest', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/playlists')
          .set('Authorization', `Bearer ${seed.tokens.guestAccessToken}`)
          .send({ name: 'Valid Playlist Name', visibility: 'public' });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(403);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Guests are not able to create playlists.'
        );
      }
    });
    it('should fail to create playlist with missing access token', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/playlists')
          .send({ name: 'Valid Playlist Name', visibility: 'public' });
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
  describe('POST /playlists/:id', function() {
    it('should successfully add a track to a public playlist as creator', async function() {
      const res = await chai
        .request(server)
        .post('/v1/playlists/444')
        .set('Authorization', `Bearer ${seed.userTokens['add_track_test_1']}`)
        .send({ url: 'https://www.youtube.com/watch?v=B7bqAsxee4I' });
      expect(res.status).to.eql(201);
    });
    it('should successfully add a track to a private playlist as creator', async function() {
      const res = await chai
        .request(server)
        .post('/v1/playlists/555')
        .set('Authorization', `Bearer ${seed.userTokens['add_track_test_2']}`)
        .send({
          url:
            'https://soundcloud.com/droplexofficial/droplex-bangara-original-mix-out'
        });
      expect(res.status).to.eql(201);
    });
    it('should fail to add a track to a non-existent playlist', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/playlists/0')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
          .send({ url: 'https://www.youtube.com/watch?v=B7bqAsxee4I' });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(404);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Playlist with given id not found.'
        );
      }
    });
    it('should fail to add a track to a public playlist when not creator', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/playlists/444')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
          .send({ url: 'https://www.youtube.com/watch?v=B7bqAsxee4I' });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(403);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Must be the creator of this playlist.'
        );
      }
    });
    it('should fail to add a track to a private playlist when not creator', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/playlists/555')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`)
          .send({ url: 'https://www.youtube.com/watch?v=B7bqAsxee4I' });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(404);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Playlist with given id not found.'
        );
      }
    });
  });

  describe('DELETE /playlists/:id/:trackId', function() {
    it('should successfully delete a track from a public playlist as creator', async function() {
      const res = await chai
        .request(server)
        .del('/v1/playlists/666/333')
        .set('Authorization', `Bearer ${seed.userTokens['del_track_test_1']}`);
      expect(res.status).to.eql(204);
      expect(res.body).to.be.empty;
      const res2 = await chai.request(server).get('/v1/playlists/666');
      expect(res2.status).to.eql(200);
      expect(res2.body).to.have.property('visibility');
      expect(res2.body.visibility).to.eql('public');
      expect(res2.body).to.have.property('trackCount');
      expect(res2.body.trackCount).to.eql(0);
      expect(res2.body).to.have.property('tracks');
      expect(res2.body.tracks).to.be.empty;
    });
    it('should successfully delete a track from a private playlist as creator', async function() {
      const res = await chai
        .request(server)
        .del('/v1/playlists/777/333')
        .set('Authorization', `Bearer ${seed.userTokens['del_track_test_2']}`);
      expect(res.status).to.eql(204);
      expect(res.body).to.be.empty;
      const res2 = await chai
        .request(server)
        .get('/v1/playlists/777')
        .set('Authorization', `Bearer ${seed.userTokens['del_track_test_2']}`);
      expect(res2.status).to.eql(200);
      expect(res2.body).to.have.property('visibility');
      expect(res2.body.visibility).to.eql('private');
      expect(res2.body).to.have.property('trackCount');
      expect(res2.body.trackCount).to.eql(0);
      expect(res2.body).to.have.property('tracks');
      expect(res2.body.tracks).to.be.empty;
    });
    it('should fail to delete a track that a playlist does not have', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/playlists/333/0')
          .set(
            'Authorization',
            `Bearer ${seed.userTokens['playlist_creator_2']}`
          );
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql('Track not in playlist.');
      }
    });
    it('should fail to delete a track from a non-existent playlist', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/playlists/0/1')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`);
      } catch (err) {
        expect(err.status).to.eql(404);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Playlist with given id not found.'
        );
      }
    });
    it('should fail to delete a track from a public playlist when not creator', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/playlists/666/1')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(403);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Must be the creator of this playlist.'
        );
      }
    });
    it('should fail to delete a track from a private playlist when not creator', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/playlists/777/1')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(404);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Playlist with given id not found.'
        );
      }
    });
  });
  describe('DELETE /playlists/:id', function() {
    it('should successfully delete an empty playlist', async function() {
      const res = await chai
        .request(server)
        .del('/v1/playlists/888')
        .set(
          'Authorization',
          `Bearer ${seed.userTokens['del_playlist_test_1']}`
        );
      expect(res.status).to.eql(204);
      expect(res.body).to.be.empty;
    });
    it('should successfully delete a non-empty playlist', async function() {
      const res = await chai
        .request(server)
        .del('/v1/playlists/999')
        .set(
          'Authorization',
          `Bearer ${seed.userTokens['del_playlist_test_2']}`
        );
      expect(res.status).to.eql(204);
      expect(res.body).to.be.empty;
    });
    it('should fail to delete a non-existent playlist', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/playlists/0')
          .set('Authorization', `Bearer ${seed.tokens.accessToken}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(404);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Playlist with given id not found.'
        );
      }
    });
    it('should fail to delete a public playlist when not creator', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/playlists/444')
          .set('Authorization', `Bearer ${seed.tokens.guestAccessToken}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(403);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Must be the creator of this playlist.'
        );
      }
    });
    it('should fail to delete a private playlist when not creator', async function() {
      try {
        const res = await chai
          .request(server)
          .del('/v1/playlists/333')
          .set('Authorization', `Bearer ${seed.tokens.guestAccessToken}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(404);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Playlist with given id not found.'
        );
      }
    });
    it('should fail to delete playlist when missing access token', async function() {
      try {
        const res = await chai.request(server).del('/v1/playlists/444');
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
