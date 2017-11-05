import redis from 'redis';

class RedisService {
  constructor() {
    this.redis = redis.createClient({ host: process.env.REDIS_HOST });
  }

  set(key, value, expiration) {
    if (expiration) {
      this.redis.set(key, JSON.stringify(value), 'EX', expiration);
    } else {
      this.redis.set(key, JSON.stringify(value));
    }
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.redis.get(key, (err, res) => {
        if (err) {
          reject();
        } else {
          resolve(JSON.parse(res));
        }
      });
    });
  }

  del(key) {
    return new Promise((resolve, reject) => {
      this.redis.del(key, (err, res) => {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }
}

export default new RedisService();
