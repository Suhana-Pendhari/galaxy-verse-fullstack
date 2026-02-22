const NodeCache = require('node-cache');
const redis = require('redis');
const { promisify } = require('util');

class CacheService {
  constructor() {
    this.useRedis = process.env.REDIS_URL ? true : false;
    this.localCache = new NodeCache({ 
      stdTTL: 3600, // 1 hour default
      checkperiod: 600, // Check for expired keys every 10 minutes
      useClones: false,
    });

    if (this.useRedis) {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis max retries reached');
              return new Error('Redis max retries');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.useRedis = false; // Fallback to local cache
      });

      this.redisClient.on('connect', () => {
        console.log('Redis connected successfully');
      });

      // Connect to Redis
      this.redisClient.connect().catch(err => {
        console.error('Redis connection failed:', err);
        this.useRedis = false;
      });

      // Promisify Redis commands
      this.redisGet = promisify(this.redisClient.get).bind(this.redisClient);
      this.redisSet = promisify(this.redisClient.set).bind(this.redisClient);
      this.redisDel = promisify(this.redisClient.del).bind(this.redisClient);
    }

    // Cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} Cached value
   */
  async get(key) {
    try {
      let value;

      if (this.useRedis) {
        value = await this.redisClient.get(key);
        if (value) {
          this.stats.hits++;
          return JSON.parse(value);
        }
      } else {
        value = this.localCache.get(key);
        if (value) {
          this.stats.hits++;
          return value;
        }
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} Success status
   */
  async set(key, value, ttl = 3600) {
    try {
      if (this.useRedis) {
        await this.redisClient.set(key, JSON.stringify(value), {
          EX: ttl,
        });
      } else {
        this.localCache.set(key, value, ttl);
      }
      this.stats.sets++;
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Success status
   */
  async del(key) {
    try {
      if (this.useRedis) {
        await this.redisClient.del(key);
      } else {
        this.localCache.del(key);
      }
      this.stats.deletes++;
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   * @param {string} pattern - Key pattern
   * @returns {Promise<number>} Number of deleted keys
   */
  async delPattern(pattern) {
    try {
      if (this.useRedis) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
          this.stats.deletes += keys.length;
          return keys.length;
        }
        return 0;
      } else {
        const keys = this.localCache.keys().filter(key => 
          key.includes(pattern.replace('*', ''))
        );
        keys.forEach(key => this.localCache.del(key));
        this.stats.deletes += keys.length;
        return keys.length;
      }
    } catch (error) {
      console.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} Exists status
   */
  async has(key) {
    try {
      if (this.useRedis) {
        return await this.redisClient.exists(key) > 0;
      } else {
        return this.localCache.has(key);
      }
    } catch (error) {
      console.error(`Cache has error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get multiple values
   * @param {Array<string>} keys - Cache keys
   * @returns {Promise<Object>} Key-value pairs
   */
  async getMany(keys) {
    const result = {};
    for (const key of keys) {
      result[key] = await this.get(key);
    }
    return result;
  }

  /**
   * Set multiple values
   * @param {Object} entries - Key-value pairs
   * @param {number} ttl - Time to live
   * @returns {Promise<boolean>} Success status
   */
  async setMany(entries, ttl = 3600) {
    try {
      for (const [key, value] of Object.entries(entries)) {
        await this.set(key, value, ttl);
      }
      return true;
    } catch (error) {
      console.error('Cache set many error:', error);
      return false;
    }
  }

  /**
   * Get or set cache value
   * @param {string} key - Cache key
   * @param {Function} callback - Function to get value if not cached
   * @param {number} ttl - Time to live
   * @returns {Promise<any>} Cached or computed value
   */
  async remember(key, callback, ttl = 3600) {
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    const value = await callback();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Increment numeric value
   * @param {string} key - Cache key
   * @param {number} increment - Increment amount
   * @returns {Promise<number>} New value
   */
  async increment(key, increment = 1) {
    try {
      if (this.useRedis) {
        return await this.redisClient.incrBy(key, increment);
      } else {
        const value = (await this.get(key)) || 0;
        const newValue = value + increment;
        await this.set(key, newValue);
        return newValue;
      }
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Get cache TTL
   * @param {string} key - Cache key
   * @returns {Promise<number>} TTL in seconds
   */
  async getTTL(key) {
    try {
      if (this.useRedis) {
        return await this.redisClient.ttl(key);
      } else {
        return this.localCache.getTtl(key);
      }
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Update cache TTL
   * @param {string} key - Cache key
   * @param {number} ttl - New TTL
   * @returns {Promise<boolean>} Success status
   */
  async updateTTL(key, ttl) {
    try {
      if (this.useRedis) {
        await this.redisClient.expire(key, ttl);
        return true;
      } else {
        const value = await this.get(key);
        if (value) {
          this.localCache.set(key, value, ttl);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error(`Cache update TTL error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache
   * @returns {Promise<boolean>} Success status
   */
  async clear() {
    try {
      if (this.useRedis) {
        await this.redisClient.flushAll();
      } else {
        this.localCache.flushAll();
      }
      this.resetStats();
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache keys
   * @param {string} pattern - Key pattern
   * @returns {Promise<Array<string>>} Cache keys
   */
  async keys(pattern = '*') {
    try {
      if (this.useRedis) {
        return await this.redisClient.keys(pattern);
      } else {
        return this.localCache.keys();
      }
    } catch (error) {
      console.error('Cache keys error:', error);
      return [];
    }
  }

  /**
   * Get cache size
   * @returns {Promise<number>} Number of keys
   */
  async size() {
    try {
      if (this.useRedis) {
        const keys = await this.redisClient.keys('*');
        return keys.length;
      } else {
        return this.localCache.keys().length;
      }
    } catch (error) {
      console.error('Cache size error:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    return {
      ...this.stats,
      size: this.localCache.keys().length,
      hitRate: this.stats.hits + this.stats.misses > 0 
        ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(2) + '%'
        : '0%',
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
    };
  }

  /**
   * Tag-based cache invalidation
   * @param {string} tag - Cache tag
   * @param {Array<string>} keys - Keys to tag
   */
  async tag(tag, keys) {
    const tagKey = `tag:${tag}`;
    const existing = await this.get(tagKey) || [];
    const uniqueKeys = [...new Set([...existing, ...keys])];
    await this.set(tagKey, uniqueKeys);
  }

  /**
   * Invalidate cache by tag
   * @param {string} tag - Cache tag
   * @returns {Promise<number>} Number of deleted keys
   */
  async invalidateTag(tag) {
    const tagKey = `tag:${tag}`;
    const keys = await this.get(tagKey) || [];
    
    if (keys.length > 0) {
      await this.del(keys);
      await this.del(tagKey);
    }
    
    return keys.length;
  }

  /**
   * Get or set with tags
   * @param {string} key - Cache key
   * @param {Array<string>} tags - Cache tags
   * @param {Function} callback - Function to get value
   * @param {number} ttl - Time to live
   * @returns {Promise<any>} Cached or computed value
   */
  async rememberWithTags(key, tags, callback, ttl = 3600) {
    const value = await this.remember(key, callback, ttl);
    
    for (const tag of tags) {
      await this.tag(tag, [key]);
    }
    
    return value;
  }

  /**
   * Check if cache is healthy
   * @returns {Promise<boolean>} Health status
   */
  async isHealthy() {
    try {
      if (this.useRedis) {
        await this.redisClient.ping();
        return true;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get cache info
   * @returns {Promise<Object>} Cache information
   */
  async getInfo() {
    return {
      driver: this.useRedis ? 'redis' : 'local',
      size: await this.size(),
      stats: this.getStats(),
      healthy: await this.isHealthy(),
    };
  }
}

module.exports = new CacheService();
