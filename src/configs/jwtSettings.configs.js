require('dotenv').config()

module.exports = {
    SECRET: process.env.KEY_TOKEN,
    AUDIENCE: 'aptech.io',
    ISSUER: 'softech.cloud',
    WHITE_LIST: ['tungnt@softech.vn', '1@gmail.com'],
  }; 