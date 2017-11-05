import jwt from 'jsonwebtoken';
import RedisService from './redis-service';
import { BadTokenError } from '../errors';

const { JWT_SECRET } = process.env;
const ONE_USE_SECRET = `${JWT_SECRET}ONCE`;

class TokenService {
  signToken(data, expiresIn, secret = JWT_SECRET) {
    let expire = '1d';
    if (expiresIn) {
      expire = expiresIn;
    }

    if (typeof data !== 'string') {
      return jwt.sign(data, secret, { expiresIn: expire });
    }
    return jwt.sign(data, secret);
  }

  signOneUseToken(data, expiresIn, customIAT = Date.now()) {
    const expire = expiresIn || '365d';
    data.iat = customIAT;
    const token = this.signToken(data, expire, ONE_USE_SECRET);
    RedisService.set(
      `token:${token}`,
      data,
      Number(expire.replace(/[^0-9]/g, '')) * 86400
    );
    return token;
  }

  verifyToken(token, secret = JWT_SECRET) {
    try {
      return jwt.verify(token, secret);
    } catch (err) {
      return false;
    }
  }

  async verifyOneUseToken(token) {
    try {
      const dbToken = await RedisService.get(`token:${token}`);
      if (dbToken === null) {
        throw BadTokenError();
      }
      await RedisService.del(`token:${token}`);
      if (this.verifyToken(token, ONE_USE_SECRET)) {
        return dbToken;
      } else {
        throw BadTokenError();
      }
    } catch (err) {
      throw BadTokenError();
    }
  }
}

export default new TokenService();
