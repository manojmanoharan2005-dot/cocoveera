import NodeCache from 'node-cache';

// stdTTL: time to live in seconds
const cache = new NodeCache({ stdTTL: 120, checkperiod: 60 });

export const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.setHeader('X-Cache', 'HIT');
      return res.send(cachedResponse);
    } else {
      res.originalSend = res.send;
      res.send = (body) => {
        res.originalSend(body);
        cache.set(key, body, duration);
      };
      next();
    }
  };
};

export const clearCache = (keyPattern) => {
  if (!keyPattern) {
    cache.flushAll();
    return;
  }
  const keys = cache.keys();
  for (const key of keys) {
    if (key.includes(keyPattern) || keyPattern.includes(key)) {
      cache.del(key);
    }
  }
  // Always flush all cache on product or category admin updates to guarantee 100% fresh data
  if (keyPattern.includes('product') || keyPattern.includes('categor')) {
    cache.flushAll();
  }
};
