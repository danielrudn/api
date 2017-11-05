import uuidV4 from 'uuid/v4';
import geoip from 'geoip-lite';
import TokenService from './token-service';
import models from '../../models';
import { BadUserCredentialsError } from '../errors';

class UserService {
  __hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  __generateGuest(fingerprint, ip) {
    const id = fingerprint.hash;
    const username = `guest_${Math.abs(this.__hashCode(id))}`.substring(0, 16);
    const city = this.getCityByIP(ip);
    return { id, city, username, isGuest: true };
  }

  getCityByIP(ip) {
    const data = geoip.lookup(ip);
    return data ? data.city : 'Toronto';
  }

  async createGuest(fingerprint, ip) {
    const guest = this.__generateGuest(fingerprint, ip);
    let user = await models.User.find({ where: { id: guest.id } });
    if (user) {
      await user.update(guest);
    } else {
      user = await models.User.create(guest);
    }
    const token = TokenService.signToken(guest);
    return {
      accessToken: token,
      user: guest
    };
  }

  async createUser(email, username, password, ip) {
    const id = uuidV4();
    const city = this.getCityByIP(ip);
    const user = await models.User.create({
      id,
      email,
      username,
      password,
      city
    });
    const accessToken = TokenService.signToken({ id, username, city }, '30m');
    return { accessToken, user: { id, username, email, city } };
  }

  async activateUser(token) {
    const verified = await TokenService.verifyOneUseToken(token);
    const rows = await models.User.update(
      { activated: true },
      { where: { id: verified.id }, returning: true }
    );
    return rows[1][0];
  }

  async findByEmailOrUsername(emailOrUsername) {
    const user = await models.User.findOne({
      where: {
        $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
      }
    });
    if (user === null) {
      throw BadUserCredentialsError();
    }
    return user;
  }

  async findById(id) {
    const user = await models.User.findById(id);
    if (user === null) {
      throw BadUserCredentialsError();
    }
    return user;
  }

  async findByEmail(email) {
    const user = await models.User.find({ where: { email } });
    if (user === null) {
      throw BadUserCredentialsError();
    }
    return user;
  }
}

export default new UserService();
