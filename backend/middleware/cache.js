import NodeCache from 'node-cache';

// stdTTL: time to live in seconds
const cache = new NodeCache({ stdTTL: 300, checkperiod: 120 });

export const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      console.error('Cannot cache non-GET methods!');
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.send(cachedResponse);
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
  const keys = cache.keys();
  for (const key of keys) {
    if (key.includes(keyPattern)) {
      cache.del(key);
    }
  }
};
