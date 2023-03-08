const { createClient } = require("redis");
const client = createClient();

async function connectRedis() {
  try {
    await client.connect();
    console.log("connect redis success");
  } catch (error) {
    console.log("connected redis faillure");
  }
}

module.exports = {connectRedis,client}