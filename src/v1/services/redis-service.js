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

  lpop(key) {
    return new Promise((resolve, reject) => {
      this.redis.lpop(key, (err, res) => {
        if (err) {
          reject();
        } else {
          resolve(JSON.parse(res));
        }
      });
    });
  }

  rpush(key, value) {
    return new Promise((resolve, reject) => {
      this.redis.rpush(key, JSON.stringify(value), (err, res) => {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }

  llen(key) {
    return new Promise((resolve, reject) => {
      this.redis.llen(key, (err, res) => {
        if (err) {
          reject();
        } else {
          resolve(res);
        }
      });
    });
  }

  lrange(key, start = 0, stop = -1) {
    return new Promise((resolve, reject) => {
      this.redis.lrange(key, start, stop, (err, res) => {
        if (err) {
          reject();
        } else {
          resolve(res.map(obj => JSON.parse(obj)));
        }
      });
    });
  }

  lindex(key, index) {
    return new Promise((resolve, reject) => {
      this.redis.lindex(key, index, (err, res) => {
        if (err) {
          reject();
        } else {
          resolve(JSON.parse(res));
        }
      });
    });
  }

  lset(key, index, value) {
    return new Promise((resolve, reject) => {
      this.redis.lset(key, index, JSON.stringify(value), (err, res) => {
        if (err) {
          reject();
        } else {
          resolve();
        }
      });
    });
  }

  lrem(key, value, count = 0) {
    return new Promise((resolve, reject) => {
      this.redis.lrem(key, count, JSON.stringify(value), (err, res) => {
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
