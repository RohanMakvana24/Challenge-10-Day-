import redis from "redis";

const redisClient = redis.createClient({
    socket: {
        host: "127.0.0.1",
        port: 6379
    }
});

redisClient.on("error", (err) => {
    console.log(err);
});

redisClient.connect().then(() => {
    console.log("Connected To Redis");
});

export default redisClient;
