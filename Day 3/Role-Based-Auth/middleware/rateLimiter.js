import redisClient from "../redis/redis.js";

const rateLimiter = ({ windowState = 60, maxRequest = 10 }) => {
  return async (req, res, next) => {
    const identifier = req.ip;
    const key = `rate-limiter:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowState * 1000;

    try {
      const pipline = await redisClient.multi();

      // Remove Old Requests
      pipline.zRemRangeByScore(key, 0, windowStart);

      // Add current request timeout
      pipline.zAdd(key, {
        score: now,
        value: `${now}`,
      });

      // Count Request
      pipline.zCount(key, windowStart, now);

      // Expire the key after the window state
      pipline.expire(key, windowState);

      const [, , count] = await pipline.exec();
      if (count > maxRequest) {
        return res.status(429).json({
          message: "Too Many Requests",
        });
      }
      next();
    } catch (error) {}
  };
};

export default rateLimiter;
