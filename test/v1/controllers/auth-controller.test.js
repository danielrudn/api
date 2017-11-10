import mocha from 'mocha';
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../src/index.js';
import seed from '../../fixtures/seed';

chai.use(chaiHttp);
const expect = chai.expect;

describe('AuthController', function() {
  describe('POST /auth', function() {
    it('should create a guest user', async function() {
      const res = await chai.request(server).post('/v1/auth');
      expect(res.status).to.eql(201);
      expect(res.body).to.have.property('accessToken');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('id');
      expect(res.body.user).to.have.property('username');
      expect(res.body.user.username).to.match(/^guest_[0-9]+$/);
      expect(res.body.user).to.have.property('isGuest');
      expect(res.body.user.isGuest).to.eql(true);
    });
    it('should register a new user', async function() {
      const res = await chai
        .request(server)
        .post('/v1/auth')
        .send({
          username: 'hello',
          email: 'hello@ripple.fm',
          password: 'password'
        });
      expect(res.status).to.eql(201);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.eql(
        "Account Created. We've sent an email to you containing activation instructions."
      );
    });
    it('should fail to register a new user due to existing username', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth')
          .send({
            username: 'tester',
            email: 'unique@ripple.fm',
            password: 'password'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'User with given username already exists.'
        );
      }
    });
    it('should fail to register a new user due to existing email', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth')
          .send({
            username: 'unique',
            email: 'test@ripple.fm',
            password: 'password'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'User with given email already exists.'
        );
      }
    });
    it('should fail to register a new user due to invalid username', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth')
          .send({
            username: '333',
            email: 'unique@ripple.fm',
            password: 'password'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Username must start with a letter and end with an alphanumeric character.'
        );
      }
    });
    it('should fail to register a new user due to empty username', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth')
          .send({
            username: '',
            email: 'unique@ripple.fm',
            password: 'password'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Username must be between 3 and 16 characters.'
        );
      }
    });
    it('should fail to register a new user due to invalid email', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth')
          .send({
            username: 'unique',
            email: 'unique',
            password: 'password'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'The email provided is invalid.'
        );
      }
    });
    it('should fail to register a new user due to empty email', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth')
          .send({
            username: 'unique',
            email: '',
            password: 'password'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'The email provided is invalid.'
        );
      }
    });
    it('should fail to register a new user due to invalid password', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth')
          .send({
            username: 'unique',
            email: 'unique@ripple.fm',
            password: 'pass'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Password must be between 8 and 128 characters.'
        );
      }
    });
    it('should fail to register a new user due to empty password', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth')
          .send({
            username: 'unique',
            email: 'unique@ripple.fm',
            password: ''
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Password must be between 8 and 128 characters.'
        );
      }
    });
    it('should fail to register an existing, unactivated account.', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth')
          .send({
            username: 'tester2',
            email: 'test2@ripple.fm',
            password: 'password'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'User with given email already exists.'
        );
      }
    });
  });

  describe('POST /auth/activate', function() {
    it('should successfully activate an account', async function() {
      const res = await chai
        .request(server)
        .post('/v1/auth/activate')
        .send({ token: seed.activationToken });
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('user');
      expect(res.body).to.have.property('accessToken');
      expect(res.body).to.have.property('refreshToken');
      expect(res.body.user).to.have.property('id');
      expect(res.body.user).to.have.property('email');
      expect(res.body.user).to.have.property('username');
    });
    it('should fail to activate an account', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth/activate')
          .send({ token: 'bad token' });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          "The token provided has either expired or doesn't exist."
        );
      }
    });
  });

  describe('POST /auth/login', function() {
    it('should successfully login to an existing account with username', async function() {
      const res = await chai
        .request(server)
        .post('/v1/auth/login')
        .send({
          emailOrUsername: 'tester',
          password: 'password'
        });
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('user');
      expect(res.body).to.have.property('accessToken');
      expect(res.body).to.have.property('refreshToken');
      expect(res.body.user).to.have.property('id');
      expect(res.body.user).to.have.property('email');
      expect(res.body.user.email).to.eql('test@ripple.fm');
      expect(res.body.user).to.have.property('username');
      expect(res.body.user.username).to.eql('tester');
    });
    it('should successfully login to an existing account with email', async function() {
      const res = await chai
        .request(server)
        .post('/v1/auth/login')
        .send({
          emailOrUsername: 'test@ripple.fm',
          password: 'password'
        });
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('user');
      expect(res.body).to.have.property('accessToken');
      expect(res.body).to.have.property('refreshToken');
      expect(res.body.user).to.have.property('id');
      expect(res.body.user).to.have.property('email');
      expect(res.body.user.email).to.eql('test@ripple.fm');
      expect(res.body.user).to.have.property('username');
      expect(res.body.user.username).to.eql('tester');
    });
    it('should fail to login to existing account with wrong password', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth/login')
          .send({
            emailOrUsername: 'test@ripple.fm',
            password: 'secret'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Username/email or password is incorrect.'
        );
      }
    });
    it('should fail to login to non-existent account', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth/login')
          .send({
            emailOrUsername: 'unique@ripple.fm',
            password: 'password'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Username/email or password is incorrect.'
        );
      }
    });
    it('should fail to login to unactivated account', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth/login')
          .send({
            emailOrUsername: 'test2@ripple.fm',
            password: 'password'
          });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql('Account is not activated.');
      }
    });
  });

  describe('POST /auth/refresh', function() {
    it('should successfully refresh an access token', async function() {
      const res = await chai
        .request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: seed.refreshToken });
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('user');
      expect(res.body).to.have.property('accessToken');
      expect(res.body).to.have.property('refreshToken');
      expect(res.body.refreshToken).to.not.eql(seed.refreshToken);
      expect(res.body.user).to.have.property('id');
      expect(res.body.user).to.have.property('email');
      expect(res.body.user).to.have.property('username');
    });
    it('should fail to refresh an access token due to user updated after token iat date', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth/refresh')
          .send({ refreshToken: seed.oldRefreshToken });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'This user has been updated since their last login. Please login again.'
        );
      }
    });
    it('should fail to refresh an access token due to invalid refresh token', async function() {
      try {
        const res = await chai.request(server).post('/v1/auth/refresh');
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          "The token provided has either expired or doesn't exist."
        );
      }
    });
  });

  describe('POST /auth/forgot', function() {
    it('should request a password reset for an existing account', async function() {
      const res = await chai
        .request(server)
        .post('/v1/auth/forgot')
        .send({
          email: 'test@ripple.fm'
        });
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.eql(
        'If an account for "test@ripple.fm" exists, an email to reset the password has been sent.'
      );
    });
    it('should request a password reset for a non-existent account', async function() {
      const res = await chai
        .request(server)
        .post('/v1/auth/forgot')
        .send({
          email: 'unique@ripple.fm'
        });
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.eql(
        'If an account for "unique@ripple.fm" exists, an email to reset the password has been sent.'
      );
    });
    it('should request a password reset for an empty email', async function() {
      const res = await chai.request(server).post('/v1/auth/forgot');
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.eql(
        'If an account for "" exists, an email to reset the password has been sent.'
      );
    });
  });

  describe('POST /auth/reset/:token', function() {
    it('should successfully reset a users password and login with new password', async function() {
      const res = await chai
        .request(server)
        .post(`/v1/auth/reset/${seed.resetToken}`)
        .send({ password: 'passwordnew' });
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('message');
      expect(res.body.message).to.eql(
        'Password updated. Login with new password.'
      );
      const res2 = await chai
        .request(server)
        .post('/v1/auth/login')
        .send({ emailOrUsername: 'reset', password: 'passwordnew' });
      expect(res2.status).to.eql(200);
      expect(res2.body).to.have.property('accessToken');
      expect(res2.body).to.have.property('refreshToken');
      expect(res2.body).to.have.property('user');
    });
    it('should fail to reset a password due to invalid password', async function() {
      try {
        const res = await chai
          .request(server)
          .post(`/v1/auth/reset/${seed.refreshToken2}`)
          .send({ password: 's' });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(400);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Password must be between 8 and 128 characters.'
        );
      }
    });
    it('should fail to reset a password due to invalid token', async function() {
      try {
        const res = await chai
          .request(server)
          .post('/v1/auth/reset/invalid')
          .send({ password: 'passwordnew' });
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          "The token provided has either expired or doesn't exist."
        );
      }
    });
  });

  describe('GET /auth/me', function() {
    it('should successfully validate registered user access token', async function() {
      const res = await chai
        .request(server)
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${seed.accessToken}`);
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('email');
      expect(res.body.email).to.eql('test@ripple.fm');
      expect(res.body).to.have.property('username');
      expect(res.body.username).to.eql('tester');
      expect(res.body).to.have.property('activated');
      expect(res.body.activated).to.eql(true);
      expect(res.body).to.have.property('isGuest');
      expect(res.body.isGuest).to.eql(false);
      expect(res.body).not.to.have.property('password');
    });
    it('should successfully validate guest access token', async function() {
      const res = await chai
        .request(server)
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${seed.guestAccessToken}`);
      expect(res.status).to.eql(200);
      expect(res.body).to.have.property('username');
      expect(res.body.username).to.eql('guest_1111');
      expect(res.body).to.have.property('activated');
      expect(res.body.activated).to.eql(false);
      expect(res.body).to.have.property('isGuest');
      expect(res.body.isGuest).to.eql(true);
      expect(res.body).not.to.have.property('password');
    });
    it('should reject a missing authorization header', async function() {
      try {
        const res = await chai.request(server).get('/v1/auth/me');
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql(
          'Missing Authorization header in the form: "Authorization: Bearer <jwt>"'
        );
      }
    });
    it('should reject an invalid access token', async function() {
      try {
        const res = await chai
          .request(server)
          .get('/v1/auth/me')
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
    it('should reject an unactivated account', async function() {
      try {
        const res = await chai
          .request(server)
          .get('/v1/auth/me')
          .set('Authorization', `Bearer ${seed.userTokens['unactivated']}`);
        throw res;
      } catch (err) {
        expect(err.status).to.eql(401);
        expect(err.response.body).to.have.property('error');
        expect(err.response.body.error).to.eql('Account is not activated.');
      }
    });
  });
});
