const imageCache = new Map();

const imageCacheManager = {
  set(key, url, ttlSeconds = 300) {
    imageCache.set(key, { url, expiresAt: Date.now() + ttlSeconds * 1000 });
  },

  get(key) {
    const data = imageCache.get(key);
    if (!data) return null;
    if (Date.now() > data.expiresAt) {
      imageCache.delete(key);
      return null;
    }
    return data.url;
  },

  delete(key) {
    imageCache.delete(key);
  },
};

export default imageCacheManager;
