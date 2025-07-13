import redis from "redis";

const redisClient = redis.createClient();

redisClient.on("error", (err) => {
  console.log(err);
});

redisClient.connect().then(() => {
  console.log("Connected To Redis");
});

export default redisClient;
