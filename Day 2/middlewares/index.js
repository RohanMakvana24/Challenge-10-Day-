import redisClient from "../redis/redisClient.js";
export const rateLimiter = ({ windowSize = 10, maxRequests = 2 }) => {
  return async (req, res, next) => {
    const identifier = req.ip;
    const key = `rate:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowSize * 1000;
    try {
      const pipeline = redisClient.multi();

      // Remove old Request
      pipeline.zRemRangeByScore(key, 0, windowStart);

      // add curent request timeout
      pipeline.zAdd(key, {
        score: now,
        value: `${now}`,
      });

      // Count how many requests remain within this window
      pipeline.zCount(key, windowStart, now);

      // Set key expiration for auto cleanup
      pipeline.expire(key, windowSize);

      const [, , count] = await pipeline.exec();

      if (count > maxRequests) {
        return res.status(429).json({
          message: `Rate limit exceeded. Try again later.`,
        });
      }
      next();
    } catch (error) {
      console.log(error);
    }
  };
};
