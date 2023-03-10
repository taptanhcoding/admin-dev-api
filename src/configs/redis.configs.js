const { createClient } = require("redis");
const client = createClient({
  socket:{
    host:"redis-11367.c292.ap-southeast-1-1.ec2.cloud.redislabs.com",
    port: "11367"
  },
  password: "ReWGYAjycA4USGVCq0Cem5R34M8Mkz0g"
});

async function connectRedis() {
  try {
    await client.connect();
    console.log("connect redis success");
  } catch (error) {
    console.log("connected redis faillure");
  }
}

module.exports = {connectRedis,client}