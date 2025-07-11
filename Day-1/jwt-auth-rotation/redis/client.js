import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: "127.0.0.1",
    port: 6379,
  },
});

redisClient.on("error", (err) => {
  console.log("Redis Error", err);
});

redisClient
  .connect()
  .then(() => console.log("Redis Connected"))
  .catch(console.error());

export default redisClient;
